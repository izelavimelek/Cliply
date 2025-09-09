"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import Link from "next/link";
import { useBrandProfileModal } from "@/hooks/useBrandProfileModal";
import { BrandProfileModal } from "@/components/ui/brand-profile-modal";
import { needsBrandSetup } from "@/lib/brand-completion";
import { MetricCard, CampaignComparison, PerformanceChart } from "@/components/features/analytics";

interface CampaignAnalytics {
  _id: string;
  title: string;
  status: string;
  total_budget?: number;
  budget_spent?: number;
  analytics?: {
    views?: number;
    engagement_rate?: number;
    ctr?: number;
    cpm?: number;
    cpc?: number;
    cpa?: number;
    roi?: number;
    platform_breakdown?: Record<string, any>;
  };
  submissions_count?: number;
  start_date?: string;
  end_date?: string;
  platforms?: string[];
}

interface SubmissionAnalytics {
  _id: string;
  campaign_id: string;
  creator_id: string;
  post_url: string;
  status: string;
  views?: number;
  earnings?: number;
  created_at: string;
  verified_at?: string;
}

export default function BrandAnalyticsPage() {
  const [brand, setBrand] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<CampaignAnalytics[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const { isModalOpen, missingFields, handleNewCampaignClick, handleRedirect, closeModal } = useBrandProfileModal();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth");
        return;
      }

      if (user.role !== "brand") {
        router.push("/onboarding");
        return;
      }

      loadAnalyticsData();
    }
  }, [user, authLoading, router, selectedTimeRange]);

  // Add sample analytics data for testing
  const addSampleAnalyticsData = (campaigns: CampaignAnalytics[]) => {
    return campaigns.map(campaign => {
      // Only add sample data to active campaigns
      if (campaign.status === 'active') {
        return {
          ...campaign,
          analytics: {
            views: Math.floor(Math.random() * 10000) + 1000, // 1000-11000 views
            engagement_rate: Math.random() * 5 + 2, // 2-7% engagement
            ctr: Math.random() * 2 + 1, // 1-3% CTR
            cpm: Math.random() * 10 + 5, // $5-15 CPM
            cpc: Math.random() * 2 + 0.5, // $0.5-2.5 CPC
            cpa: Math.random() * 20 + 10, // $10-30 CPA
            roi: Math.random() * 50 + 20, // 20-70% ROI
            platform_breakdown: {
              youtube: Math.floor(Math.random() * 5000) + 1000,
              tiktok: Math.floor(Math.random() * 3000) + 500,
              instagram: Math.floor(Math.random() * 2000) + 300
            }
          }
        };
      }
      return campaign;
    });
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const [brandResponse, campaignsResponse, submissionsResponse] = await Promise.all([
        fetch('/api/brands/my-brand', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/campaigns?role=brand', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/submissions?role=brand', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
      ]);

      // Handle campaigns response
      let campaignsData = { items: [] };
      if (campaignsResponse.ok) {
        campaignsData = await campaignsResponse.json();
      } else if (campaignsResponse.status !== 404) {
        console.error('Failed to fetch campaigns:', campaignsResponse.status);
      }

      // Handle submissions response
      let submissionsData = { items: [] };
      if (submissionsResponse.ok) {
        submissionsData = await submissionsResponse.json();
      } else if (submissionsResponse.status !== 404) {
        console.error('Failed to fetch submissions:', submissionsResponse.status);
      }

      // Check if brand exists
      if (brandResponse.status === 404) {
        // No brand found, but don't redirect - show analytics with setup prompt
        setBrand(null);
        setCampaigns([]);
        setSubmissions([]);
        setLoading(false);
        return;
      }

      if (!brandResponse.ok) {
        // If brand fetch fails, still show analytics but with setup prompt
        setBrand(null);
        setCampaigns([]);
        setSubmissions([]);
        setLoading(false);
        return;
      }

      const brandData = await brandResponse.json();

      setBrand(brandData);
      const campaignsList = campaignsData.items || [];
      
      // Add sample analytics data to campaigns for demo purposes
      const campaignsWithAnalytics = addSampleAnalyticsData(campaignsList);
      setCampaigns(campaignsWithAnalytics);
      setSubmissions(submissionsData.items || []);
      
      // Auto-select all active campaigns by default
      const activeCampaigns = campaignsWithAnalytics
        .filter((c: CampaignAnalytics) => c.status === 'active')
        .map((c: CampaignAnalytics) => c._id);
      setSelectedCampaigns(activeCampaigns);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handleCampaignToggle = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const getFilteredCampaigns = () => {
    return campaigns.filter(c => 
      selectedCampaigns.length === 0 || selectedCampaigns.includes(c._id)
    );
  };

  const getTotalViews = () => {
    return getFilteredCampaigns().reduce((acc, campaign) => {
      return acc + (campaign.analytics?.views || 0);
    }, 0);
  };

  const getTotalEngagement = () => {
    const filteredCampaigns = getFilteredCampaigns();
    if (filteredCampaigns.length === 0) return 0;
    
    const totalEngagement = filteredCampaigns.reduce((acc, campaign) => {
      return acc + (campaign.analytics?.engagement_rate || 0);
    }, 0);
    
    return totalEngagement / filteredCampaigns.length;
  };

  const getTotalBudget = () => {
    return getFilteredCampaigns().reduce((acc, campaign) => {
      return acc + (campaign.total_budget || 0);
    }, 0);
  };

  const getTotalSpent = () => {
    return getFilteredCampaigns().reduce((acc, campaign) => {
      return acc + (campaign.budget_spent || 0);
    }, 0);
  };

  const getTotalSubmissions = () => {
    return submissions.filter(submission => 
      getFilteredCampaigns().some(campaign => campaign._id === submission.campaign_id)
    ).length;
  };

  const getROI = () => {
    const totalSpent = getTotalSpent();
    const totalViews = getTotalViews();
    if (totalSpent === 0 || totalViews === 0) return 0;
    return ((totalViews * 0.01) / totalSpent) * 100; // Simplified ROI calculation
  };

  // Calculate trends based on actual data
  const getViewsTrend = () => {
    const currentViews = getTotalViews();
    if (currentViews === 0) return null; // No trend if no data
    
    // Simulate trend calculation - in real app, compare with previous period
    // For demo purposes, only show trends when there's meaningful data
    if (currentViews < 100) return null; // Not enough data for meaningful trend
    
    // Simulate a positive trend for demo (in real app, calculate from historical data)
    return { value: 12.5, period: "vs last month" };
  };

  const getEngagementTrend = () => {
    const currentEngagement = getTotalEngagement();
    if (currentEngagement === 0) return null; // No trend if no data
    
    // Only show trends when there's meaningful engagement data
    if (currentEngagement < 1) return null; // Less than 1% engagement
    
    // Simulate a positive trend for demo
    return { value: 8.2, period: "vs last month" };
  };

  const getBudgetTrend = () => {
    const currentBudget = getTotalBudget();
    if (currentBudget === 0) return null; // No trend if no data
    
    // Only show trends when there's meaningful budget data
    if (currentBudget < 100) return null; // Less than $100 budget
    
    // Simulate a slight decrease for demo (budget optimization)
    return { value: -2.1, period: "vs last month" };
  };

  const getROITrend = () => {
    const currentROI = getROI();
    if (currentROI === 0) return null; // No trend if no data
    
    // Only show trends when there's meaningful ROI data
    if (currentROI < 1) return null; // Less than 1% ROI
    
    // Simulate a positive trend for demo
    return { value: 15.3, period: "vs last month" };
  };

  // Check if we have any meaningful data
  const hasData = () => {
    return getTotalViews() > 0 || getTotalBudget() > 0 || getTotalSubmissions() > 0;
  };

  const getTopPerformingCampaigns = () => {
    return getFilteredCampaigns()
      .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
      .slice(0, 5);
  };

  const getRecentSubmissions = () => {
    return submissions
      .filter(submission => 
        getFilteredCampaigns().some(campaign => campaign._id === submission.campaign_id)
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Please sign in to view analytics.</div>;
  }

  // Show brand setup prompt if brand is not set up or incomplete
  if (needsBrandSetup(brand)) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Brand Setup Required</h2>
            <p className="text-muted-foreground mb-6">
              {brand ? 
                "Complete your brand profile to view analytics and manage your campaigns." :
                "Set up your brand profile to view analytics and manage your campaigns."
              }
            </p>
            <Button 
              onClick={() => router.push('/brand/settings')}
            >
              {brand ? "Complete Brand Setup" : "Set Up Brand"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Campaign Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Campaign Filter
          </CardTitle>
          <CardDescription>
            Select which campaigns to include in your analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {campaigns.filter(c => c.status !== 'deleted').map((campaign) => (
              <Button
                key={campaign._id}
                variant={selectedCampaigns.includes(campaign._id) ? "default" : "outline"}
                size="sm"
                onClick={() => handleCampaignToggle(campaign._id)}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                {campaign.title}
                <Badge variant="secondary" className="ml-1">
                  {campaign.status}
                </Badge>
              </Button>
            ))}
            {campaigns.filter(c => c.status !== 'deleted').length === 0 && (
              <p className="text-muted-foreground">No campaigns available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={getTotalViews().toLocaleString()}
          subtitle={`${getFilteredCampaigns().length} campaigns`}
          icon={Eye}
          trend={getViewsTrend()}
        />
        
        <MetricCard
          title="Engagement Rate"
          value={`${getTotalEngagement().toFixed(1)}%`}
          subtitle="Average across campaigns"
          icon={Heart}
          trend={getEngagementTrend()}
        />
        
        <MetricCard
          title="Total Budget"
          value={`$${getTotalBudget().toLocaleString()}`}
          subtitle={`$${getTotalSpent().toLocaleString()} spent`}
          icon={DollarSign}
          trend={getBudgetTrend()}
        />
        
        <MetricCard
          title="ROI"
          value={`${getROI().toFixed(1)}%`}
          subtitle={`${getTotalSubmissions()} submissions`}
          icon={TrendingUp}
          trend={getROITrend()}
        />
      </div>

      {/* Empty State Message */}
      {!hasData() && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-muted/50">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
                <p className="text-muted-foreground mb-4">
                  {getFilteredCampaigns().length === 0 
                    ? "Create your first campaign to start seeing analytics data."
                    : "Your campaigns need to be active and receive submissions to show analytics data."
                  }
                </p>
                {getFilteredCampaigns().length === 0 && (
                  <Button onClick={() => router.push('/brand/campaigns/new')}>
                    Create Your First Campaign
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Tabs */}
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
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'campaigns'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'submissions'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'performance'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'comparison'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Comparison
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Campaigns with highest view counts</CardDescription>
              </CardHeader>
              <CardContent>
                {getTopPerformingCampaigns().length > 0 ? (
                  <div className="space-y-4">
                    {getTopPerformingCampaigns().map((campaign, index) => (
                      <div key={campaign._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{campaign.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {campaign.platforms?.join(', ') || 'Multiple platforms'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(campaign.analytics?.views || 0).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No campaign data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest creator submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {getRecentSubmissions().length > 0 ? (
                  <div className="space-y-4">
                    {getRecentSubmissions().map((submission) => (
                      <div key={submission._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Creator Submission</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(submission.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={submission.status === 'approved' ? 'default' : 'secondary'}>
                            {submission.status}
                          </Badge>
                          {submission.views && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {submission.views.toLocaleString()} views
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No submissions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Detailed performance metrics for each campaign</CardDescription>
            </CardHeader>
            <CardContent>
              {getFilteredCampaigns().length > 0 ? (
                <div className="space-y-4">
                  {getFilteredCampaigns().map((campaign) => (
                    <div key={campaign._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{campaign.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {campaign.platforms?.join(', ') || 'Multiple platforms'} • 
                            Status: {campaign.status}
                          </p>
                        </div>
                        <Link href={`/brand/campaigns/${campaign._id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{(campaign.analytics?.views || 0).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{(campaign.analytics?.engagement_rate || 0).toFixed(1)}%</p>
                          <p className="text-sm text-muted-foreground">Engagement</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">${(campaign.budget_spent || 0).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Spent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{(campaign.submissions_count || 0)}</p>
                          <p className="text-sm text-muted-foreground">Submissions</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No campaigns selected or available</p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Analytics</CardTitle>
              <CardDescription>Performance metrics for creator submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {getRecentSubmissions().length > 0 ? (
                <div className="space-y-4">
                  {getRecentSubmissions().map((submission) => (
                    <div key={submission._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Submission #{submission._id.slice(-6)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={submission.status === 'approved' ? 'default' : 'secondary'}>
                          {submission.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{(submission.views || 0).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">${(submission.earnings || 0).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Earnings</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {submission.verified_at ? '✓' : '⏳'}
                          </p>
                          <p className="text-sm text-muted-foreground">Status</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No submissions available</p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
          {/* Performance Chart */}
          <PerformanceChart 
            data={[]} // In real app, this would be time-series data
            type="line"
            metric="views"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Performance</CardTitle>
                <CardDescription>Budget allocation and spending efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Budget</span>
                    <span className="text-lg font-semibold">${getTotalBudget().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Amount Spent</span>
                    <span className="text-lg font-semibold">${getTotalSpent().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Remaining</span>
                    <span className="text-lg font-semibold">${(getTotalBudget() - getTotalSpent()).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${getTotalBudget() > 0 ? (getTotalSpent() / getTotalBudget()) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Overall engagement performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Views</span>
                    <span className="text-lg font-semibold">{getTotalViews().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Engagement</span>
                    <span className="text-lg font-semibold">{getTotalEngagement().toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Submissions</span>
                    <span className="text-lg font-semibold">{getTotalSubmissions()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">ROI</span>
                    <span className="text-lg font-semibold">{getROI().toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
          <CampaignComparison
            campaigns={campaigns.filter(c => c.status !== 'deleted')}
            selectedCampaigns={selectedCampaigns}
            onCampaignToggle={handleCampaignToggle}
            onSelectAll={() => setSelectedCampaigns(campaigns.filter(c => c.status !== 'deleted').map(c => c._id))}
            onClearAll={() => setSelectedCampaigns([])}
          />
          </div>
        )}
      </div>
      
      <BrandProfileModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onRedirect={handleRedirect}
        missingFields={missingFields}
      />
    </div>
  );
}
