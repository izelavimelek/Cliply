import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Collections } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const campaignsCollection = db.collection(Collections.CAMPAIGNS);
    
    // Get all campaigns
    const allCampaigns = await campaignsCollection.find({}).toArray();
    
    return NextResponse.json({
      campaigns: allCampaigns,
      campaignCount: allCampaigns.length
    });
  } catch (error) {
    console.error("Error in debug campaigns:", error);
    return NextResponse.json(
      { message: "Failed to fetch debug data", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { campaignId, status } = await request.json();
    
    if (!campaignId || !status) {
      return NextResponse.json(
        { message: "Campaign ID and status are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const campaignsCollection = db.collection(Collections.CAMPAIGNS);
    
    // Update campaign status
    const result = await campaignsCollection.updateOne(
      { _id: campaignId },
      { $set: { status: status, updated_at: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "Campaign status updated successfully",
      campaignId,
      newStatus: status
    });
  } catch (error) {
    console.error("Error updating campaign status:", error);
    return NextResponse.json(
      { message: "Failed to update campaign status", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
