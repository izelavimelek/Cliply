import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const brandId = params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(brandId)) {
      return NextResponse.json(
        { message: 'Invalid brand ID format' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const brandsCollection = db.collection(Collections.BRANDS);

    // Find brand by ID
    const brand = await brandsCollection.findOne({ _id: new ObjectId(brandId) });

    if (!brand) {
      return NextResponse.json(
        { message: 'Brand not found' },
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
    console.error('Error fetching brand by ID:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
