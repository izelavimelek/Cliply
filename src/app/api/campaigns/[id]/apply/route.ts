import { NextRequest, NextResponse } from "next/server";
import { createCampaignApplication, getCampaignApplications, getCampaign } from "@/lib/db";
import { ObjectId } from "mongodb";

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: campaignId } = await params;
    
    // Check if campaign exists
    const campaign = await getCampaign(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if campaign is active
    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      );
    }

    // Check if user has already applied to this campaign
    const existingApplications = await getCampaignApplications({
      creator_id: user.userId,
      campaign_id: campaignId
    });

    if (existingApplications.length > 0) {
      return NextResponse.json(
        { error: "You have already applied to this campaign" },
        { status: 400 }
      );
    }

    // Create the application (automatically approved)
    const application = await createCampaignApplication({
      campaign_id: new ObjectId(campaignId),
      creator_id: user.userId,
      status: 'approved'
    });

    return NextResponse.json({
      message: "Application submitted successfully",
      application_id: application
    }, { status: 201 });

  } catch (error) {
    console.error("Error applying to campaign:", error);
    return NextResponse.json(
      { error: "Failed to apply to campaign" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;
    
    // Get application status for this user and campaign
    const applications = await getCampaignApplications({
      creator_id: user.userId,
      campaign_id: campaignId
    });

    if (applications.length === 0) {
      return NextResponse.json({
        has_applied: false,
        status: null
      });
    }

    return NextResponse.json({
      has_applied: true,
      status: applications[0].status,
      applied_at: applications[0].applied_at
    });

  } catch (error) {
    console.error("Error checking application status:", error);
    return NextResponse.json(
      { error: "Failed to check application status" },
      { status: 500 }
    );
  }
}
