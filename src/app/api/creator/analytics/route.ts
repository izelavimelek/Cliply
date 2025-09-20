import { NextRequest, NextResponse } from "next/server";
import { getSubmissions, getPayouts } from "@/lib/db";
import { getDatabase } from "@/lib/mongodb";
import { Collections } from "@/lib/mongodb/schemas";
import { ObjectId } from "mongodb";

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

    // Get time range parameter
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch user's submissions and payouts
    const [submissions, payouts] = await Promise.all([
      getSubmissions({ creator_id: user.userId }),
      getPayouts(user.userId)
    ]);

    // Get campaign details for submissions
    const db = await getDatabase();
    const campaignsCollection = db.collection(Collections.CAMPAIGNS);
    
    // Process submissions to get campaign data
    const submissionCampaigns = new Map();
    const campaignDetails = new Map();
    
    for (const submission of submissions) {
      if (submission.campaign_id) {
        submissionCampaigns.set(submission.campaign_id.toString(), submission);
        
        // Get campaign details if not already fetched
        if (!campaignDetails.has(submission.campaign_id.toString())) {
          const campaign = await campaignsCollection.findOne({ 
            _id: new ObjectId(submission.campaign_id) 
          });
          if (campaign) {
            campaignDetails.set(submission.campaign_id.toString(), campaign);
          }
        }
      }
    }

    // Calculate analytics metrics
    const totalSubmissions = submissions.length;
    const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length;
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
    
    // Calculate approval rate
    const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;
    
    // Calculate campaigns joined (unique campaigns)
    const uniqueCampaignIds = new Set(submissions.map(s => s.campaign_id?.toString()).filter(Boolean));
    const totalCampaignsJoined = uniqueCampaignIds.size;
    
    // Calculate active campaigns (campaigns with pending submissions)
    const activeCampaignIds = new Set(
      submissions
        .filter(s => s.status === 'pending' && s.campaign_id)
        .map(s => s.campaign_id.toString())
    );
    const activeCampaigns = activeCampaignIds.size;
    
    // Calculate completed campaigns (campaigns with at least one approved submission)
    const completedCampaignIds = new Set(
      submissions
        .filter(s => s.status === 'approved' && s.campaign_id)
        .map(s => s.campaign_id.toString())
    );
    const completedCampaigns = completedCampaignIds.size;
    
    // Calculate earnings metrics
    const totalEarnings = payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const pendingEarnings = payouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const averageEarningsPerCampaign = completedCampaigns > 0 ? totalEarnings / completedCampaigns : 0;
    
    // Calculate views metrics
    const totalViews = submissions
      .filter(s => s.views)
      .reduce((sum, s) => sum + (s.views || 0), 0);
    
    const averageViewsPerSubmission = approvedSubmissions > 0 ? totalViews / approvedSubmissions : 0;
    
    // Calculate average approval time
    let totalApprovalTime = 0;
    let approvalCount = 0;
    
    submissions
      .filter(s => s.status === 'approved' && s.verified_at && s.created_at)
      .forEach(s => {
        const created = new Date(s.created_at!);
        const approved = new Date(s.verified_at!);
        const diffTime = approved.getTime() - created.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        totalApprovalTime += diffDays;
        approvalCount++;
      });
    
    const averageApprovalTime = approvalCount > 0 ? totalApprovalTime / approvalCount : 0;

    // Get top performing content (approved submissions with views)
    const topContent = submissions
      .filter(s => s.status === 'approved' && s.views && s.views > 0)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(s => {
        const campaign = campaignDetails.get(s.campaign_id?.toString());
        return {
          id: s._id?.toString(),
          title: campaign?.title || 'Campaign Submission',
          platform: getPlatformFromUrl(s.post_url || ''),
          views: s.views || 0,
          engagement: 0, // TODO: Calculate from platform APIs
          earnings: s.earnings || 0,
          date: s.verified_at || s.created_at
        };
      });

    // Helper function to detect platform from URL
    function getPlatformFromUrl(url: string): string {
      if (!url || url.trim() === '') return 'Unknown';
      
      try {
        const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
        const domain = new URL(cleanUrl).hostname.toLowerCase();
        
        if (domain.includes('tiktok.com')) return 'TikTok';
        if (domain.includes('instagram.com')) return 'Instagram';
        if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'YouTube';
        if (domain.includes('twitter.com') || domain.includes('x.com')) return 'Twitter/X';
        if (domain.includes('facebook.com') || domain.includes('fb.com')) return 'Facebook';
        if (domain.includes('linkedin.com')) return 'LinkedIn';
        if (domain.includes('snapchat.com')) return 'Snapchat';
        
        return 'Unknown';
      } catch {
        return 'Unknown';
      }
    }

    const analyticsData = {
      // Campaign Performance
      totalCampaignsJoined,
      activeCampaigns,
      completedCampaigns,
      approvalRate: Math.round(approvalRate * 10) / 10, // Round to 1 decimal place
      
      // Earnings & Performance
      totalEarnings: Math.round(totalEarnings * 100) / 100, // Round to 2 decimal places
      averageEarningsPerCampaign: Math.round(averageEarningsPerCampaign * 100) / 100,
      pendingEarnings: Math.round(pendingEarnings * 100) / 100,
      
      // Content Performance
      totalSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      
      // Time-based metrics
      averageApprovalTime: Math.round(averageApprovalTime * 10) / 10, // Round to 1 decimal place
      totalViews,
      averageViewsPerSubmission: Math.round(averageViewsPerSubmission)
    };

    return NextResponse.json({
      overview: analyticsData,
      topContent,
      timeRange,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching creator analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" }, 
      { status: 500 }
    );
  }
}
