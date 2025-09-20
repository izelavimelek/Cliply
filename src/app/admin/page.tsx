"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  BarChart,
  Activity,
  Settings
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadAdminStats = useCallback(async () => {
    try {
      // TODO: Implement MongoDB API endpoints for admin stats
      // const response = await fetch('/api/admin/stats');
      // const data = await response.json();
      
      // Mock data for now - replace with real API calls
      setStats({
        totalUsers: 1247,
        totalBrands: 89,
        totalCampaigns: 156,
        totalSubmissions: 2341,
        pendingSubmissions: 23,
        totalPayouts: 45230.50,
        userGrowth: 12.5,
        campaignSuccessRate: 87.3,
        platformRevenue: 2847.20
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading admin stats:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminStats();
  }, [loadAdminStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your platform's performance and key metrics
        </p>
      </div>

      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered creators and brands
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
              <Target className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.totalBrands}</div>
              <p className="text-xs text-muted-foreground">
                Active brand accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                Created campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Activity className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                Creator submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pendingSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                Submissions awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">${stats.totalPayouts.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total creator earnings
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                System Health
              </CardTitle>
              <CardDescription>
                Current system status and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="font-medium">Database</span>
                  <Badge variant="default" className="bg-green-600">
                    <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="font-medium">Authentication</span>
                  <Badge variant="default" className="bg-green-600">
                    <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="font-medium">Storage</span>
                  <Badge variant="default" className="bg-green-600">
                    <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="font-medium">API</span>
                  <Badge variant="default" className="bg-green-600">
                    <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                    Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest system events and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registration</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Campaign created</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Submission approved</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payout processed</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Administrative Actions</CardTitle>
            <CardDescription>
              Manage system settings and user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/admin/users")}
              >
                <Users className="w-6 h-6 text-primary" />
                <span>User Management</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/admin/campaigns")}
              >
                <Target className="w-6 h-6 text-success" />
                <span>Campaign Oversight</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/admin/payouts")}
              >
                <DollarSign className="w-6 h-6 text-primary" />
                <span>Payout Management</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
                onClick={() => router.push("/admin/settings")}
              >
                <Settings className="w-6 h-6 text-warning" />
                <span>System Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">+12%</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Campaign Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">87%</div>
              <p className="text-xs text-muted-foreground">
                Average completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">$2,847</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}