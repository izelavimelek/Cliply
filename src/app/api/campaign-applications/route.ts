import { NextResponse } from "next/server";
import { getDatabase, Collections } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const creatorId = searchParams.get("creatorId");
    const status = searchParams.get("status");
    
    const db = await getDatabase();
    const applicationsCollection = db.collection(Collections.CAMPAIGN_APPLICATIONS);
    
    let query = {};
    
    if (campaignId) {
      query = { ...query, campaign_id: campaignId };
    }
    
    if (creatorId) {
      query = { ...query, creator_id: creatorId };
    }
    
    if (status) {
      query = { ...query, status: status };
    }
    
    const applications = await applicationsCollection.find(query).toArray();
    
    return NextResponse.json({ 
      items: applications, 
      page: 1, 
      total: applications.length 
    });
  } catch (error) {
    console.error("Error fetching campaign applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign applications" }, 
      { status: 500 }
    );
  }
}
