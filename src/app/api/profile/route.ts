import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { base } from '@/lib/airtable';

const PROFILES_TABLE_ID = 'tbl9Jj8pIUABtsXRo';

// Define field names as constants to ensure consistency
const FIELD_NAMES = {
  NAME: 'Name 名子',
  EMAIL: 'Email 電子信箱',
  SHORT_INTRO: 'Short intro 簡短介紹自己',
  COMPANY_TITLE: 'Company/Title 公司職稱',
  LOCATION: '🌏 Where are you from? 你從哪裡來？',
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
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      name,
      shortIntro,
      companyTitle,
      location,
      instagram,
      linkedinLink,
      categories,
      lookingFor,
      canOffer,
      openToWork,
      other,
      email,
    } = data;

    // Check if profile already exists
    const existingProfiles = await base(PROFILES_TABLE_ID)
      .select({
        filterByFormula: `{${FIELD_NAMES.EMAIL}} = '${email}'`,
      })
      .firstPage();

    if (existingProfiles.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Profile already exists' },
        { status: 400 }
      );
    }

    // Create new profile
    const record = await base(PROFILES_TABLE_ID).create([
      {
        fields: {
          [FIELD_NAMES.NAME]: name,
          [FIELD_NAMES.EMAIL]: email,
          [FIELD_NAMES.SHORT_INTRO]: shortIntro,
          [FIELD_NAMES.COMPANY_TITLE]: companyTitle,
          [FIELD_NAMES.LOCATION]: location,
          [FIELD_NAMES.INSTAGRAM]: instagram,
          [FIELD_NAMES.LINKEDIN_LINK]: linkedinLink,
          [FIELD_NAMES.CATEGORIES]: categories,
          [FIELD_NAMES.LOOKING_FOR]: lookingFor,
          [FIELD_NAMES.CAN_OFFER]: canOffer,
          [FIELD_NAMES.OPEN_TO_WORK]: openToWork,
          [FIELD_NAMES.OTHER]: other,
        },
      },
    ]);

    return NextResponse.json({ success: true, data: record[0] });
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
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profiles = await base(PROFILES_TABLE_ID)
      .select({
        filterByFormula: `{${FIELD_NAMES.EMAIL}} = '${session.user.email}'`,
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
