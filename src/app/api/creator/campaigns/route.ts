import { NextRequest, NextResponse } from "next/server";
import { getCampaignApplications, getCampaign } from "@/lib/db";
import { getDatabase, Collections } from "@/lib/mongodb";

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = JSON.parse(atob(token));
    
    // Check if token is expired
    if (decoded.exp < Date.now()) {
      return null;
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "creator") {
      return NextResponse.json(
        { error: "Access denied. Creator role required." },
        { status: 403 }
      );
    }

    // Get user's campaign applications
    console.log('Fetching applications for creator:', user.userId);
    const applications = await getCampaignApplications({ creator_id: user.userId });
    console.log('Found applications:', applications.length);
    
    // Get campaign details for each application
    const db = await getDatabase();
    const campaignsCollection = db.collection(Collections.CAMPAIGNS);
    
    const joinedCampaigns = [];
    
    for (const application of applications) {
      console.log('Processing application:', application);
      const campaign = await campaignsCollection.findOne({ _id: application.campaign_id });
      console.log('Found campaign for application:', campaign ? campaign.title : 'NOT FOUND');
      
      if (campaign) {
        const joinedCampaign = {
          _id: campaign._id?.toString(),
          title: campaign.title,
          status: campaign.status,
          application_status: application.status,
          applied_at: application.applied_at,
          approved_at: application.approved_at,
          budget_status: campaign.budget_status,
          total_budget: campaign.total_budget,
          platforms: campaign.platforms || [campaign.platform].filter(Boolean),
          category: campaign.category
        };
        console.log('Adding joined campaign:', joinedCampaign);
        joinedCampaigns.push(joinedCampaign);
      }
    }

    // Sort by applied_at date (most recent first)
    joinedCampaigns.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());

    console.log('Final joined campaigns:', joinedCampaigns);
    console.log('Returning response with', joinedCampaigns.length, 'campaigns');

    return NextResponse.json({
      items: joinedCampaigns,
      total: joinedCampaigns.length
    });

  } catch (error) {
    console.error("Error fetching creator campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
