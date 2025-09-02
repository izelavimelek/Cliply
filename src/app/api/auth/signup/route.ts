import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';
import { Profile } from '@/lib/mongodb/schemas';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Signup request body:', body);
    
    const { email, password, name, role } = body;

    if (!email || !password) {
      console.log('Missing email or password:', { email: !!email, password: !!password });
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('Password too short:', password.length);
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (!role || !['creator', 'brand'].includes(role)) {
      console.log('Invalid role:', role);
      return NextResponse.json(
        { message: 'Valid role (creator or brand) is required' },
        { status: 400 }
      );
    }

    console.log('Validation passed, connecting to database...');
    const db = await getDatabase();
    const profilesCollection = db.collection(Collections.PROFILES);

    // Check if user already exists
    const existingProfile = await profilesCollection.findOne({ email });
    if (existingProfile) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    console.log('Creating new user profile...');
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create new profile
    const now = new Date();
    const profile: Omit<Profile, '_id'> = {
      user_id: userId,
      email,
      password: hashedPassword,
      display_name: name,
      role: role as 'creator' | 'brand',
      is_admin: false,
      created_at: now,
      updated_at: now,
    };

    console.log('Profile to insert:', { ...profile, password: '[HIDDEN]' });
    const result = await profilesCollection.insertOne(profile);

    if (!result.acknowledged) {
      throw new Error('Failed to create user profile');
    }

    console.log('User profile created successfully:', userId);

    // Generate simple token (in production, use proper JWT)
    const token = btoa(JSON.stringify({
      userId,
      email: profile.email,
      role: profile.role,
      isAdmin: profile.is_admin,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    }));

    const user = {
      id: userId,
      email: profile.email,
      display_name: profile.display_name,
      role: profile.role,
      is_admin: profile.is_admin,
    };

    // Create response with cookies
    const response = NextResponse.json({ user, token }, { status: 201 });

    // Set authentication cookies
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    response.cookies.set('user_role', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    console.log('Signup completed successfully');
    return response;

  } catch (error) {
    console.error('Signup error:', error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('bcrypt')) {
        return NextResponse.json(
          { message: 'Password encryption failed' },
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
