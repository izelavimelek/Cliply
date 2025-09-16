import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'OAuth error occurred';
      console.error('TikTok OAuth error:', error, errorDescription);
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/creator/settings?error=${encodeURIComponent(errorDescription)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/creator/settings?error=${encodeURIComponent('Missing authorization code or state')}`
      );
    }

    // Verify state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/creator/settings?error=${encodeURIComponent('Invalid state parameter')}`
      );
    }

    const { userId } = stateData;

    // Exchange code for access token and get user data
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/connected-accounts/tiktok`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('TikTok token exchange error:', errorData);
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/creator/settings?error=${encodeURIComponent(errorData.message || 'Failed to connect TikTok account')}`
      );
    }

    const result = await tokenResponse.json();

    if (result.success) {
      // Success - redirect back to settings with success message
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/creator/settings?success=${encodeURIComponent('TikTok account connected successfully!')}`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/creator/settings?error=${encodeURIComponent('Failed to connect TikTok account')}`
      );
    }

  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/creator/settings?error=${encodeURIComponent('An unexpected error occurred')}`
    );
  }
}
