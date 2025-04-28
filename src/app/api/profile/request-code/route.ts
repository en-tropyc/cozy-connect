import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { base } from '@/lib/airtable';
import { Resend } from 'resend';

const PROFILES_TABLE_ID = 'tbl9Jj8pIUABtsXRo';
const resend = new Resend(process.env.RESEND_API_KEY!);

// Generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Missing name', errorType: 'MISSING_FIELD' },
        { status: 400 }
      );
    }

    if (!base) {
      throw new Error('Airtable base not initialized');
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
        { 
          success: false, 
          error: 'No profile found with that name',
          errorType: 'NO_PROFILE'
        },
        { status: 404 }
      );
    }

    const profile = profiles[0];
    
    // Check if profile is already linked
    if (profile.fields['Cozy Connect Gmail']) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This profile is already linked to a Cozy Connect account',
          errorType: 'ALREADY_LINKED'
        },
        { status: 400 }
      );
    }

    // Generate and store verification code
    const verificationCode = generateVerificationCode();
    await base(PROFILES_TABLE_ID).update(profile.id, {
      'Verification Code': verificationCode
    });

    // Send verification code via email
    try {
      console.log('Attempting to send email to:', session.user.email);
      
      const toEmail = session.user.email;
      
      const emailResponse = await resend.emails.send({
        from: 'verification@cozy.zerocomputing.com',
        to: toEmail,
        subject: `Your Cozy Connect Verification Code`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Your Verification Code</h1>
            <p>Hello,</p>
            <p>You requested a verification code for linking your profile "${name}" on Cozy Connect.</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${verificationCode}</span>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>Best regards,<br>The Cozy Connect Team</p>
          </div>
        `
      });
      console.log('Email response:', emailResponse);

      return NextResponse.json({ 
        success: true,
        message: 'Verification code sent to your email. Please check your inbox.'
      });
    } catch (error: any) {
      console.error('Error sending email:', {
        error,
        message: error.message,
        response: error.response,
        statusCode: error.statusCode,
        name: error.name,
        stack: error.stack
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send verification code: ' + error.message,
          errorType: 'EMAIL_ERROR'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error requesting verification code:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 
