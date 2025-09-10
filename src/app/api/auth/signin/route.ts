import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const profilesCollection = db.collection(Collections.PROFILES);

    // Find user by email
    const profile = await profilesCollection.findOne({ email });
    if (!profile) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!profile.password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, profile.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = btoa(JSON.stringify({
      userId: profile.user_id,
      email: profile.email,
      role: profile.role,
      isAdmin: profile.is_admin,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    }));

    // Create the response
    const response = NextResponse.json({ 
      user: {
        id: profile.user_id,
        email: profile.email,
        role: profile.role,
        is_admin: profile.is_admin,
        theme_preference: profile.theme_preference || 'light',
      },
      token 
    });

    // Set cookies
    response.cookies.set('auth_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    
    response.cookies.set('user_role', profile.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('bcrypt')) {
        return NextResponse.json(
          { message: 'Password verification failed' },
          { status: 500 }
        );
      }
      if (error.message.includes('MongoDB')) {
        return NextResponse.json(
          { message: 'Database connection failed' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
