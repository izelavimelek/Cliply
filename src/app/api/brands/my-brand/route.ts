import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
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

    const userId = decoded.userId;

    const db = await getDatabase();
    const brandsCollection = db.collection(Collections.BRANDS);

    // Find brand owned by this user
    const brand = await brandsCollection.findOne({ owner_id: userId });

    if (!brand) {
      return NextResponse.json(
        { message: 'No brand found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: brand._id.toString(),
      name: brand.name,
      description: brand.description,
      industry: brand.industry,
      website: brand.website,
      logo_url: brand.logo_url,
      created_at: brand.created_at,
      updated_at: brand.updated_at
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
