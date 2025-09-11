import { NextRequest, NextResponse } from "next/server";
import { getDatabase, Collections } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const campaignsCollection = db.collection(Collections.CAMPAIGNS);
    
    // Get all campaigns without authentication
    const allCampaigns = await campaignsCollection.find({}).toArray();
    
    return NextResponse.json({
      campaigns: allCampaigns,
      campaignCount: allCampaigns.length
    });
  } catch (error) {
    console.error("Error in debug campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug campaigns data" }, 
      { status: 500 }
    );
  }
}