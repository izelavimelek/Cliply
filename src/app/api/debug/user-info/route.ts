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
    const userEmail = decoded.email;
    const userRole = decoded.role;

    const db = await getDatabase();
    
    // Get user profile
    const profilesCollection = db.collection(Collections.PROFILES);
    const userProfile = await profilesCollection.findOne({ user_id: userId });
    
    // Get brand owned by this user
    const brandsCollection = db.collection(Collections.BRANDS);
    const userBrand = await brandsCollection.findOne({ owner_id: userId });
    
    // Get campaigns for this user's brand
    let userCampaigns = [];
    if (userBrand) {
      const campaignsCollection = db.collection(Collections.CAMPAIGNS);
      userCampaigns = await campaignsCollection.find({ brand_id: userBrand._id }).toArray();
    }

    // Get all campaigns to see what exists
    const allCampaigns = await db.collection(Collections.CAMPAIGNS).find({}).toArray();

    return NextResponse.json({
      user: {
        id: userId,
        email: userEmail,
        role: userRole,
        profile: userProfile ? {
          display_name: userProfile.display_name,
          bio: userProfile.bio,
          website: userProfile.website,
          social_links: userProfile.social_links,
        } : null
      },
      brand: userBrand ? {
        id: userBrand._id.toString(),
        name: userBrand.name,
        description: userBrand.description,
        industry: userBrand.industry,
        website: userBrand.website,
      } : null,
      userCampaigns: userCampaigns.map(c => ({
        id: c._id.toString(),
        title: c.title,
        brand_id: c.brand_id.toString(),
        status: c.status
      })),
      allCampaigns: allCampaigns.map(c => ({
        id: c._id.toString(),
        title: c.title,
        brand_id: c.brand_id.toString(),
        status: c.status
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
