import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { getDatabase } from '@/lib/mongodb';
import { User } from '@/lib/mongodb/schemas';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { error: 'No credential provided' },
        { status: 400 }
      );
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid Google token' },
        { status: 400 }
      );
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return NextResponse.json(
        { error: 'No email provided by Google' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();

    // Check if user already exists
    let user = await db.collection('users').findOne({ email });

    if (!user) {
      // Create new user
      const newUser = {
        email,
        display_name: name || email.split('@')[0],
        profile_picture: picture,
        google_id: googleId,
        role: 'creator', // Default role, can be changed later
        is_admin: false,
        theme_preference: 'light',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await db.collection('users').insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // Update existing user with Google info if not already set
      const updateData: any = {
        updated_at: new Date(),
      };

      if (!user.google_id) {
        updateData.google_id = googleId;
      }
      if (!user.profile_picture && picture) {
        updateData.profile_picture = picture;
      }
      if (!user.display_name && name) {
        updateData.display_name = name;
      }

      if (Object.keys(updateData).length > 1) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: updateData }
        );
        user = { ...user, ...updateData };
      }
    }

    // Generate JWT token
    if (!user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        role: user.role 
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '7d' }
    );

    // Return user data and token
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        is_admin: user.is_admin,
        theme_preference: user.theme_preference,
        display_name: user.display_name,
        profile_picture: user.profile_picture,
      },
      token,
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
