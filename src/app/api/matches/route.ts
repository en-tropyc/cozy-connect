import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getUserProfile, 
  getProfileById, 
  createMatch, 
  getUserMatches,
  getProfilesByIds,
  base,
  MATCHES_TABLE_ID
} from '@/lib/airtable';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile
    const userProfile = await getUserProfile(session.user.email);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get all matches
    const matches = await getUserMatches(userProfile.id);
    
    // Extract unique profile IDs and create a map of match details
    const matchDetailsMap = new Map();
    const matchedProfileIds = [...new Set(matches.map(match => {
      const swiper = match.fields.Swiper as string;
      const swiped = match.fields.Swiped as string;
      const otherUserId = swiper === userProfile.id ? swiped : swiper;
      
      // Store match details for each profile
      matchDetailsMap.set(otherUserId, {
        matchId: match.id,
        matchStatus: match.fields.Status
      });
      
      return otherUserId;
    }))];

    // Get all matched profiles efficiently using the new utility
    const matchedProfiles = await getProfilesByIds(matchedProfileIds);

    return NextResponse.json({
      success: true,
      matches: matchedProfiles.map(profile => ({
        id: profile.id,
        name: profile.fields['Name 名子'],
        email: profile.fields['Email 電子信箱'],
        picture: profile.fields['Picture 照片'],
        companyTitle: profile.fields['Company/Title 公司職稱'],
        location: profile.fields['🌏 Where are you from? 你從哪裡來？'],
        shortIntro: profile.fields['Short intro 簡短介紹自己'],
        linkedinLink: profile.fields['LinkedIn Link'],
        instagram: profile.fields['Instagram'],
        ...matchDetailsMap.get(profile.id)
      }))
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { swipedProfileId } = await request.json();
    if (!swipedProfileId) {
      return NextResponse.json(
        { success: false, error: 'Missing swipedProfileId' },
        { status: 400 }
      );
    }

    // Get both profiles in parallel
    const [userProfile, swipedProfile] = await Promise.all([
      getUserProfile(session.user.email),
      getProfileById(swipedProfileId)
    ]);

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (!swipedProfile) {
      return NextResponse.json(
        { success: false, error: 'Swiped profile not found' },
        { status: 404 }
      );
    }

    // Create match
    const match = await createMatch(userProfile.id, swipedProfileId);

    return NextResponse.json({ 
      success: true,
      matchId: match.id
    });

  } catch (error: any) {
    console.error('Error creating match:', {
      message: error.message,
      status: error.statusCode,
      type: error.error
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create match',
        details: error.error,
        statusCode: error.statusCode || 500
      },
      { status: error.statusCode || 500 }
    );
  }
}

// Add this new function to update match status
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { matchId, status } = await request.json();
    if (!matchId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing matchId or status' },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be "accepted" or "rejected"' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await getUserProfile(session.user.email);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Update match status
    if (!base) throw new Error('Airtable base not initialized');
    
    const match = await base(MATCHES_TABLE_ID).update([
      {
        id: matchId,
        fields: {
          Status: status
        }
      }
    ]);

    return NextResponse.json({ 
      success: true,
      match: match[0]
    });

  } catch (error: any) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update match',
        details: error.error,
        statusCode: error.statusCode || 500
      },
      { status: error.statusCode || 500 }
    );
  }
} 
