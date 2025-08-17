import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';
import { Profile } from '@/lib/mongodb/schemas';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (!role || !['creator', 'brand'].includes(role)) {
      return NextResponse.json(
        { message: 'Valid role (creator or brand) is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const profilesCollection = db.collection(Collections.PROFILES);

    // Check if user already exists
    const existingProfile = await profilesCollection.findOne({ email });
    if (existingProfile) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create new profile
    const now = new Date();
    const profile: Omit<Profile, '_id'> & { password: string } = {
      user_id: userId,
      email,
      password: hashedPassword, // Add password field
      role: role as 'creator' | 'brand',
      is_admin: false,
      created_at: now,
      updated_at: now,
    };

    const result = await profilesCollection.insertOne(profile);

    if (!result.acknowledged) {
      throw new Error('Failed to create user profile');
    }

    // Generate simple token (in production, use proper JWT)
    const token = btoa(JSON.stringify({
      userId,
      email,
      role: profile.role,
      isAdmin: profile.is_admin,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    }));

    const user = {
      id: userId,
      email: profile.email,
      role: profile.role,
      is_admin: profile.is_admin,
    };

    return NextResponse.json({ user, token });
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
