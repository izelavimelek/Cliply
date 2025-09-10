import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ user: null });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = JSON.parse(atob(token));
      
      // Check if token is expired
      if (decoded.exp < Date.now()) {
        return NextResponse.json({ user: null });
      }

      // Fetch user profile to get theme preference
      const db = await getDatabase();
      const profilesCollection = db.collection(Collections.PROFILES);
      const profile = await profilesCollection.findOne({ user_id: decoded.userId });

      const user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        is_admin: decoded.isAdmin,
        theme_preference: profile?.theme_preference || 'light',
        display_name: profile?.display_name || null,
      };

      return NextResponse.json({ user });
    } catch {
      return NextResponse.json({ user: null });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ user: null });
  }
}
