import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateUserProfile, getUserProfile } from '@/lib/airtable'; // Import both
import type { Profile } from '@/lib/airtable';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Not logged in' },
        { status: 401 }
      );
    }

    // 1. Get user's current profile to verify ownership and get record ID
    const currentRecord = await getUserProfile(userEmail);
    if (!currentRecord) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized: Profile not found for current user' },
            { status: 404 } // Or 403 Forbidden
        );
    }
    const recordId = currentRecord.id;


    // 2. Parse the incoming data from the request body
    const dataToUpdate: Partial<Profile> = await request.json();
    console.log("Received update data for record:", recordId, dataToUpdate);

    // 3. Basic Validation (Add more as needed)
    if (!dataToUpdate || Object.keys(dataToUpdate).length === 0) {
         return NextResponse.json(
            { success: false, error: 'Bad Request: No update data provided' },
            { status: 400 }
        );
    }
     // Example validation: Ensure required fields aren't made empty if they are required
     // if (dataToUpdate.hasOwnProperty('name') && !dataToUpdate.name) { ... }

    // 4. Call the Airtable update function
    const updatedRecord = await updateUserProfile(recordId, dataToUpdate);

    console.log("Profile updated successfully in Airtable:", updatedRecord.id);
    return NextResponse.json({ success: true, updatedProfile: updatedRecord });

  } catch (error: any) {
    console.error('Error updating profile:', error);
    // Provide more specific error messages if possible
    let status = 500;
    let message = 'Failed to update profile';
    if (error.message?.includes('Missing record ID')) {
        status = 400; // Bad Request
        message = error.message;
    } else if (error.message?.includes('Airtable base not initialized')) {
         message = 'Server configuration error';
    }
    // Check for specific Airtable errors if needed

    return NextResponse.json(
      {
        success: false,
        error: message,
        details: error.message // Include original message for debugging if desired
      },
      { status: status }
    );
  }
} 
