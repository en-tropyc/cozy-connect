import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { Profile } from '@/lib/airtable';

// Profiles to exclude from results
const BLACKLISTED_PROFILES = [
  '☕️ Join Cozy Networking'
  // Add any other profiles you want to exclude here
];

export async function GET() {
  if (!process.env.AIRTABLE_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Missing Airtable API key configuration' },
      { status: 500 }
    );
  }

  if (!process.env.AIRTABLE_BASE_ID) {
    return NextResponse.json(
      { success: false, error: 'Missing Airtable base ID configuration' },
      { status: 500 }
    );
  }

  try {
    const airtable = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY,
      endpointUrl: 'https://api.airtable.com',
    });

    const base = airtable.base(process.env.AIRTABLE_BASE_ID);
    const tableId = 'tbl9Jj8pIUABtsXRo';
    
    // Create OR conditions for each blacklisted profile
    const blacklistFilter = BLACKLISTED_PROFILES
      .map(name => `{Name 名子} = '${name}'`)
      .join(', ');
    
    const records = await base(tableId)
      .select({
        filterByFormula: `NOT(OR(${blacklistFilter}))`,
        sort: [{ field: 'Last Modified', direction: 'desc' }],
        fields: [
          'Name 名子',
          'Email 電子信箱',
          'Cozy Connect Gmail',
          'Instagram',
          'Short intro 簡短介紹自己',
          'LinkedIn Link',
          'Company/Title 公司職稱',
          'Picture 照片',
          'Categories/Skills 分類',
          'I am looking for 我在尋找什麼？',
          'I can offer 我可以提供什麼？',
          'I am open for work 我在找工作機會',
          'Other',
          'Last Modified',
          '🌏 Where are you from? 你從哪裡來？'
        ]
      })
      .all();

    let profiles: Profile[] = records.map((record) => ({
      id: record.id,
      name: record.fields['Name 名子'] as string,
      email: record.fields['Email 電子信箱'] as string,
      cozyConnectGmail: record.fields['Cozy Connect Gmail'] as string,
      instagram: record.fields['Instagram'] as string,
      shortIntro: record.fields['Short intro 簡短介紹自己'] as string,
      linkedinLink: record.fields['LinkedIn Link'] as string,
      companyTitle: record.fields['Company/Title 公司職稱'] as string,
      picture: record.fields['Picture 照片'] as any[],
      categories: record.fields['Categories/Skills 分類'] as string[],
      lookingFor: record.fields['I am looking for 我在尋找什麼？'] as string,
      canOffer: record.fields['I can offer 我可以提供什麼？'] as string,
      openToWork: record.fields['I am open for work 我在找工作機會'] as string,
      other: record.fields['Other'] as string,
      lastModified: record.fields['Last Modified'] as string,
      location: record.fields['🌏 Where are you from? 你從哪裡來？'] as string,
      active: record.fields['Active'] as boolean
    }));

    // Shuffle the profiles using Fisher-Yates algorithm
    for (let i = profiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [profiles[i], profiles[j]] = [profiles[j], profiles[i]];
    }

    return NextResponse.json({
      success: true,
      profiles
    });
      
  } catch (error: any) {
    console.error('Error fetching profiles:', {
      message: error.message,
      status: error.statusCode,
      type: error.error
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch profiles',
        statusCode: error.statusCode || 500
      },
      { status: error.statusCode || 500 }
    );
  }
}
