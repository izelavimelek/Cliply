import { NextRequest, NextResponse } from "next/server";
import { getSubmissions, getPayouts, getCampaign } from "@/lib/db";
import { getDatabase, Collections } from "@/lib/mongodb";
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

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = (page - 1) * limit;

    // Fetch user's submissions and payouts
    const [submissions, payouts] = await Promise.all([
      getSubmissions({ creator_id: user.userId }),
      getPayouts(user.userId)
    ]);

    // Get campaign details for submissions
    const db = await getDatabase();
    const campaignsCollection = db.collection(Collections.CAMPAIGNS);
    
    const activities = [];

    // Process submissions
    for (const submission of submissions) {
      console.log('Processing submission:', submission._id, 'campaign_id:', submission.campaign_id);
      const campaign = await campaignsCollection.findOne({ _id: new ObjectId(submission.campaign_id) });
      console.log('Found campaign:', campaign ? { id: campaign._id, title: campaign.title } : 'NOT FOUND');
      
      activities.push({
        id: submission._id?.toString(),
        type: 'submission',
        status: submission.status,
        campaign_title: campaign?.title || 'Campaign Submission',
        amount: submission.earnings || 0,
        date: submission.created_at,
        post_url: submission.post_url,
        views: submission.views || 0,
        verified_at: submission.verified_at
      });
    }

    // Process payouts
    for (const payout of payouts) {
      // Get submission details for payout
      const submission = submissions.find(s => s._id?.toString() === payout.submission_id?.toString());
      const campaign = submission ? await campaignsCollection.findOne({ _id: new ObjectId(submission.campaign_id) }) : null;
      
      activities.push({
        id: payout._id?.toString(),
        type: 'payout',
        status: payout.status,
        campaign_title: campaign?.title || 'Campaign Submission',
        amount: payout.amount,
        date: payout.created_at,
        processed_at: payout.processed_at,
        stripe_payment_intent_id: payout.stripe_payment_intent_id
      });
    }

    // Sort activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    const totalActivities = activities.length;
    const paginatedActivities = activities.slice(offset, offset + limit);
    const totalPages = Math.ceil(totalActivities / limit);

    return NextResponse.json({
      activities: paginatedActivities,
      total: totalActivities,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error("Error fetching creator activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
