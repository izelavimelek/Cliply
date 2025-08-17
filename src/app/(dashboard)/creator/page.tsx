"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target, 
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function CreatorDashboard() {
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

      if (user.role !== "creator") {
        router.push("/onboarding");
        return;
      }

      // Load creator data
      const loadCreatorData = async () => {
        try {
          // TODO: Implement API endpoints for campaigns and submissions
          // For now, using placeholder data
          setCampaigns([]);
          setSubmissions([]);
        } catch (error) {
          console.error("Error loading creator data:", error);
        } finally {
          setLoading(false);
        }
      };

      loadCreatorData();
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

  const totalEarnings = submissions
    .filter(s => s.status === "approved")
    .reduce((sum, s) => sum + (s.earnings || 0), 0);

  const pendingEarnings = submissions
    .filter(s => s.status === "pending")
    .reduce((sum, s) => sum + (s.earnings || 0), 0);

  const activeSubmissions = submissions.filter(s => s.status === "pending").length;
  const completedSubmissions = submissions.filter(s => s.status === "approved").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Creator Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.display_name || "Creator"}!
              </p>
            </div>
            <div className="flex items-center gap-3">
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
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">${totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {completedSubmissions} approved submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">${pendingEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {activeSubmissions} pending submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground">
                Available to apply for
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{submissions.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all campaigns
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Available Campaigns
              </CardTitle>
              <CardDescription>
                Discover brand campaigns you can apply for
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No active campaigns available at the moment.</p>
                  <p className="text-sm">Check back later for new opportunities!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">
                          {campaign.title}
                        </h3>
                        <Badge variant="secondary">
                          ${campaign.rate_per_thousand}/1K views
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(campaign.end_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Budget: ${campaign.total_budget}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => router.push(`/creator/submit/${campaign.id}`)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>
                    </div>
                  ))}
                  {campaigns.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={() => router.push("/creator/campaigns")}>
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
                Track your campaign submissions and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No submissions yet.</p>
                  <p className="text-sm">Apply to campaigns to get started!</p>
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
                      <Button variant="outline" onClick={() => router.push("/creator/submissions")}>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/creator/campaigns")}
              >
                <Target className="w-6 h-6 text-primary" />
                <span>Browse Campaigns</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/creator/submissions")}
              >
                <TrendingUp className="w-6 h-6 text-success" />
                <span>View Submissions</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/creator/profile")}
              >
                <Users className="w-6 h-6 text-primary" />
                <span>Edit Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
