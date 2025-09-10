import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 });
    }

    const { theme_preference } = await request.json();

    if (!theme_preference || !['light', 'dark', 'system'].includes(theme_preference)) {
      return NextResponse.json(
        { message: 'Valid theme preference (light, dark, or system) is required' },
        { status: 400 }
      );
    }

    // Decode token to get user info
    let userInfo;
    try {
      userInfo = JSON.parse(atob(token));
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    const profilesCollection = db.collection(Collections.PROFILES);

    // Update user's theme preference
    const result = await profilesCollection.updateOne(
      { user_id: userInfo.userId },
      { 
        $set: { 
          theme_preference,
          updated_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Theme preference updated successfully',
      theme_preference 
    });

  } catch (error) {
    console.error('Error updating theme preference:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
