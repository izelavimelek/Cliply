import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

    const { campaignId, newBrandId } = await request.json();
    
    if (!campaignId || !newBrandId) {
      return NextResponse.json(
        { message: 'Campaign ID and new brand ID are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const campaignsCollection = db.collection(Collections.CAMPAIGNS);
    const brandsCollection = db.collection(Collections.BRANDS);

    // Verify the campaign exists
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) });
    if (!campaign) {
      return NextResponse.json(
        { message: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Verify the new brand exists
    const brand = await brandsCollection.findOne({ _id: new ObjectId(newBrandId) });
    if (!brand) {
      return NextResponse.json(
        { message: 'Brand not found' },
        { status: 404 }
      );
    }

    // Update the campaign's brand_id
    const result = await campaignsCollection.updateOne(
      { _id: new ObjectId(campaignId) },
      { 
        $set: { 
          brand_id: new ObjectId(newBrandId),
          updated_at: new Date()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Campaign transferred successfully',
      campaignId,
      newBrandId,
      oldBrandId: campaign.brand_id.toString()
    });
  } catch (error) {
    console.error('Error transferring campaign:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
