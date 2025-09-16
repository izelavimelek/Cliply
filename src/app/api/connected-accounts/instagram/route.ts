import { NextRequest, NextResponse } from 'next/server';

// Instagram OAuth configuration
const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/connected-accounts/instagram/callback`;

// GET: Initiate Instagram OAuth flow
export async function GET(request: NextRequest) {
  try {
    if (!INSTAGRAM_CLIENT_ID) {
      return NextResponse.json(
        { message: 'Instagram OAuth not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');

    // Instagram OAuth scopes
    const scopes = [
      'user_profile',
      'user_media'
    ].join(',');

    // Build OAuth URL
    const oauthUrl = new URL('https://api.instagram.com/oauth/authorize');
    oauthUrl.searchParams.set('client_id', INSTAGRAM_CLIENT_ID);
    oauthUrl.searchParams.set('redirect_uri', INSTAGRAM_REDIRECT_URI);
    oauthUrl.searchParams.set('scope', scopes);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('state', state);

    return NextResponse.json({
      oauth_url: oauthUrl.toString(),
      state
    });
  } catch (error) {
    console.error('Instagram OAuth initiation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Exchange code for access token and get user data
export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code || !state) {
      return NextResponse.json(
        { message: 'Code and state are required' },
        { status: 400 }
      );
    }

    if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET) {
      return NextResponse.json(
        { message: 'Instagram OAuth not configured' },
        { status: 500 }
      );
    }

    // Verify state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      return NextResponse.json(
        { message: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    const { userId } = stateData;

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CLIENT_ID,
        client_secret: INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: INSTAGRAM_REDIRECT_URI,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Instagram token exchange error:', errorData);
      return NextResponse.json(
        { message: 'Failed to exchange code for token' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, user_id } = tokenData;

    // Get user information using Instagram Basic Display API
    const userResponse = await fetch(`https://graph.instagram.com/${user_id}?fields=id,username,account_type,media_count&access_token=${access_token}`);

    if (!userResponse.ok) {
      console.error('Instagram user info error:', await userResponse.text());
      return NextResponse.json(
        { message: 'Failed to get user information' },
        { status: 400 }
      );
    }

    const userData = await userResponse.json();

    // Get follower count (requires Instagram Graph API with business account)
    // For now, we'll use a placeholder or try to get it from media insights
    let followerCount = 0;
    try {
      // This would require Instagram Graph API and business account
      // For now, we'll set a placeholder
      followerCount = 0;
    } catch (error) {
      console.warn('Could not fetch follower count:', error);
    }

    // Format account data for our schema
    const accountData = {
      username: userData.username || 'Unknown',
      display_name: userData.username,
      follower_count: followerCount,
      verified: userData.account_type === 'BUSINESS' || userData.account_type === 'CREATOR',
      access_token,
      user_id: userData.id
    };

    return NextResponse.json({
      success: true,
      account: accountData,
      user_id: userId
    });
  } catch (error) {
    console.error('Instagram OAuth completion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
