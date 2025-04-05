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
    const profileEmail = profile.fields['Email 電子信箱'] as string;

    if (!profileEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No email address found for this profile',
          errorType: 'NO_EMAIL'
        },
        { status: 400 }
      );
    }

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
      
      // During development/testing, we can only send to the API key owner's email
      const isDevelopment = process.env.NODE_ENV === 'development';
      const toEmail = isDevelopment ? 'cozycowork2024@gmail.com' : session.user.email;
      
      const emailResponse = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: toEmail,
        subject: `Verification Code for ${session.user.email}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Verification Code Request</h1>
            <p><strong>Requested by:</strong> ${session.user.email}</p>
            <p><strong>Profile Name:</strong> ${name}</p>
            <p>Verification code:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${verificationCode}</span>
            </div>
            ${isDevelopment ? `
              <div style="background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #856404; margin: 0;"><strong>Development Mode Notice:</strong></p>
                <p style="color: #856404; margin: 10px 0 0 0;">During development, all verification codes are sent to cozycowork2024@gmail.com. Please check this email and forward the code to ${session.user.email}.</p>
              </div>
            ` : ''}
            <p>This code will expire in 15 minutes.</p>
            <p>Best regards,<br>The Cozy Connect Team</p>
          </div>
        `
      });
      console.log('Email response:', emailResponse);

      // Return different messages based on environment
      return NextResponse.json({ 
        success: true,
        isDevelopment,
        message: isDevelopment 
          ? 'Verification code sent to admin email (cozycowork2024@gmail.com). Please check this email and forward the code.'
          : 'Verification code sent to your email.'
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
