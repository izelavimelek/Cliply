import { NextRequest, NextResponse } from 'next/server';

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

      const user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        is_admin: decoded.isAdmin,
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
