import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { Profile } from '@/lib/airtable';

export async function GET() {
  // Log environment variables (excluding sensitive values)
  console.log('API Route - Environment check:', {
    hasApiKey: !!process.env.AIRTABLE_API_KEY,
    apiKeyLength: process.env.AIRTABLE_API_KEY?.length,
    baseId: process.env.AIRTABLE_BASE_ID,
  });

  if (!process.env.AIRTABLE_API_KEY) {
    console.error('Missing AIRTABLE_API_KEY');
    return NextResponse.json(
      { success: false, error: 'Missing Airtable API key configuration' },
      { status: 500 }
    );
  }

  if (!process.env.AIRTABLE_BASE_ID) {
    console.error('Missing AIRTABLE_BASE_ID');
    return NextResponse.json(
      { success: false, error: 'Missing Airtable base ID configuration' },
      { status: 500 }
    );
  }

  try {
    console.log('Creating Airtable instance...');
    const airtable = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY,
      endpointUrl: 'https://api.airtable.com',
    });

    console.log('Creating base instance...');
    const base = airtable.base(process.env.AIRTABLE_BASE_ID);
    
    console.log('Attempting to fetch profiles from Airtable...');
    const tableId = 'tbl9Jj8pIUABtsXRo';
    
    try {
      // First, let's try to get all records without specifying fields
      // This will help us see the actual field names in the response
      console.log('Fetching a sample record to see field names...');
      const sampleRecords = await base(tableId)
        .select({
          maxRecords: 1
        })
        .firstPage();

      if (sampleRecords.length > 0) {
        console.log('Available fields in the first record:', Object.keys(sampleRecords[0].fields));
        console.log('Sample record data:', sampleRecords[0].fields);
      }

      // Now fetch all records with the fields we want
      console.log('Fetching all records...');
      const records = await base(tableId)
        .select()
        .all();

      console.log(`Successfully fetched ${records.length} records`);

      const profiles: Profile[] = records.map((record) => ({
        id: record.id,
        name: record.fields['Name 名子'] as string,
        email: record.fields['Email 電子信箱'] as string,
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
      }));

      return NextResponse.json({
        success: true,
        sampleFields: sampleRecords[0]?.fields || null,
        profiles,
      });
      
    } catch (error: any) {
      console.error('Detailed validation error:', {
        error,
        message: error.message,
        statusCode: error.statusCode,
        type: error.error,
      });
      
      if (error.statusCode === 403) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication failed. Please verify your API key has access to this base.',
            details: error.message,
          },
          { status: 403 }
        );
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error('Detailed Airtable API Error:', {
      error,
      message: error.message,
      statusCode: error.statusCode,
      type: error.error,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error occurred',
        details: error.stack,
        statusCode: error.statusCode,
        type: error.error,
      },
      { status: error.statusCode || 500 }
    );
  }
} 
