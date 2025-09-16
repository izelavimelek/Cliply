import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';
import { TikTokAccount, YouTubeAccount, InstagramAccount } from '@/lib/mongodb/schemas';

// Helper function to extract user ID from token
function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = JSON.parse(atob(token));
    
    // Check if token is expired
    if (decoded.exp < Date.now()) {
      return null;
    }
    
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET: Fetch user's connected accounts
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const profilesCollection = db.collection(Collections.PROFILES);

    const profile = await profilesCollection.findOne(
      { user_id: userId },
      { projection: { connected_accounts: 1 } }
    );

    if (!profile) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      connected_accounts: profile.connected_accounts || {
        tiktok: [],
        youtube: [],
        instagram: []
      }
    });
  } catch (error) {
    console.error('Get connected accounts error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Connect new account
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { platform, accountData } = await request.json();

    if (!platform || !accountData) {
      return NextResponse.json(
        { message: 'Platform and account data are required' },
        { status: 400 }
      );
    }

    const validPlatforms = ['tiktok', 'youtube', 'instagram'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { message: 'Invalid platform' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const profilesCollection = db.collection(Collections.PROFILES);

    // Validate account data based on platform
    const validatedAccountData = validateAccountData(platform, accountData);
    if (!validatedAccountData) {
      return NextResponse.json(
        { message: 'Invalid account data for platform' },
        { status: 400 }
      );
    }

    // Add connected_at timestamp
    const accountWithTimestamp = {
      ...validatedAccountData,
      connected_at: new Date(),
      last_synced: new Date()
    };

    // Update profile with new connected account
    const result = await profilesCollection.updateOne(
      { user_id: userId },
      {
        $push: {
          [`connected_accounts.${platform}`]: accountWithTimestamp
        },
        $set: {
          updated_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Account connected successfully',
      account: accountWithTimestamp
    });
  } catch (error) {
    console.error('Connect account error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Disconnect account
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { platform, accountIndex } = await request.json();

    if (!platform || accountIndex === undefined) {
      return NextResponse.json(
        { message: 'Platform and account index are required' },
        { status: 400 }
      );
    }

    const validPlatforms = ['tiktok', 'youtube', 'instagram'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { message: 'Invalid platform' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const profilesCollection = db.collection(Collections.PROFILES);

    // Get current profile to validate account index
    const profile = await profilesCollection.findOne(
      { user_id: userId },
      { projection: { connected_accounts: 1 } }
    );

    if (!profile) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    const platformAccounts = profile.connected_accounts?.[platform] || [];
    if (accountIndex < 0 || accountIndex >= platformAccounts.length) {
      return NextResponse.json(
        { message: 'Invalid account index' },
        { status: 400 }
      );
    }

    // Remove account at specified index
    const updatedAccounts = platformAccounts.filter((_: any, index: number) => index !== accountIndex);

    const result = await profilesCollection.updateOne(
      { user_id: userId },
      {
        $set: {
          [`connected_accounts.${platform}`]: updatedAccounts,
          updated_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Account disconnected successfully'
    });
  } catch (error) {
    console.error('Disconnect account error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update account data (refresh/sync)
export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { platform, accountIndex, accountData } = await request.json();

    if (!platform || accountIndex === undefined || !accountData) {
      return NextResponse.json(
        { message: 'Platform, account index, and account data are required' },
        { status: 400 }
      );
    }

    const validPlatforms = ['tiktok', 'youtube', 'instagram'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { message: 'Invalid platform' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const profilesCollection = db.collection(Collections.PROFILES);

    // Get current profile to validate account index
    const profile = await profilesCollection.findOne(
      { user_id: userId },
      { projection: { connected_accounts: 1 } }
    );

    if (!profile) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    const platformAccounts = profile.connected_accounts?.[platform] || [];
    if (accountIndex < 0 || accountIndex >= platformAccounts.length) {
      return NextResponse.json(
        { message: 'Invalid account index' },
        { status: 400 }
      );
    }

    // Validate updated account data
    const validatedAccountData = validateAccountData(platform, accountData);
    if (!validatedAccountData) {
      return NextResponse.json(
        { message: 'Invalid account data for platform' },
        { status: 400 }
      );
    }

    // Update account with new data and sync timestamp
    const updatedAccount = {
      ...validatedAccountData,
      connected_at: platformAccounts[accountIndex].connected_at, // Preserve original connection date
      last_synced: new Date()
    };

    // Update specific account in array
    const updatedAccounts = [...platformAccounts];
    updatedAccounts[accountIndex] = updatedAccount;

    const result = await profilesCollection.updateOne(
      { user_id: userId },
      {
        $set: {
          [`connected_accounts.${platform}`]: updatedAccounts,
          updated_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Account updated successfully',
      account: updatedAccount
    });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to validate account data based on platform
function validateAccountData(platform: string, accountData: any): any | null {
  try {
    switch (platform) {
      case 'tiktok':
        if (!accountData.username || typeof accountData.username !== 'string') {
          return null;
        }
        return {
          username: accountData.username,
          display_name: accountData.display_name || undefined,
          follower_count: typeof accountData.follower_count === 'number' ? accountData.follower_count : undefined,
          verified: Boolean(accountData.verified)
        };

      case 'youtube':
        if (!accountData.channel_id || typeof accountData.channel_id !== 'string') {
          return null;
        }
        return {
          channel_id: accountData.channel_id,
          channel_name: accountData.channel_name || undefined,
          subscriber_count: typeof accountData.subscriber_count === 'number' ? accountData.subscriber_count : undefined,
          verified: Boolean(accountData.verified)
        };

      case 'instagram':
        if (!accountData.username || typeof accountData.username !== 'string') {
          return null;
        }
        return {
          username: accountData.username,
          display_name: accountData.display_name || undefined,
          follower_count: typeof accountData.follower_count === 'number' ? accountData.follower_count : undefined,
          verified: Boolean(accountData.verified)
        };

      default:
        return null;
    }
  } catch {
    return null;
  }
}
