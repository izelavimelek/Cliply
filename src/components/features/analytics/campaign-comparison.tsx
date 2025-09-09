"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Eye, Heart, DollarSign, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Campaign {
  _id: string;
  title: string;
  status: string;
  platforms?: string[];
  analytics?: {
    views?: number;
    engagement_rate?: number;
    ctr?: number;
    cpm?: number;
    cpc?: number;
    cpa?: number;
    roi?: number;
  };
  total_budget?: number;
  budget_spent?: number;
  submissions_count?: number;
  start_date?: string;
  end_date?: string;
}

interface CampaignComparisonProps {
  campaigns: Campaign[];
  selectedCampaigns: string[];
  onCampaignToggle: (campaignId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function CampaignComparison({
  campaigns,
  selectedCampaigns,
  onCampaignToggle,
  onSelectAll,
  onClearAll
}: CampaignComparisonProps) {
  const selectedCampaignsData = campaigns.filter(c => selectedCampaigns.includes(c._id));
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending_budget': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTotalMetric = (metric: keyof NonNullable<Campaign['analytics']>) => {
    return selectedCampaignsData.reduce((acc, campaign) => {
      return acc + (campaign.analytics?.[metric] || 0);
    }, 0);
  };

  const getAverageMetric = (metric: keyof NonNullable<Campaign['analytics']>) => {
    if (selectedCampaignsData.length === 0) return 0;
    return getTotalMetric(metric) / selectedCampaignsData.length;
  };

  return (
    <div className="space-y-6">
      {/* Campaign Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Comparison</CardTitle>
          <CardDescription>
            Select campaigns to compare their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedCampaigns.length} of {campaigns.length} campaigns selected
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className={cn(
                  "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
                  selectedCampaigns.includes(campaign._id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => onCampaignToggle(campaign._id)}
              >
                <Checkbox
                  checked={selectedCampaigns.includes(campaign._id)}
                  onChange={() => onCampaignToggle(campaign._id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{campaign.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn("text-xs", getStatusColor(campaign.status))}>
                      {campaign.status === 'pending_budget' ? 'Pending Budget' : 
                       campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {campaign.platforms?.join(', ') || 'Multiple platforms'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedCampaignsData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Combined Metrics</CardTitle>
              <CardDescription>Total performance across selected campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Eye className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold">{getTotalMetric('views').toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Heart className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold">{getAverageMetric('engagement_rate').toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Avg Engagement</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <DollarSign className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold">${getTotalMetric('cpm').toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total CPM</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold">{selectedCampaignsData.reduce((acc, c) => acc + (c.submissions_count || 0), 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance</CardTitle>
              <CardDescription>Performance breakdown by campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedCampaignsData.map((campaign) => (
                  <div key={campaign._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{campaign.title}</h4>
                      <Badge className={cn("text-xs", getStatusColor(campaign.status))}>
                        {campaign.status === 'pending_budget' ? 'Pending Budget' : 
                         campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Views:</span>
                        <span className="font-medium">{(campaign.analytics?.views || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Engagement:</span>
                        <span className="font-medium">{(campaign.analytics?.engagement_rate || 0).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Spent:</span>
                        <span className="font-medium">${(campaign.budget_spent || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submissions:</span>
                        <span className="font-medium">{campaign.submissions_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
