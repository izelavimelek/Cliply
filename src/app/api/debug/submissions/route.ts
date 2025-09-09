import { NextRequest, NextResponse } from "next/server";
import { getDatabase, Collections } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const submissionsCollection = db.collection(Collections.SUBMISSIONS);
    
    // Get all submissions
    const allSubmissions = await submissionsCollection.find({}).toArray();
    
    // Get all campaigns
    const campaignsCollection = db.collection(Collections.CAMPAIGNS);
    const allCampaigns = await campaignsCollection.find({}).toArray();
    
    return NextResponse.json({
      submissions: allSubmissions,
      campaigns: allCampaigns,
      submissionCount: allSubmissions.length,
      campaignCount: allCampaigns.length
    });
  } catch (error) {
    console.error("Error in debug submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data" }, 
      { status: 500 }
    );
  }
}