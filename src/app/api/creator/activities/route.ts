import { NextRequest, NextResponse } from "next/server";
import { getSubmissions, getPayouts, getCampaign } from "@/lib/db";
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
      const campaign = await campaignsCollection.findOne({ _id: submission.campaign_id });
      
      activities.push({
        id: submission._id?.toString(),
        type: 'submission',
        status: submission.status,
        campaign_title: campaign?.title || 'Unknown Campaign',
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
      const campaign = submission ? await campaignsCollection.findOne({ _id: submission.campaign_id }) : null;
      
      activities.push({
        id: payout._id?.toString(),
        type: 'payout',
        status: payout.status,
        campaign_title: campaign?.title || 'Unknown Campaign',
        amount: payout.amount,
        date: payout.created_at,
        processed_at: payout.processed_at,
        stripe_payment_intent_id: payout.stripe_payment_intent_id
      });
    }

    // Sort activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit to last 10 activities
    const recentActivities = activities.slice(0, 10);

    return NextResponse.json({
      activities: recentActivities,
      total: activities.length
    });

  } catch (error) {
    console.error("Error fetching creator activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
