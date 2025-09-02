"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, TrendingUp, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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

          // Check if brand exists
          if (brandResponse.status === 404) {
            // No brand found, redirect to setup
            router.push('/brand/setup-brand');
            return;
          }

          if (!brandResponse.ok) {
            throw new Error('Failed to load brand data');
          }

          const [brandData, campaignsData, submissionsData] = await Promise.all([
            brandResponse.json(),
            campaignsResponse.json(),
            submissionsResponse.json(),
          ]);

          setBrand(brandData);
          setCampaigns(campaignsData.items || []);
          setSubmissions(submissionsData.items || []);
        } catch (error) {
          console.error('Error loading brand data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadBrandData();
    }
  }, [user, authLoading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Quick Actions */}
      <Card className="p-6 bg-neutral-800 dark:bg-white border-neutral-800 dark:border-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-white dark:text-gray-900">Quick Actions</h2>
            <p className="text-gray-300 dark:text-gray-600">Get started with your next campaign</p>
          </div>
          <div className="flex gap-3">
            <Link href="/brand/campaigns/new">
              <Button className="flex items-center gap-2 bg-white hover:bg-gray-300 text-gray-900 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white">
                <Plus className="h-4 w-4 !text-gray-900 dark:!text-white" />
                Add Campaign
              </Button>
            </Link>
            <Link href="/brand/campaigns">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border border-gray-400 text-white hover:bg-white hover:text-black dark:border-gray-600 dark:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-white h-9 px-4 py-2">
                View All Campaigns
              </button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</h3>
              <p className="mt-2 text-3xl font-semibold">${campaigns.filter(c => c.status !== 'deleted').reduce((acc, c) => acc + (c.total_budget || 0), 0).toLocaleString()}</p>
              <p className="mt-1 text-sm text-gray-500">Across {campaigns.filter(c => c.status !== 'deleted').length} campaigns</p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget Spent</h3>
              <p className="mt-2 text-3xl font-semibold">${campaigns.filter(c => c.status !== 'deleted').reduce((acc, c) => acc + (c.budget_spent || 0), 0).toLocaleString()}</p>
              <p className="mt-1 text-sm text-gray-500">
                {campaigns.filter(c => c.status !== 'deleted').reduce((acc, c) => acc + (c.total_budget || 0), 0) > 0 
                  ? Math.round(campaigns.filter(c => c.status !== 'deleted').reduce((acc, c) => acc + (c.budget_spent || 0), 0) / campaigns.filter(c => c.status !== 'deleted').reduce((acc, c) => acc + (c.total_budget || 0), 0) * 100)
                  : 0}% of total
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Campaigns</h3>
              <p className="mt-2 text-3xl font-semibold">{campaigns.filter(c => c.status === 'active' && c.status !== 'deleted').length}</p>
              <p className="mt-1 text-sm text-gray-500">Currently running</p>
            </div>
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Submissions</h3>
              <p className="mt-2 text-3xl font-semibold">{submissions.length}</p>
              <p className="mt-1 text-sm text-gray-500">{submissions.filter(s => s.status === 'pending').length} pending</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Campaigns</h3>
            <Link href="/brand/campaigns">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          {campaigns.filter(c => c.status !== 'deleted').length > 0 ? (
            <div className="space-y-3">
              {campaigns.filter(c => c.status !== 'deleted').slice(0, 3).map((campaign) => (
                <div key={campaign._id || campaign.id || Math.random()} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{campaign.title || 'Untitled Campaign'}</p>
                      <p className="text-sm text-muted-foreground">
                        ${campaign.total_budget?.toLocaleString() || '0'} budget
                      </p>
                    </div>
                  </div>
                  <Link href={`/brand/campaigns/${campaign._id || campaign.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              ))}
              {campaigns.filter(c => c.status !== 'deleted').length > 3 && (
                <div className="text-center pt-2">
                  <Link href="/brand/campaigns">
                    <Button variant="ghost" size="sm">
                      +{campaigns.filter(c => c.status !== 'deleted').length - 3} more campaigns
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No campaigns yet.</p>
              <p className="text-sm text-gray-400 mb-4">Create your first campaign to get started!</p>
              <Link href="/brand/campaigns/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Submissions</h3>
            <Link href="/brand/submissions">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.slice(0, 3).map((submission) => (
                <div key={submission._id || submission.id || Math.random()} className="flex items-center justify-between p-3 border rounded-lg">
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
                  <Badge variant={submission.status === 'pending' ? 'secondary' : 'default'}>
                    {submission.status}
                  </Badge>
                </div>
              ))}
              {submissions.length > 3 && (
                <div className="text-center pt-2">
                  <Link href="/brand/submissions">
                    <Button variant="ghost" size="sm">
                      +{submissions.length - 3} more submissions
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No submissions yet.</p>
              <p className="text-sm text-gray-400">Submissions will appear here once creators apply!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
