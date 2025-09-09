import { NextRequest, NextResponse } from "next/server";
import { campaignCreateSchema, newCampaignCreateSchema } from "@/lib/validators";
import { createCampaign, getCampaigns } from "@/lib/db";
import { logAuditEvent } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getDatabase, Collections } from "@/lib/mongodb";

// Helper function to get user from auth token
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
      role: decoded.role,
      isAdmin: decoded.isAdmin,
    };
  } catch {
    return null;
  }
}

// Helper function to get brand ID for a user
async function getBrandIdForUser(userId: string): Promise<string | null> {
  try {
    const db = await getDatabase();
    const brandsCollection = db.collection(Collections.BRANDS);
    
    const brand = await brandsCollection.findOne({ owner_id: userId });
    return brand ? brand._id.toString() : null;
  } catch (error) {
    console.error('Error getting brand ID for user:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    
    console.log("GET /api/campaigns - Search params:", { platform, status, role });
    
    // Build filters
    const filters: { status?: string; platform?: string; brand_id?: string; includeArchived?: boolean } = {};
    
    if (status) filters.status = status;
    if (platform) filters.platform = platform;
    
    // If no specific status is requested, include archived campaigns
    if (!status) {
      filters.includeArchived = true;
    }
    
    // If role is brand, get the brand ID from the authenticated user
    if (role === "brand") {
      const user = await getUserFromToken(request);
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      if (user.role !== "brand") {
        return NextResponse.json(
          { error: "Access denied. Brand role required." },
          { status: 403 }
        );
      }

      const brandId = await getBrandIdForUser(user.userId);
      if (!brandId) {
        return NextResponse.json(
          { error: "No brand found for this user" },
          { status: 404 }
        );
      }

      filters.brand_id = brandId;
      console.log("Using authenticated user's brand_id:", brandId);
    }
    
    console.log("Filters being applied:", filters);
    
    const campaigns = await getCampaigns(filters);
    console.log("Campaigns returned from database:", campaigns.length);
    
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

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    console.log("Received campaign data:", JSON.stringify(json, null, 2));
    
    // Determine which schema to use based on the data
    // If it has rate_type, total_budget, start_date, end_date, use full schema
    // Otherwise, use the new campaign schema (basic fields only)
    const hasFullCampaignData = json.rate_type || json.total_budget || json.start_date || json.end_date;
    const schema = hasFullCampaignData ? campaignCreateSchema : newCampaignCreateSchema;
    
    console.log("Using schema:", hasFullCampaignData ? "full campaign" : "new campaign");
    
    const parsed = schema.safeParse(json);
    
    if (!parsed.success) {
      console.log("Validation errors:", parsed.error.format());
      return NextResponse.json(
        { error: parsed.error.format() }, 
        { status: 400 }
      );
    }
    
    console.log("Parsed campaign data:", JSON.stringify(parsed.data, null, 2));
    
    // Authenticate user and get their brand ID
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "brand") {
      return NextResponse.json(
        { error: "Access denied. Brand role required." },
        { status: 403 }
      );
    }

    const brandId = await getBrandIdForUser(user.userId);
    if (!brandId) {
      return NextResponse.json(
        { error: "No brand found for this user" },
        { status: 404 }
      );
    }

    // Use the authenticated user's brand ID and ensure draft status
    const campaignData = {
      ...parsed.data,
      brand_id: brandId,
      status: parsed.data.status || "draft", // Default to draft if not specified
    };

    console.log("Using authenticated brand_id:", brandId);
    
    const campaign = await createCampaign(campaignData);
    
    // Log audit event
    await logAuditEvent(
      brandId,
      "campaign_created",
      "campaign",
      campaign,
      { campaign_id: campaign, title: parsed.data.title }
    );
    
    // Return the campaign ID in the expected format
    return NextResponse.json({ id: campaign }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" }, 
      { status: 500 }
    );
  }
}
