import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID || 'appXPGzvT71UhNsjl');

    const records = await base('Profiles')
      .select({
        maxRecords: 1,
        view: 'Grid view',
      })
      .firstPage();

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Airtable!',
      recordCount: records.length,
      sampleRecord: records[0]?.fields || null,
    });
  } catch (error) {
    console.error('Airtable connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to Airtable',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 
