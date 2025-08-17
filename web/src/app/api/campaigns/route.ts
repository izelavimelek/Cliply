import { NextResponse } from "next/server";
import { campaignCreateSchema } from "@/lib/validators";
import { createCampaign, getCampaigns } from "@/lib/db";
import { logAuditEvent } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");
    
    const campaigns = await getCampaigns({
      platform: platform || undefined,
      status: status || undefined,
    });
    
    return NextResponse.json({ 
      items: campaigns, 
      page: 1, 
      total: campaigns.length 
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = campaignCreateSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() }, 
        { status: 400 }
      );
    }
    
    const campaign = await createCampaign(parsed.data);
    
    // Log audit event
    await logAuditEvent(
      null, // TODO: Get from auth context
      "campaign_created",
      { campaign_id: campaign.id, title: campaign.title }
    );
    
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" }, 
      { status: 500 }
    );
  }
}
