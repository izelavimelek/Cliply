import { NextRequest, NextResponse } from 'next/server';

// YouTube OAuth configuration
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/connected-accounts/youtube/callback`;

// GET: Initiate YouTube OAuth flow
export async function GET(request: NextRequest) {
  try {
    if (!YOUTUBE_CLIENT_ID) {
      return NextResponse.json(
        { message: 'YouTube OAuth not configured' },
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

    // YouTube OAuth scopes
    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ].join(' ');

    // Build OAuth URL
    const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    oauthUrl.searchParams.set('client_id', YOUTUBE_CLIENT_ID);
    oauthUrl.searchParams.set('redirect_uri', YOUTUBE_REDIRECT_URI);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('scope', scopes);
    oauthUrl.searchParams.set('state', state);
    oauthUrl.searchParams.set('access_type', 'offline');
    oauthUrl.searchParams.set('prompt', 'consent');

    return NextResponse.json({
      oauth_url: oauthUrl.toString(),
      state
    });
  } catch (error) {
    console.error('YouTube OAuth initiation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Exchange code for access token and get channel data
export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code || !state) {
      return NextResponse.json(
        { message: 'Code and state are required' },
        { status: 400 }
      );
    }

    if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
      return NextResponse.json(
        { message: 'YouTube OAuth not configured' },
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
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: YOUTUBE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('YouTube token exchange error:', errorData);
      return NextResponse.json(
        { message: 'Failed to exchange code for token' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get channel information
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!channelResponse.ok) {
      console.error('YouTube channel info error:', await channelResponse.text());
      return NextResponse.json(
        { message: 'Failed to get channel information' },
        { status: 400 }
      );
    }

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json(
        { message: 'No channel found for this account' },
        { status: 400 }
      );
    }

    const channel = channelData.items[0];
    const { id, snippet, statistics } = channel;

    // Format account data for our schema
    const accountData = {
      channel_id: id,
      channel_name: snippet.title,
      subscriber_count: parseInt(statistics.subscriberCount) || 0,
      verified: snippet.verified || false,
      access_token,
      refresh_token,
      expires_in
    };

    return NextResponse.json({
      success: true,
      account: accountData,
      user_id: userId
    });
  } catch (error) {
    console.error('YouTube OAuth completion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
