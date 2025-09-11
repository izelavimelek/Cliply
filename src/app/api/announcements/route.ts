import { NextRequest, NextResponse } from 'next/server';
import { getBrandIdForUser } from '@/lib/brand-utils';
import { createAnnouncement, getAnnouncements } from '@/lib/db';
import { ObjectId } from 'mongodb';

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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');
    const brandId = searchParams.get('brand_id');

    if (!campaignId && !brandId) {
      return NextResponse.json(
        { error: "campaign_id or brand_id is required" },
        { status: 400 }
      );
    }

    // Get announcements based on user role
    let announcements;
    if (user.role === 'brand') {
      // Brand users can see all announcements for their campaigns
      const userBrandId = await getBrandIdForUser(user.userId);
      if (!userBrandId) {
        return NextResponse.json(
          { error: "Brand not found for user" },
          { status: 404 }
        );
      }
      announcements = await getAnnouncements({ 
        campaign_id: campaignId || undefined,
        brand_id: userBrandId 
      });
    } else if (user.role === 'creator') {
      // Creator users can only see announcements for campaigns they've joined
      announcements = await getAnnouncements({ 
        campaign_id: campaignId || undefined,
        creator_id: user.userId 
      });
    } else {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== 'brand') {
      return NextResponse.json(
        { error: "Access denied. Brand role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { campaign_id, content, title, priority = 'MEDIUM' } = body;

    if (!campaign_id || !content) {
      return NextResponse.json(
        { error: "campaign_id and content are required" },
        { status: 400 }
      );
    }

    // Get brand ID for the user
    const brandId = await getBrandIdForUser(user.userId);
    if (!brandId) {
      return NextResponse.json(
        { error: "Brand not found for user" },
        { status: 404 }
      );
    }

    // Create the announcement
    const announcementId = await createAnnouncement({
      campaign_id: new ObjectId(campaign_id),
      brand_id: new ObjectId(brandId),
      content,
      title,
      is_pinned: false,
      priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
      created_by: user.userId,
    });

    return NextResponse.json({
      message: "Announcement created successfully",
      announcement_id: announcementId
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
