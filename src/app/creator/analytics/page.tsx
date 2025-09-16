"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Target,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface AnalyticsData {
  totalViews: number;
  totalEngagement: number;
  totalEarnings: number;
  avgEngagementRate: number;
  totalFollowers: number;
  contentCount: number;
}

interface PlatformData {
  views: number;
  followers: number;
  engagement: number;
  earnings: number;
  connected: boolean;
}

interface TopContent {
  id: string;
  title: string;
  platform: string;
  views: number;
  engagement: number;
  earnings: number;
  date: string;
}

export default function CreatorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    totalEngagement: 0,
    totalEarnings: 0,
    avgEngagementRate: 0,
    totalFollowers: 0,
    contentCount: 0
  });

  const [platformStats, setPlatformStats] = useState<{
    youtube: PlatformData;
    tiktok: PlatformData;
    instagram: PlatformData;
  }>({
    youtube: { views: 0, followers: 0, engagement: 0, earnings: 0, connected: false },
    tiktok: { views: 0, followers: 0, engagement: 0, earnings: 0, connected: false },
    instagram: { views: 0, followers: 0, engagement: 0, earnings: 0, connected: false }
  });

  const [topContent, setTopContent] = useState<TopContent[]>([]);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch analytics data from API
      const response = await fetch('/api/creator/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No analytics data yet - this is expected for new users
          setAnalyticsData({
            totalViews: 0,
            totalEngagement: 0,
            totalEarnings: 0,
            avgEngagementRate: 0,
            totalFollowers: 0,
            contentCount: 0
          });
          setTopContent([]);
          return;
        }
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalyticsData(data.overview || {
        totalViews: 0,
        totalEngagement: 0,
        totalEarnings: 0,
        avgEngagementRate: 0,
        totalFollowers: 0,
        contentCount: 0
      });
      setPlatformStats(data.platforms || {
        youtube: { views: 0, followers: 0, engagement: 0, earnings: 0, connected: false },
        tiktok: { views: 0, followers: 0, engagement: 0, earnings: 0, connected: false },
        instagram: { views: 0, followers: 0, engagement: 0, earnings: 0, connected: false }
      });
      setTopContent(data.topContent || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.totalViews === 0 ? 'No views yet' : 'Across all platforms'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.avgEngagementRate > 0 ? `${analyticsData.avgEngagementRate}% engagement rate` : 'No engagement yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.totalEarnings === 0 ? 'Start earning to see progress' : 'From all campaigns'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalFollowers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.totalFollowers === 0 ? 'Connect accounts to see followers' : 'Across all platforms'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Published</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.contentCount}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.contentCount === 0 ? 'No content yet' : 'This period'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgEngagementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.avgEngagementRate === 0 ? 'No engagement data yet' : 'Average across content'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Analytics */}
      <div className="space-y-4">
        <div className="flex space-x-1 border-b border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'youtube'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            YouTube
          </button>
          <button
            onClick={() => setActiveTab('tiktok')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tiktok'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            TikTok
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'instagram'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Instagram
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* YouTube Stats */}
            <Card className={!platformStats.youtube.connected ? 'opacity-50' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">YT</span>
                  </div>
                  YouTube
                  {!platformStats.youtube.connected && (
                    <Badge variant="outline" className="text-xs">Not Connected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="font-medium">{platformStats.youtube.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subscribers</span>
                  <span className="font-medium">{platformStats.youtube.followers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Engagement</span>
                  <span className="font-medium">{platformStats.youtube.engagement.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Earnings</span>
                  <span className="font-medium text-green-600">${platformStats.youtube.earnings.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* TikTok Stats */}
            <Card className={!platformStats.tiktok.connected ? 'opacity-50' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">TT</span>
                  </div>
                  TikTok
                  {!platformStats.tiktok.connected && (
                    <Badge variant="outline" className="text-xs">Not Connected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="font-medium">{platformStats.tiktok.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Followers</span>
                  <span className="font-medium">{platformStats.tiktok.followers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Engagement</span>
                  <span className="font-medium">{platformStats.tiktok.engagement.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Earnings</span>
                  <span className="font-medium text-green-600">${platformStats.tiktok.earnings.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Instagram Stats */}
            <Card className={!platformStats.instagram.connected ? 'opacity-50' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">IG</span>
                  </div>
                  Instagram
                  {!platformStats.instagram.connected && (
                    <Badge variant="outline" className="text-xs">Not Connected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="font-medium">{platformStats.instagram.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Followers</span>
                  <span className="font-medium">{platformStats.instagram.followers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Engagement</span>
                  <span className="font-medium">{platformStats.instagram.engagement.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Earnings</span>
                  <span className="font-medium text-green-600">${platformStats.instagram.earnings.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* YouTube Tab Content */}
        {activeTab === 'youtube' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>YouTube Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {!platformStats.youtube.connected ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-2xl font-bold">YT</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">YouTube Not Connected</h3>
                  <p className="text-muted-foreground mb-4">Connect your YouTube account to view detailed analytics</p>
                  <Button variant="outline" onClick={() => window.location.href = '/creator/settings'}>
                    Connect YouTube
                  </Button>
                </div>
              ) : platformStats.youtube.views === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No YouTube Data Yet</h3>
                  <p className="text-muted-foreground">Start creating content to see your YouTube analytics</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">YouTube analytics charts will be implemented here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* TikTok Tab Content */}
        {activeTab === 'tiktok' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>TikTok Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {!platformStats.tiktok.connected ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">TT</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">TikTok Not Connected</h3>
                  <p className="text-muted-foreground mb-4">Connect your TikTok account to view detailed analytics</p>
                  <Button variant="outline" onClick={() => window.location.href = '/creator/settings'}>
                    Connect TikTok
                  </Button>
                </div>
              ) : platformStats.tiktok.views === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No TikTok Data Yet</h3>
                  <p className="text-muted-foreground">Start creating content to see your TikTok analytics</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">TikTok analytics charts will be implemented here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Instagram Tab Content */}
        {activeTab === 'instagram' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instagram Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {!platformStats.instagram.connected ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">IG</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Instagram Not Connected</h3>
                  <p className="text-muted-foreground mb-4">Connect your Instagram account to view detailed analytics</p>
                  <Button variant="outline" onClick={() => window.location.href = '/creator/settings'}>
                    Connect Instagram
                  </Button>
                </div>
              ) : platformStats.instagram.views === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Instagram Data Yet</h3>
                  <p className="text-muted-foreground">Start creating content to see your Instagram analytics</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Instagram analytics charts will be implemented here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Content</CardTitle>
        </CardHeader>
        <CardContent>
          {topContent.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Content Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start participating in campaigns and creating content to see your top performers here.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/creator/discover'}>
                Browse Campaigns
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {topContent.map((content, index) => (
                <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{content.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline">{content.platform}</Badge>
                        <span>{new Date(content.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium">{content.views.toLocaleString()}</p>
                      <p className="text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{content.engagement.toLocaleString()}</p>
                      <p className="text-muted-foreground">Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600">${content.earnings.toFixed(2)}</p>
                      <p className="text-muted-foreground">Earnings</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
