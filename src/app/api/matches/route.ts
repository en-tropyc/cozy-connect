import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Airtable from 'airtable';
import { authOptions } from '@/lib/auth';

const MATCHES_TABLE_ID = 'tbl4jHhNHZVBhP4Up';
const PROFILES_TABLE_ID = 'tbl9Jj8pIUABtsXRo';  // Use the table ID instead of name

// Define field names as constants to ensure consistency
const FIELD_NAMES = {
  SWIPER: 'Swiper',
  SWIPED: 'Swiped',
  STATUS: 'Status'
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const airtable = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY,
      endpointUrl: 'https://api.airtable.com',
    });

    const base = airtable.base(process.env.AIRTABLE_BASE_ID || '');
    
    // First get the current user's profile
    const userProfiles = await base('Profiles')
      .select({
        filterByFormula: `{Email 電子信箱} = '${session.user.email}'`,
        maxRecords: 1
      })
      .firstPage();

    if (userProfiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const userProfile = userProfiles[0];

    // Try to get matches table info and log its schema
    try {
      console.log('Attempting to access Matches table...');
      const matchesTableInfo = await base(MATCHES_TABLE_ID).select({ maxRecords: 1 }).firstPage();
      console.log('Matches table exists:', !!matchesTableInfo);
      console.log('API Key used:', process.env.AIRTABLE_API_KEY?.substring(0, 10) + '...');
      console.log('Base ID:', process.env.AIRTABLE_BASE_ID);
      console.log('Table ID:', MATCHES_TABLE_ID);
      
      // Try to create a test record to verify permissions
      try {
        const testRecord = await base(MATCHES_TABLE_ID).create([
          {
            fields: {
              [FIELD_NAMES.SWIPER]: userProfile.id,
              [FIELD_NAMES.SWIPED]: userProfile.id,
              [FIELD_NAMES.STATUS]: 'test'
            }
          }
        ]);
        console.log('Test record created successfully:', testRecord);
        
        // Clean up test record
        await base(MATCHES_TABLE_ID).destroy([testRecord[0].id]);
        console.log('Test record cleaned up successfully');
      } catch (testError: any) {
        console.error('Error during permission test:', {
          error: testError,
          message: testError.message,
          statusCode: testError.statusCode,
          errorInfo: testError.error
        });
      }
      
      if (matchesTableInfo.length > 0) {
        console.log('Available fields in Matches table:', Object.keys(matchesTableInfo[0].fields));
      }
    } catch (tableError) {
      console.error('Error accessing Matches table:', tableError);
    }

    // Get all matches where the current user is either the swiper or the swiped
    const matches = await base(MATCHES_TABLE_ID)
      .select({
        filterByFormula: `OR({${FIELD_NAMES.SWIPER}} = '${userProfile.id}', {${FIELD_NAMES.SWIPED}} = '${userProfile.id}')`
      })
      .all();

    // Get all matched profiles
    const matchedProfileIds = matches.map(match => {
      const swiper = match.fields[FIELD_NAMES.SWIPER] as string;
      const swiped = match.fields[FIELD_NAMES.SWIPED] as string;
      return swiper === userProfile.id ? swiped : swiper;
    });

    const matchedProfiles = await base('Profiles')
      .select({
        filterByFormula: `OR(${matchedProfileIds.map(id => `RECORD_ID() = '${id}'`).join(',')})`
      })
      .all();

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
  console.log('=== Starting POST request handling ===');
  
  try {
    // 1. Check authentication
    console.log('1. Checking authentication...');
    const session = await getServerSession(authOptions);
    console.log('Session data:', {
      exists: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email
    });
    
    if (!session?.user?.email) {
      console.log('Authentication failed - no session or email');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 2. Get request data
    console.log('2. Getting request data...');
    const body = await request.json();
    console.log('Request body:', body);
    const { swipedProfileId } = body;
    
    if (!swipedProfileId) {
      console.log('Missing swipedProfileId in request');
      return NextResponse.json(
        { success: false, error: 'Missing swipedProfileId' },
        { status: 400 }
      );
    }

    // 3. Initialize Airtable
    console.log('3. Initializing Airtable...');
    console.log('API Key (first 5 chars):', process.env.AIRTABLE_API_KEY?.substring(0, 5));
    console.log('Base ID:', process.env.AIRTABLE_BASE_ID);
    console.log('Matches Table ID:', MATCHES_TABLE_ID);
    console.log('Profiles Table ID:', PROFILES_TABLE_ID);
    
    const airtable = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY,
      endpointUrl: 'https://api.airtable.com',
    });

    const base = airtable.base(process.env.AIRTABLE_BASE_ID || '');
    
    // 4. Verify table access
    console.log('4. Verifying table access...');
    try {
      console.log('4a. Checking Matches table access...');
      const matchesTableTest = await base(MATCHES_TABLE_ID).select({ maxRecords: 1 }).firstPage();
      console.log('Matches table access successful');
      console.log('Matches table fields:', matchesTableTest[0] ? Object.keys(matchesTableTest[0].fields) : 'No records');
      
      console.log('4b. Checking Profiles table access...');
      const profilesTableTest = await base(PROFILES_TABLE_ID).select({ maxRecords: 1 }).firstPage();
      console.log('Profiles table access successful');
      console.log('Profiles table fields:', profilesTableTest[0] ? Object.keys(profilesTableTest[0].fields) : 'No records');
    } catch (tableError: any) {
      console.error('Failed to access table:', {
        error: tableError.message,
        status: tableError.statusCode,
        error_type: tableError.error,
        stack: tableError.stack
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Table access error',
          details: tableError.message,
          statusCode: tableError.statusCode || 403
        },
        { status: tableError.statusCode || 403 }
      );
    }
    
    // 5. Get user profile
    console.log('5. Getting user profile...');
    try {
      const userProfiles = await base(PROFILES_TABLE_ID)
        .select({
          filterByFormula: `{Email 電子信箱} = '${session.user.email}'`,
          maxRecords: 1
        })
        .firstPage();

      if (userProfiles.length === 0) {
        console.log('User profile not found for email:', session.user.email);
        return NextResponse.json(
          { success: false, error: 'User profile not found' },
          { status: 404 }
        );
      }

      const userProfile = userProfiles[0];
      console.log('Found user profile:', {
        id: userProfile.id,
        email: userProfile.fields['Email 電子信箱']
      });

      // 6. Verify swiped profile exists
      console.log('6. Verifying swiped profile exists...');
      try {
        const swipedProfiles = await base(PROFILES_TABLE_ID)
          .select({
            filterByFormula: `RECORD_ID() = '${swipedProfileId}'`,
            maxRecords: 1
          })
          .firstPage();

        if (swipedProfiles.length === 0) {
          console.log('Swiped profile not found:', swipedProfileId);
          return NextResponse.json(
            { success: false, error: 'Swiped profile not found' },
            { status: 404 }
          );
        }

        console.log('Swiped profile found:', {
          id: swipedProfiles[0].id,
          name: swipedProfiles[0].fields['Name 名子']
        });

        // 7. Create match record
        console.log('7. Creating match record...');
        const matchData = {
          [FIELD_NAMES.SWIPER]: userProfile.id,
          [FIELD_NAMES.SWIPED]: swipedProfileId,
          [FIELD_NAMES.STATUS]: 'pending'
        };
        console.log('Match data to be created:', matchData);

        const createResponse = await base(MATCHES_TABLE_ID).create([
          {
            fields: matchData
          }
        ]);
        console.log('Match created successfully:', createResponse);
        return NextResponse.json({ 
          success: true,
          matchId: createResponse[0].id
        });
      } catch (error: any) {
        console.error('Failed to verify swiped profile or create match:', {
          error: error.message,
          status: error.statusCode,
          error_type: error.error
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
    } catch (error: any) {
      console.error('Failed to get user profile:', {
        error: error.message,
        status: error.statusCode,
        error_type: error.error
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to get user profile',
          details: error.message,
          statusCode: error.statusCode || 500
        },
        { status: error.statusCode || 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in POST handler:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      statusCode: error.statusCode,
      errorInfo: error.error
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        details: error.details,
        statusCode: error.statusCode || 500
      },
      { status: error.statusCode || 500 }
    );
  }
} 
