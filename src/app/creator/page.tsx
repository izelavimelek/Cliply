"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import Link from "next/link";

// Type definitions
interface Activity {
  id: string;
  type: 'submission' | 'payout';
  status: string;
  campaign_id?: string;
  campaign_title: string;
  amount: number;
  date: string;
  post_url?: string;
  views?: number;
  verified_at?: string;
  processed_at?: string;
  stripe_payment_intent_id?: string;
}

export default function CreatorDashboard() {
  const { user } = useAuth();
  
  // TODO: Implement URL-based analytics fetching
  // 1. Create API endpoints to fetch real-time analytics from social media platforms
  // 2. For each approved submission with post_url, call platform-specific APIs:
  //    - TikTok: Use TikTok Analytics API to get views, likes, comments, shares
  //    - Instagram: Use Instagram Basic Display API or Instagram Graph API
  //    - YouTube: Use YouTube Data API v3 to get views, likes, comments
  // 3. Calculate engagement rate: (likes + comments + shares) / views * 100
  // 4. Map platform from post_url domain (tiktok.com, instagram.com, youtube.com)
  // 5. Fetch campaign details to get actual earnings amount
  // 6. Implement caching mechanism to avoid rate limiting
  // 7. Add error handling for failed API calls
  // 8. Consider using webhooks for real-time updates instead of polling
  
  // Helper function to extract platform from post URL
  const getPlatformFromUrl = (url: string): string => {
    if (!url || url.trim() === '') {
      console.log('No URL provided for platform detection');
      return 'Unknown';
    }
    
    try {
      // Handle both http and https URLs
      const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
      const domain = new URL(cleanUrl).hostname.toLowerCase();
      
      console.log('Detecting platform for URL:', url, 'Domain:', domain);
      
      if (domain.includes('tiktok.com')) return 'TikTok';
      if (domain.includes('instagram.com')) return 'Instagram';
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'YouTube';
      if (domain.includes('twitter.com') || domain.includes('x.com')) return 'Twitter/X';
      if (domain.includes('facebook.com') || domain.includes('fb.com')) return 'Facebook';
      if (domain.includes('linkedin.com')) return 'LinkedIn';
      if (domain.includes('snapchat.com')) return 'Snapchat';
      
      console.log('Unknown platform for domain:', domain);
      return 'Unknown';
    } catch (error) {
      console.log('Error parsing URL:', url, error);
      return 'Unknown';
    }
  };

  // Helper function to format date as DD-MONTH-YYYY
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString; // Return original if parsing fails
    }
  };

  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeSubmissions: 0,
    completedCampaigns: 0,
    totalViews: 0,
    totalEngagement: 0,
    pendingPayouts: 0
  });

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state for recent activity
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalActivities, setTotalActivities] = useState(0);

  // Fetch activities with pagination
  const fetchActivities = async (page: number = currentPage) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch activities with pagination
      const activitiesResponse = await fetch(`/api/creator/activities?page=${page}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!activitiesResponse.ok) {
        throw new Error('Failed to fetch activities');
      }

      const activitiesData = await activitiesResponse.json();
      setRecentActivity(activitiesData.activities || []);
      setTotalPages(activitiesData.totalPages || 1);
      setHasNextPage(activitiesData.hasNextPage || false);
      setHasPrevPage(activitiesData.hasPrevPage || false);
      setTotalActivities(activitiesData.total || 0);

    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all activities for stats calculation (separate from paginated activities)
  const fetchAllActivities = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch all activities for stats
      const activitiesResponse = await fetch('/api/creator/activities?page=1&limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!activitiesResponse.ok) {
        throw new Error('Failed to fetch activities');
      }

      const activitiesData = await activitiesResponse.json();
      const activities = activitiesData.activities || [];
      
      // Debug logging
      console.log('Total activities received:', activities.length);
      console.log('Activities data:', activities);
      
      // Calculate stats from all activities
      const totalEarnings = activities
        .filter((a: Activity) => a.type === 'payout' && a.status === 'completed')
        .reduce((sum: number, a: Activity) => sum + a.amount, 0);
      
      const activeSubmissions = activities
        .filter((a: Activity) => a.type === 'submission' && a.status === 'pending').length;
      
      // Count unique campaigns joined (not total submissions)
      const submissionActivities = activities.filter((a: Activity) => a.type === 'submission');
      const uniqueCampaignIds = new Set(
        submissionActivities
          .filter((a: Activity) => a.campaign_id) // Only include activities with campaign_id
          .map((a: Activity) => a.campaign_id)
      );
      const joinedCampaigns = uniqueCampaignIds.size;
      
      console.log('Submission activities:', submissionActivities.length);
      console.log('Unique campaigns joined:', joinedCampaigns);
      console.log('Campaign IDs:', Array.from(uniqueCampaignIds));
      
      const totalViews = activities
        .filter((a: Activity) => a.type === 'submission' && a.views)
        .reduce((sum: number, a: Activity) => sum + (a.views || 0), 0);
      
      const pendingPayouts = activities
        .filter((a: Activity) => a.type === 'payout' && a.status === 'pending')
        .reduce((sum: number, a: Activity) => sum + a.amount, 0);

      // Calculate earnings from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const earningsLast30Days = activities
        .filter((a: Activity) => {
          if (a.type !== 'payout' || a.status !== 'completed') return false;
          const activityDate = new Date(a.date);
          return activityDate >= thirtyDaysAgo;
        })
        .reduce((sum: number, a: Activity) => sum + a.amount, 0);

      setStats({
        totalEarnings,
        activeSubmissions,
        completedCampaigns: joinedCampaigns,
        totalViews,
        totalEngagement: earningsLast30Days, // Now using last 30 days earnings
        pendingPayouts
      });

      // Fetch approved submissions for top performing content
      const approvedSubmissions = activities
        .filter((a: Activity) => {
          const isSubmission = a.type === 'submission';
          const isApproved = a.status === 'approved' || a.status === 'Approved' || a.status === 'APPROVED';
          return isSubmission && isApproved;
        })
        .slice(0, 3); // Show top 3 approved submissions
      
      const mappedSubmissions = approvedSubmissions.map((submission: Activity) => {
        console.log('Mapping submission:', {
          id: submission.id,
          title: submission.campaign_title,
          post_url: submission.post_url,
          views: submission.views
        });
        
        // Try to detect platform from post_url, fallback to campaign data if needed
        let platform = getPlatformFromUrl(submission.post_url || '');
        
        // If platform is still unknown and we have a post_url, try some additional parsing
        if (platform === 'Unknown' && submission.post_url) {
          const url = submission.post_url.toLowerCase();
          if (url.includes('tiktok')) platform = 'TikTok';
          else if (url.includes('instagram')) platform = 'Instagram';
          else if (url.includes('youtube') || url.includes('youtu.be')) platform = 'YouTube';
          else if (url.includes('twitter') || url.includes('x.com')) platform = 'Twitter/X';
          else if (url.includes('facebook')) platform = 'Facebook';
          else if (url.includes('linkedin')) platform = 'LinkedIn';
          else if (url.includes('snapchat')) platform = 'Snapchat';
        }
        
        return {
          id: submission.id,
          title: submission.campaign_title || 'Campaign Submission',
          platform: platform,
          views: submission.views || 0,
          engagement: 0, // TODO: Calculate engagement from post_url API calls
          earnings: 0, // TODO: Calculate earnings from campaign data
          post_url: submission.post_url,
          campaign_id: submission.id // TODO: Map to actual campaign_id
        };
      });

      setTopPerformingContent(mappedSubmissions);

    } catch (err) {
      console.error('Error fetching all activities:', err);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchAllActivities();
      fetchActivities();
    }
  }, [user]);

  // Fetch activities when page changes
  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [currentPage, user]);

  const [topPerformingContent, setTopPerformingContent] = useState<{
    id: string;
    title: string;
    platform: string;
    views: number;
    engagement: number;
    earnings: number;
    post_url?: string;
    campaign_id: string;
  }[]>([]);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="p-6 bg-neutral-800 dark:bg-white border-neutral-800 dark:border-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-white dark:text-gray-900">Quick Actions</h2>
            <p className="text-gray-300 dark:text-gray-600">Get started with your creator journey</p>
          </div>
          <div className="flex gap-3">
            <Link href="/creator/discover">
              <Button className="flex items-center gap-2 bg-white hover:bg-gray-300 text-gray-900 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white">
                <Target className="h-4 w-4 !text-gray-900 dark:!text-white" />
                Discover Campaigns
              </Button>
            </Link>
            <Link href="/creator/submissions">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border border-gray-400 text-white hover:bg-white hover:text-black dark:border-gray-600 dark:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-white h-9 px-4 py-2">
                <MessageCircle className="h-4 w-4" />
                View My Submissions
              </button>
            </Link>
            <Link href="/creator/analytics">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border border-gray-400 text-white hover:bg-white hover:text-black dark:border-gray-600 dark:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-white h-9 px-4 py-2">
                <TrendingUp className="h-4 w-4" />
                View Analytics
              </button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Total Earnings (Last 30 Days) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings (Last 30 Days)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEngagement.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEngagement === 0 ? 'No earnings in last 30 days' : 'Earned this month'}
            </p>
          </CardContent>
        </Card>

        {/* 2. Total Earnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEarnings === 0 ? 'Your total earning so far' : '+12% from last month'}
            </p>
          </CardContent>
        </Card>

        {/* 3. Pending Payouts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingPayouts === 0 ? 'No pending payouts' : 'Awaiting payment'}
            </p>
          </CardContent>
        </Card>

        {/* 4. Joined Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joined Campaigns</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedCampaigns === 0 ? 'No joined campaigns yet' : 'Campaigns you\'ve joined'}
            </p>
          </CardContent>
        </Card>

        {/* 5. Pending Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubmissions === 0 ? 'No pending submissions' : 'Awaiting review'}
            </p>
          </CardContent>
        </Card>

        {/* 6. Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalViews === 0 ? 'No views yet' : 'Across all platforms'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Performing Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading activities...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-600">Error loading activities: {error}</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground mb-4">Your submissions and payments will appear here once you start participating in campaigns.</p>
                <Link href="/creator/discover">
                  <Button variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Browse Campaigns
                  </Button>
                </Link>
              </div>
            ) : (
              recentActivity.map((activity) => {
                const getActivityIcon = () => {
                  if (activity.type === 'submission') {
                    switch (activity.status) {
                      case 'approved':
                        return <CheckCircle className="w-4 h-4 text-green-500" />;
                      case 'pending':
                        return <Clock className="w-4 h-4 text-yellow-500" />;
                      case 'rejected':
                        return <XCircle className="w-4 h-4 text-red-500" />;
                      default:
                        return <MessageCircle className="w-4 h-4 text-blue-500" />;
                    }
                  } else if (activity.type === 'payout') {
                    switch (activity.status) {
                      case 'completed':
                        return <DollarSign className="w-4 h-4 text-green-500" />;
                      case 'processing':
                        return <Clock className="w-4 h-4 text-yellow-500" />;
                      case 'failed':
                        return <XCircle className="w-4 h-4 text-red-500" />;
                      default:
                        return <DollarSign className="w-4 h-4 text-blue-500" />;
                    }
                  }
                  return <Calendar className="w-4 h-4 text-gray-500" />;
                };

                const getActivityText = () => {
                  if (activity.type === 'submission') {
                    switch (activity.status) {
                      case 'approved':
                        return 'Submission Approved';
                      case 'pending':
                        return 'Submission Pending';
                      case 'rejected':
                        return 'Submission Rejected';
                      default:
                        return 'Submission Submitted';
                    }
                  } else if (activity.type === 'payout') {
                    switch (activity.status) {
                      case 'completed':
                        return 'Payment Received';
                      case 'processing':
                        return 'Payment Processing';
                      case 'failed':
                        return 'Payment Failed';
                      default:
                        return 'Payment Pending';
                    }
                  }
                  return 'Activity';
                };

                const getStatusVariant = () => {
                  if (activity.status === 'approved' || activity.status === 'completed') {
                    return 'default';
                  } else if (activity.status === 'pending' || activity.status === 'processing') {
                    return 'secondary';
                  } else if (activity.status === 'rejected' || activity.status === 'failed') {
                    return 'destructive';
                  }
                  return 'outline';
                };

                const getStatusBadgeStyle = () => {
                  if (activity.status === 'approved' || activity.status === 'completed') {
                    return 'bg-green-500 text-white hover:bg-green-600';
                  }
                  return '';
                };

                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getActivityIcon()}
                      <div>
                        <p className="font-medium">{activity.campaign_title || 'Campaign Submission'}</p>
                        <p className="text-sm text-muted-foreground">
                          {getActivityText()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={getStatusVariant()}
                        className={getStatusBadgeStyle()}
                      >
                        <div className="flex items-center gap-1">
                          {activity.status === 'approved' && <CheckCircle className="w-3 h-3 text-white" />}
                          {activity.status === 'rejected' && <XCircle className="w-3 h-3 text-white" />}
                          {activity.status === 'pending' && <Clock className="w-3 h-3 text-yellow-500" />}
                          {activity.status}
                        </div>
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * 5) + 1} to {Math.min(currentPage * 5, totalActivities)} of {totalActivities} activities
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!hasPrevPage}
                  >
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={!hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading content...</p>
              </div>
            ) : topPerformingContent.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Approved Content Yet</h3>
                <p className="text-muted-foreground mb-4">Your approved submissions will appear here once you complete campaigns.</p>
                <Link href="/creator/discover">
                  <Button variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Browse Campaigns
                  </Button>
                </Link>
              </div>
            ) : (
              topPerformingContent.map((content) => (
                <div key={content.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{content.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{content.platform}</Badge>
                      {/* View Post Button */}
                      {content.post_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(content.post_url, '_blank', 'noopener,noreferrer')}
                          className="h-6 px-2 text-xs"
                        >
                          View Post
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{content.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{content.engagement.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${content.earnings}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}