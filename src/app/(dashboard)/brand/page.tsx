"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target, 
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart
} from "lucide-react";
import Link from "next/link";

export default function BrandDashboard() {
  const [brand, setBrand] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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

      // Load brand data
      const loadBrandData = async () => {
        try {
          // Get brand info
          const brandResponse = await fetch('/api/brands/my-brand', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          
          if (brandResponse.ok) {
            const brandData = await brandResponse.json();
            setBrand(brandData);
            
            // Load campaigns and submissions
            // TODO: Implement API endpoints for these
            setCampaigns([]);
            setSubmissions([]);
          }
        } catch (error) {
          console.error("Error loading brand data:", error);
        } finally {
          setLoading(false);
        }
      };

      loadBrandData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalSpent = campaigns.reduce((sum, c) => sum + (c.budget_spent || 0), 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.total_budget || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const pendingSubmissions = submissions.filter(s => s.status === "pending").length;
  const approvedSubmissions = submissions.filter(s => s.status === "approved").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Brand Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {brand?.name || "Brand"}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => router.push("/brand/campaigns/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
              <Button variant="outline" onClick={() => router.push("/auth")}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${totalBudget.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Across {campaigns.length} campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {((totalSpent / totalBudget) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{submissions.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingSubmissions} pending, {approvedSubmissions} approved
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Active Campaigns
              </CardTitle>
              <CardDescription>
                Manage your running campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No campaigns yet.</p>
                  <p className="text-sm">Create your first campaign to get started!</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => router.push("/brand/campaigns/new")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">
                          {campaign.title}
                        </h3>
                        <Badge 
                          variant={campaign.status === "active" ? "default" : "secondary"}
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(campaign.end_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${campaign.budget_spent || 0} / ${campaign.total_budget}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                        >
                          <BarChart className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/brand/campaigns/${campaign.id}/submissions`)}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Submissions
                        </Button>
                      </div>
                    </div>
                  ))}
                  {campaigns.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={() => router.push("/brand/campaigns")}>
                        View All Campaigns
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Recent Submissions
              </CardTitle>
              <CardDescription>
                Review creator submissions for your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No submissions yet.</p>
                  <p className="text-sm">Submissions will appear here once creators apply!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">
                          {submission.campaigns?.title || "Campaign"}
                        </h3>
                        <Badge 
                          variant={
                            submission.status === "approved" ? "default" :
                            submission.status === "pending" ? "secondary" :
                            "destructive"
                          }
                        >
                          {submission.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {submission.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                          {submission.status === "rejected" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {submission.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Creator: {submission.profiles?.display_name || "Unknown"}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {submission.views || 0} views
                        </span>
                        {submission.earnings && (
                          <span className="flex items-center gap-1 font-medium text-success">
                            <DollarSign className="w-3 h-3" />
                            ${submission.earnings.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Submitted {new Date(submission.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {submissions.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={() => router.push("/brand/submissions")}>
                        View All Submissions
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/brand/campaigns/new")}
              >
                <Plus className="w-6 h-6 text-primary" />
                <span>Create Campaign</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/brand/campaigns")}
              >
                <Target className="w-6 h-6 text-success" />
                <span>Manage Campaigns</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/brand/submissions")}
              >
                <TrendingUp className="w-6 h-6 text-primary" />
                <span>Review Submissions</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/brand/analytics")}
              >
                <BarChart className="w-6 h-6 text-warning" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
