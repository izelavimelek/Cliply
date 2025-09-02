import { NextRequest, NextResponse } from "next/server";
import { getCampaign, updateCampaign, deleteCampaign } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    
    if (!ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        { error: "Invalid campaign ID format" },
        { status: 400 }
      );
    }

    const campaign = await getCampaign(campaignId);
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    
    if (!ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        { error: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Validate required fields
    if (updateData.title && updateData.title.trim().length === 0) {
      return NextResponse.json(
        { error: "Campaign title cannot be empty" },
        { status: 400 }
      );
    }

    if (updateData.description && updateData.description.trim().length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters long" },
        { status: 400 }
      );
    }

    if (updateData.total_budget && updateData.total_budget < 10) {
      return NextResponse.json(
        { error: "Total budget must be at least $10" },
        { status: 400 }
      );
    }

    if (updateData.rate_per_thousand && updateData.rate_per_thousand <= 0) {
      return NextResponse.json(
        { error: "Rate per thousand views must be greater than 0" },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (updateData.start_date && updateData.end_date) {
      const startDate = new Date(updateData.start_date);
      const endDate = new Date(updateData.end_date);
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    const validStatuses = ['draft', 'active', 'pending_budget', 'paused', 'completed', 'deleted'];
    if (updateData.status && !validStatuses.includes(updateData.status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Validate budget_status if provided
    const validBudgetStatuses = ['pending', 'funded', 'insufficient'];
    if (updateData.budget_status && !validBudgetStatuses.includes(updateData.budget_status)) {
      return NextResponse.json(
        { error: "Invalid budget status value" },
        { status: 400 }
      );
    }

    // Validate platform if provided
    const validPlatforms = ['youtube', 'tiktok', 'instagram'];
    if (updateData.platform && !validPlatforms.includes(updateData.platform)) {
      return NextResponse.json(
        { error: "Invalid platform value" },
        { status: 400 }
      );
    }

    const updatedCampaign = await updateCampaign(campaignId, updateData);
    
    if (!updatedCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    
    if (!ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        { error: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const deleted = await deleteCampaign(campaignId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "Campaign not found or failed to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Campaign deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
