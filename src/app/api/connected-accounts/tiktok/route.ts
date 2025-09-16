import { NextRequest, NextResponse } from 'next/server';

// TikTok OAuth configuration
const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/connected-accounts/tiktok/callback`;

// GET: Initiate TikTok OAuth flow
export async function GET(request: NextRequest) {
  try {
    if (!TIKTOK_CLIENT_ID) {
      return NextResponse.json(
        { message: 'TikTok OAuth not configured' },
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

    // TikTok OAuth scopes
    const scopes = [
      'user.info.basic',
      'user.info.stats',
      'video.list'
    ].join(',');

    // Build OAuth URL
    const oauthUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    oauthUrl.searchParams.set('client_key', TIKTOK_CLIENT_ID);
    oauthUrl.searchParams.set('scope', scopes);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI);
    oauthUrl.searchParams.set('state', state);

    return NextResponse.json({
      oauth_url: oauthUrl.toString(),
      state
    });
  } catch (error) {
    console.error('TikTok OAuth initiation error:', error);
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

    if (!TIKTOK_CLIENT_ID || !TIKTOK_CLIENT_SECRET) {
      return NextResponse.json(
        { message: 'TikTok OAuth not configured' },
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
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_ID,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('TikTok token exchange error:', errorData);
      return NextResponse.json(
        { message: 'Failed to exchange code for token' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in, refresh_token } = tokenData;

    if (!access_token) {
      return NextResponse.json(
        { message: 'No access token received from TikTok' },
        { status: 400 }
      );
    }

    // Get user information using TikTok User Info API
    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('TikTok user info error:', errorText);
      return NextResponse.json(
        { message: 'Failed to get user information from TikTok' },
        { status: 400 }
      );
    }

    const userData = await userResponse.json();
    const { data } = userData;

    if (!data || !data.user) {
      return NextResponse.json(
        { message: 'Invalid user data received from TikTok' },
        { status: 400 }
      );
    }

    const user = data.user;

    // Validate required fields
    if (!user.open_id) {
      return NextResponse.json(
        { message: 'TikTok user ID not found' },
        { status: 400 }
      );
    }

    // Format account data for our schema
    const accountData = {
      username: user.display_name || `user_${user.open_id}`,
      display_name: user.display_name || 'TikTok User',
      follower_count: user.follower_count || 0,
      verified: false, // TikTok doesn't provide verification status in basic API
      connected_at: new Date(),
      last_synced: new Date(),
      // Store OAuth tokens securely (in production, encrypt these)
      access_token,
      refresh_token,
      expires_in,
      open_id: user.open_id,
      union_id: user.union_id
    };

    // Save to database using our database functions
    try {
      const { addConnectedAccount } = await import('@/lib/db');
      const success = await addConnectedAccount(userId, 'tiktok', accountData);
      
      if (!success) {
        return NextResponse.json(
          { message: 'Failed to save account to database' },
          { status: 500 }
        );
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { message: 'Failed to save account data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      account: accountData,
      user_id: userId
    });
  } catch (error) {
    console.error('TikTok OAuth completion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
