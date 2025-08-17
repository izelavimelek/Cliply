import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';
import { Brand } from '@/lib/mongodb/schemas';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = JSON.parse(atob(token));
      
      // Check if token is expired
      if (decoded.exp < Date.now()) {
        return NextResponse.json(
          { message: 'Token expired' },
          { status: 401 }
        );
      }
    } catch {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { name, description, industry, website } = await request.json();
    const ownerId = decoded.userId;

    if (!name) {
      return NextResponse.json(
        { message: 'Brand name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const brandsCollection = db.collection(Collections.BRANDS);

    // Create brand
    const now = new Date();
    const brand: Omit<Brand, '_id'> = {
      owner_id: ownerId,
      name,
      description,
      industry,
      website,
      created_at: now,
      updated_at: now,
    };

    const result = await brandsCollection.insertOne(brand);

    return NextResponse.json({ 
      message: 'Brand created successfully',
      brandId: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Brand creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
