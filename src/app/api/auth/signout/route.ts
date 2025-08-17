import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In production, you might want to add the token to a blacklist
    // For now, we'll just return success since the client removes the token
    
    return NextResponse.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
