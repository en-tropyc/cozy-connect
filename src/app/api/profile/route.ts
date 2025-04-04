import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { base } from '@/lib/airtable';
import sharp from 'sharp';

const PROFILES_TABLE_ID = 'tbl9Jj8pIUABtsXRo';
const MAX_IMAGE_SIZE = 1024; // Maximum dimension (width or height) in pixels
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Define field names as constants to ensure consistency
const FIELD_NAMES = {
  NAME: 'Name 名子',
  EMAIL: 'Email 電子信箱',
  SHORT_INTRO: 'Short intro 簡短介紹自己',
  COMPANY_TITLE: 'Company/Title 公司職稱',
  LOCATION: 'Where are you located?',
  FROM_LOCATION: '🌏 Where are you from? 你從哪裡來？',
  PICTURE: 'Picture 照片',
  GITHUB: 'GitHub',
  INSTAGRAM: 'Instagram',
  LINKEDIN_LINK: 'LinkedIn Link',
  CATEGORIES: 'Categories/Skills 分類',
  LOOKING_FOR: 'I am looking for 我在尋找什麼？',
  CAN_OFFER: 'I can offer 我可以提供什麼？',
  OPEN_TO_WORK: 'I am open for work 我在找工作機會',
  OTHER: 'Other'
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse JSON data from request body
    const data = await request.json();
    console.log('Received profile data:', data);

    // Check if profile already exists
    const existingProfiles = await (base as any)(PROFILES_TABLE_ID)
      .select({
        filterByFormula: `{${FIELD_NAMES.EMAIL}} = '${userEmail}'`,
      })
      .firstPage();

    if (existingProfiles.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Profile already exists' },
        { status: 400 }
      );
    }

    // Create new profile
    try {
      console.log('Creating profile with data:', {
        name: data.name,
        email: data.email,
        hasPicture: !!data.picture,
        pictureUrl: data.picture?.[0]?.url
      });
      
      const fields = {
        [FIELD_NAMES.NAME]: data.name,
        [FIELD_NAMES.EMAIL]: data.email,
        [FIELD_NAMES.SHORT_INTRO]: data.shortIntro,
        [FIELD_NAMES.COMPANY_TITLE]: data.companyTitle,
        [FIELD_NAMES.LOCATION]: data.location,
        [FIELD_NAMES.FROM_LOCATION]: data.fromLocation,
        [FIELD_NAMES.GITHUB]: data.githubUrl,
        [FIELD_NAMES.INSTAGRAM]: data.instagram,
        [FIELD_NAMES.LINKEDIN_LINK]: data.linkedinLink,
        [FIELD_NAMES.CATEGORIES]: data.categories,
        [FIELD_NAMES.LOOKING_FOR]: data.lookingFor,
        [FIELD_NAMES.CAN_OFFER]: data.canOffer,
        [FIELD_NAMES.OPEN_TO_WORK]: data.openToWork,
        [FIELD_NAMES.OTHER]: data.other,
        [FIELD_NAMES.PICTURE]: data.picture
      };

      console.log('Sending fields to Airtable:', Object.keys(fields));
      
      const record = await (base as any)(PROFILES_TABLE_ID).create([
        { fields }
      ]);

      console.log('Profile created successfully');
      return NextResponse.json({ success: true, data: record[0] });
    } catch (error: any) {
      console.error('Error creating Airtable record:', {
        error: error.message,
        type: error.error,
        statusCode: error.statusCode
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create profile in database',
          details: error.message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profiles = await (base as any)(PROFILES_TABLE_ID)
      .select({
        filterByFormula: `{${FIELD_NAMES.EMAIL}} = '${userEmail}'`,
      })
      .firstPage();

    if (profiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profiles[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
} 
