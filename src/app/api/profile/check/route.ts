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

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Missing email' },
        { status: 400 }
      );
    }

    // Check if profile exists with this Cozy Connect Gmail
    const profiles = await base(PROFILES_TABLE_ID)
      .select({
        filterByFormula: `{Cozy Connect Gmail} = '${email}'`,
        maxRecords: 1
      })
      .firstPage();

    if (profiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      profile: profiles[0]
    });
  } catch (error: any) {
    console.error('Error checking profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 
