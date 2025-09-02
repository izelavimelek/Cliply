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

  // Fetch creator activities and stats
  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch activities
        const activitiesResponse = await fetch('/api/creator/activities', {
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

        // Calculate stats from activities
        const activities = activitiesData.activities || [];
        const totalEarnings = activities
          .filter(a => a.type === 'payout' && a.status === 'completed')
          .reduce((sum, a) => sum + a.amount, 0);
        
        const activeSubmissions = activities
          .filter(a => a.type === 'submission' && a.status === 'pending').length;
        
        const completedCampaigns = activities
          .filter(a => a.type === 'submission' && a.status === 'approved').length;
        
        const totalViews = activities
          .filter(a => a.type === 'submission' && a.views)
          .reduce((sum, a) => sum + (a.views || 0), 0);
        
        const pendingPayouts = activities
          .filter(a => a.type === 'payout' && a.status === 'pending')
          .reduce((sum, a) => sum + a.amount, 0);

        setStats({
          totalEarnings,
          activeSubmissions,
          completedCampaigns,
          totalViews,
          totalEngagement: 0, // TODO: Calculate from snapshots
          pendingPayouts
        });

      } catch (err) {
        console.error('Error fetching creator data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [user]);

  const [topPerformingContent, setTopPerformingContent] = useState([
    {
      id: 1,
      title: "Summer Fashion Haul",
      platform: "TikTok",
      views: 125000,
      engagement: 8500,
      earnings: 150
    },
    {
      id: 2,
      title: "Tech Review Video",
      platform: "YouTube",
      views: 45000,
      engagement: 3200,
      earnings: 200
    },
    {
      id: 3,
      title: "Lifestyle Post",
      platform: "Instagram",
      views: 28000,
      engagement: 2100,
      earnings: 120
    }
  ]);

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Submissions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Campaigns</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Likes, comments, shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingPayouts}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
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
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground">Your submissions and payments will appear here</p>
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

                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getActivityIcon()}
                      <div>
                        <p className="font-medium">{activity.campaign_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {getActivityText()}
                        </p>
                        {activity.views && (
                          <p className="text-xs text-muted-foreground">
                            {activity.views.toLocaleString()} views
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.amount > 0 && (
                        <p className="font-bold">${activity.amount}</p>
                      )}
                      <Badge variant={getStatusVariant()}>
                        {activity.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
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
            {topPerformingContent.map((content) => (
              <div key={content.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{content.title}</h4>
                  <Badge variant="outline">{content.platform}</Badge>
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
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}