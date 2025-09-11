import { NextRequest, NextResponse } from "next/server";
import { submissionCreateSchema } from "@/lib/validators";
import { createSubmission, getSubmissions, getProfile } from "@/lib/db";
import { logAuditEvent } from "@/lib/db";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaign_id") || searchParams.get("campaignId");
    const creatorId = searchParams.get("creatorId");
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    
    // Get user from auth token for role-based filtering
    const user = await getUserFromToken(request as NextRequest);
    
    let submissions;
    
    if (role === "brand" && user?.role === "brand") {
      // For brand role, get submissions for campaigns owned by this brand
      const { getCampaigns } = await import("@/lib/db");
      
      // Get the brand ID from the user's brand profile
      let brandId = user.userId;
      
      try {
        const authHeader = request.headers.get('authorization');
        const brandResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/brands/my-brand`, {
          headers: {
            'Authorization': authHeader || '',
            'Content-Type': 'application/json',
          },
        });
        
        if (brandResponse.ok) {
          const brandData = await brandResponse.json();
          brandId = brandData.id || brandData._id || user.userId;
        }
      } catch (error) {
        console.log('Could not fetch brand data, using user ID:', error);
      }
      
      // Only proceed if we have a valid brand ID (not the user ID)
      if (brandId === user.userId) {
        console.log('No brand found for user, returning empty submissions');
        return NextResponse.json({ 
          items: [], 
          page: 1, 
          total: 0 
        });
      }
      
      const brandCampaigns = await getCampaigns({ brand_id: brandId });
      const campaignIds = brandCampaigns.map(c => c._id?.toString()).filter(Boolean);
      
      
      // If a specific campaign_id is requested, verify it belongs to this brand
      if (campaignId) {
        if (!campaignIds.includes(campaignId)) {
          return NextResponse.json({ 
            items: [], 
            page: 1, 
            total: 0 
          });
        }
        // Get submissions for the specific campaign
        submissions = await getSubmissions({
          campaign_id: campaignId,
          creator_id: creatorId || undefined,
          status: status || undefined,
        });
      } else {
        // Get all submissions for brand's campaigns
        const allSubmissions = await getSubmissions({
          creator_id: creatorId || undefined,
          status: status || undefined,
        });
        
        // Filter submissions to only include those from brand's campaigns
        submissions = allSubmissions.filter(submission => {
          const submissionCampaignId = submission.campaign_id.toString();
          const isMatch = campaignIds.includes(submissionCampaignId);
          return isMatch;
        });
      }
    } else {
      // Default behavior - get submissions based on filters
      submissions = await getSubmissions({
        campaign_id: campaignId || undefined,
        creator_id: creatorId || undefined,
        status: status || undefined,
      });
    }
    
    // Enrich submissions with creator profile data
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (submission: any) => {
        try {
          const creatorProfile = await getProfile(submission.creator_id);
          return {
            ...submission,
            id: submission._id?.toString() || submission.id,
            creator_name: creatorProfile?.display_name || `Creator ${submission.creator_id.slice(-4)}`,
            creator_username: creatorProfile?.display_name ? `@${creatorProfile.display_name.toLowerCase().replace(/\s+/g, '')}` : `@creator${submission.creator_id.slice(-4)}`,
            creator_bio: creatorProfile?.bio || null,
            creator_website: creatorProfile?.website || null,
          };
        } catch (error) {
          console.error('Error fetching creator profile for submission:', submission._id, error);
          // Fallback to generated name if profile fetch fails
          return {
            ...submission,
            id: submission._id?.toString() || submission.id,
            creator_name: `Creator ${submission.creator_id.slice(-4)}`,
            creator_username: `@creator${submission.creator_id.slice(-4)}`,
            creator_bio: null,
            creator_website: null,
          };
        }
      })
    );
    
    return NextResponse.json({ 
      items: enrichedSubmissions, 
      page: 1, 
      total: enrichedSubmissions.length 
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
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

    const json = await request.json();
    
    // Enhanced validation for submission data
    const submissionData = {
      campaign_id: json.campaign_id,
      post_url: json.post_url || '',
      media_urls: json.media_urls || [],
    };

    // Validate required fields
    if (!submissionData.campaign_id) {
      return NextResponse.json(
        { error: "Campaign ID is required" }, 
        { status: 400 }
      );
    }

    if (!submissionData.post_url && submissionData.media_urls.length === 0) {
      return NextResponse.json(
        { error: "Either post URL or media files are required" }, 
        { status: 400 }
      );
    }
    
    // Use actual user ID instead of dummy
    const submission = await createSubmission({
      ...submissionData,
      creator_id: user.userId,
      status: 'pending',
    });
    
    // Log audit event
    await logAuditEvent(
      user.userId,
      "submission_created",
      `Submission created: ${submission} for campaign ${submissionData.campaign_id}`
    );
    
    return NextResponse.json({ 
      id: submission,
      campaign_id: submissionData.campaign_id,
      creator_id: user.userId,
      post_url: submissionData.post_url,
      media_urls: submissionData.media_urls,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" }, 
      { status: 500 }
    );
  }
}
