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
      email: brand.email,
      phone: brand.phone,
      address: brand.address,
      city: brand.city,
      state: brand.state,
      country: brand.country,
      zipCode: brand.zipCode,
      logo: brand.logo,
      coverImage: brand.coverImage,
      companySize: brand.companySize,
      socialMedia: brand.socialMedia || {},
      paymentSettings: brand.paymentSettings || {},
      notificationSettings: brand.notificationSettings || {},
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

export async function PUT(request: NextRequest) {
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
    const updateData = await request.json();
    
    console.log('Brand update request received:', {
      userId,
      updateData: updateData.profile ? updateData.profile : updateData
    });

    const db = await getDatabase();
    const brandsCollection = db.collection(Collections.BRANDS);

    // Find and update brand owned by this user
    const updateFields: any = {
      updated_at: new Date()
    };

    // Update profile data if provided
    if (updateData.profile) {
      Object.assign(updateFields, updateData.profile);
    }

    // Update payment settings if provided
    if (updateData.payment) {
      updateFields.paymentSettings = updateData.payment;
    }

    // Update notification settings if provided
    if (updateData.notifications) {
      updateFields.notificationSettings = updateData.notifications;
    }
    
    console.log('Updating brand with fields:', updateFields);

    const result = await brandsCollection.updateOne(
      { owner_id: userId },
      { $set: updateFields }
    );
    
    console.log('Update result:', result);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'No brand found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Brand settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
