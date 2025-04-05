import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function POST(request: Request) {
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
    const { name, email, feedback, rating } = await request.json();

    const airtable = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY,
      endpointUrl: 'https://api.airtable.com',
    });

    const base = airtable.base(process.env.AIRTABLE_BASE_ID);
    const tableId = 'tblZA2JMTTwHsnN3b'; // Updated with the actual Feedback table ID

    await base(tableId).create([
      {
        fields: {
          'Name': name,
          'Email': email,
          'Feedback': feedback,
          'Rating': rating,
          'Date': new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
        }
      }
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit feedback' },
      { status: 500 }
    );
  }
} 
