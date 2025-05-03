import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserProfile } from '@/lib/airtable'; // Use existing function
import type { Profile } from '@/lib/airtable';
import type { Record as AirtableRecord } from 'airtable'; // Avoid conflict with JS Record

// Helper function to map Airtable record to Profile interface
// (Handles potential field name differences and type casting)
function mapRecordToProfile(record: AirtableRecord<any>): Profile | null {
  if (!record || !record.fields) return null;

  const fields = record.fields;
  // Basic validation - ensure essential fields exist
  if (!fields['Name 名子'] || !fields['Short intro 簡短介紹自己']) {
      console.warn("Record missing essential fields:", record.id);
      return null;
  }

  return {
    id: record.id,
    name: fields['Name 名子'] as string,
    email: fields['Email 電子信箱'] as string, // Optional in interface, but likely exists
    cozyConnectGmail: fields['Cozy Connect Gmail'] as string, // Likely exists if fetched by email
    instagram: fields['Instagram'] as string | undefined,
    github: fields['GitHub'] as string | undefined, // Ensure this matches the Airtable field name
    shortIntro: fields['Short intro 簡短介紹自己'] as string,
    linkedinLink: fields['LinkedIn Link'] as string | undefined,
    companyTitle: fields['Company/Title 公司職稱'] as string | undefined,
    picture: fields['Picture 照片'] as Profile['picture'] | undefined,
    categories: fields['Categories/Skills 分類'] as string[] | undefined,
    lookingFor: fields['I am looking for 我在尋找什麼？'] as string | undefined, // Should be required based on form?
    canOffer: fields['I can offer 我可以提供什麼？'] as string | undefined, // Should be required based on form?
    openToWork: fields['I am open for work 我在找工作機會'] as string | undefined,
    other: fields['Other'] as string | undefined,
    lastModified: fields['Last Modified'] as string | undefined,
    location: fields['🌏 Where are you from? 你從哪裡來？'] as string | undefined, // Maps to 'fromLocation' in form
    active: fields['Active'] as boolean | undefined // If 'Active' field exists
  };
}


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Not logged in' },
        { status: 401 }
      );
    }

    // Fetch the Airtable record using the email
    const airtableRecord = await getUserProfile(userEmail);

    if (!airtableRecord) {
      return NextResponse.json(
        { success: false, error: 'Profile not found for this user' },
        { status: 404 }
      );
    }

    // Map the Airtable record to our Profile type
    const profile = mapRecordToProfile(airtableRecord);

     if (!profile) {
        console.error('Failed to map Airtable record to profile:', airtableRecord.id);
        return NextResponse.json(
            { success: false, error: 'Failed to process profile data' },
            { status: 500 }
        );
    }


    return NextResponse.json({ success: true, profile });

  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch profile data',
      },
      { status: 500 }
    );
  }
} 
