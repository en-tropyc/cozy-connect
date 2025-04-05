import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { base } from '@/lib/airtable';

const PROFILES_TABLE_ID = 'tbl9Jj8pIUABtsXRo';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { name, verificationCode } = await request.json();
    if (!name || !verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Search for the profile by name
    const profiles = await base(PROFILES_TABLE_ID)
      .select({
        filterByFormula: `{Name 名子} = '${name}'`,
        maxRecords: 1
      })
      .firstPage();

    if (profiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No profile found with that name' },
        { status: 404 }
      );
    }

    const profile = profiles[0];

    // Verify the code
    const storedCode = profile.fields['Verification Code'];
    if (!storedCode) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No verification code found for this profile. Please contact support.',
          errorType: 'NO_CODE'
        },
        { status: 400 }
      );
    }

    if (storedCode !== verificationCode) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'The verification code you entered is incorrect. Please try again.',
          errorType: 'INVALID_CODE'
        },
        { status: 400 }
      );
    }

    // Check if profile is already linked
    if (profile.fields['Cozy Connect Gmail']) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This profile is already linked to a Cozy Connect account. Please sign in with the linked email.',
          errorType: 'ALREADY_LINKED'
        },
        { status: 400 }
      );
    }

    // Update the profile with the authenticated email and clear verification code
    const fields = {
      'Cozy Connect Gmail': session.user.email,
      'Verification Code': '' // Use empty string to clear the field in Airtable
    };

    try {
      await base(PROFILES_TABLE_ID).update(profile.id, fields);
      
      // Double-check that the verification code was cleared
      const updatedProfile = await base(PROFILES_TABLE_ID)
        .find(profile.id);
      
      if (updatedProfile.fields['Verification Code']) {
        console.error('Warning: Verification code was not cleared properly');
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error linking profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 
