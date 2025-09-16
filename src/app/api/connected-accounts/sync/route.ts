import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';

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

// POST: Sync account data for a specific platform
export async function POST(request: NextRequest) {
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

    // Get current profile
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

    const account = platformAccounts[accountIndex];

    // Sync data based on platform
    let updatedAccountData;
    try {
      switch (platform) {
        case 'tiktok':
          updatedAccountData = await syncTikTokAccount(account);
          break;
        case 'youtube':
          updatedAccountData = await syncYouTubeAccount(account);
          break;
        case 'instagram':
          updatedAccountData = await syncInstagramAccount(account);
          break;
        default:
          return NextResponse.json(
            { message: 'Unsupported platform' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error(`Sync error for ${platform}:`, error);
      return NextResponse.json(
        { message: `Failed to sync ${platform} account` },
        { status: 400 }
      );
    }

    // Update account with synced data
    const updatedAccounts = [...platformAccounts];
    updatedAccounts[accountIndex] = {
      ...updatedAccountData,
      connected_at: account.connected_at, // Preserve original connection date
      last_synced: new Date()
    };

    // Update database
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
      message: 'Account synced successfully',
      account: updatedAccounts[accountIndex]
    });
  } catch (error) {
    console.error('Sync account error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Sync all accounts for a user
export async function PUT(request: NextRequest) {
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

    // Get current profile
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

    const connectedAccounts = profile.connected_accounts || {};
    const syncResults = {
      tiktok: { synced: 0, failed: 0 },
      youtube: { synced: 0, failed: 0 },
      instagram: { synced: 0, failed: 0 }
    };

    // Sync all platforms
    for (const platform of ['tiktok', 'youtube', 'instagram'] as const) {
      const accounts = connectedAccounts[platform] || [];
      
      for (let i = 0; i < accounts.length; i++) {
        try {
          let updatedAccountData;
          
          switch (platform) {
            case 'tiktok':
              updatedAccountData = await syncTikTokAccount(accounts[i]);
              break;
            case 'youtube':
              updatedAccountData = await syncYouTubeAccount(accounts[i]);
              break;
            case 'instagram':
              updatedAccountData = await syncInstagramAccount(accounts[i]);
              break;
          }

          if (updatedAccountData) {
            accounts[i] = {
              ...updatedAccountData,
              connected_at: accounts[i].connected_at,
              last_synced: new Date()
            };
            syncResults[platform].synced++;
          }
        } catch (error) {
          console.error(`Sync error for ${platform} account ${i}:`, error);
          syncResults[platform].failed++;
        }
      }
    }

    // Update database with synced accounts
    await profilesCollection.updateOne(
      { user_id: userId },
      {
        $set: {
          connected_accounts,
          updated_at: new Date()
        }
      }
    );

    return NextResponse.json({
      message: 'All accounts synced',
      results: syncResults
    });
  } catch (error) {
    console.error('Sync all accounts error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions to sync data from each platform
async function syncTikTokAccount(account: any): Promise<any> {
  // TODO: Implement TikTok API sync
  // For now, return mock data
  return {
    ...account,
    follower_count: account.follower_count + Math.floor(Math.random() * 100),
    verified: account.verified
  };
}

async function syncYouTubeAccount(account: any): Promise<any> {
  // TODO: Implement YouTube API sync
  // For now, return mock data
  return {
    ...account,
    subscriber_count: account.subscriber_count + Math.floor(Math.random() * 50),
    verified: account.verified
  };
}

async function syncInstagramAccount(account: any): Promise<any> {
  // TODO: Implement Instagram API sync
  // For now, return mock data
  return {
    ...account,
    follower_count: account.follower_count + Math.floor(Math.random() * 200),
    verified: account.verified
  };
}
