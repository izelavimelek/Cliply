import { NextRequest, NextResponse } from 'next/server';
import { getBrandIdForUser } from '@/lib/brand-utils';
import { getAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/db';
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const announcement = await getAnnouncement(id);

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this announcement
    if (user.role === 'brand') {
      const userBrandId = await getBrandIdForUser(user.userId);
      if (announcement.brand_id !== userBrandId) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
    } else if (user.role === 'creator') {
      // For creators, we need to check if they're part of the campaign
      // This is handled in the getAnnouncement function via creator_id filter
      // For now, we'll allow access if the announcement exists
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await request.json();
    const { content, title, is_pinned, priority } = body;

    // Get the existing announcement to check ownership
    const existingAnnouncement = await getAnnouncement(id);
    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Check if user owns this announcement
    const userBrandId = await getBrandIdForUser(user.userId);
    if (existingAnnouncement.brand_id !== userBrandId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Update the announcement
    const updateData: any = {
      updated_by: user.userId,
    };

    if (content !== undefined) updateData.content = content;
    if (title !== undefined) updateData.title = title;
    if (is_pinned !== undefined) updateData.is_pinned = is_pinned;
    if (priority !== undefined) updateData.priority = priority;

    const updatedAnnouncement = await updateAnnouncement(id, updateData);

    if (!updatedAnnouncement) {
      return NextResponse.json(
        { error: "Failed to update announcement" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement
    });

  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    // Get the existing announcement to check ownership
    const existingAnnouncement = await getAnnouncement(id);
    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Check if user owns this announcement
    const userBrandId = await getBrandIdForUser(user.userId);
    if (existingAnnouncement.brand_id !== userBrandId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Delete the announcement
    const success = await deleteAnnouncement(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete announcement" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Announcement deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
