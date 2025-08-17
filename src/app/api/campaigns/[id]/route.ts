import { NextResponse } from "next/server";
import { campaignUpdateSchema } from "@/lib/validators";
import { getCampaign, updateCampaign } from "@/lib/db";
import { logAuditEvent } from "@/lib/db";
import { ObjectId } from "mongodb";

type CampaignParams = { params: { id: string } };

export async function GET(_: Request, context: unknown) {
  try {
    const { params } = context as CampaignParams;
    const campaign = await getCampaign(params.id);
    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Campaign not found" }, 
      { status: 404 }
    );
  }
}

export async function PATCH(request: Request, context: unknown) {
  try {
    const { params } = context as CampaignParams;
    const json = await request.json();
    const parsed = campaignUpdateSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() }, 
        { status: 400 }
      );
    }
    
    // Convert string IDs to ObjectIds for MongoDB
    const updateData = { ...parsed.data };
    if (updateData.brand_id && typeof updateData.brand_id === 'string') {
      (updateData as Record<string, unknown>).brand_id = new ObjectId(updateData.brand_id);
    }
    
    // Update campaign using MongoDB
    const updatedCampaign = await updateCampaign(params.id, updateData as Record<string, unknown>);
    
    if (!updatedCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    // Log audit event
    await logAuditEvent(
      "system", // TODO: Get from auth context
      "campaign_updated",
      "campaign",
      params.id,
      { changes: parsed.data }
    );
    
    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" }, 
      { status: 500 }
    );
  }
}
