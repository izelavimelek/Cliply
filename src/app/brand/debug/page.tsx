"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchDebugInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await fetch('/api/debug/user-info', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch debug info');
      }

      const data = await res.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error fetching debug info:', error);
      alert(error instanceof Error ? error.message : 'Error fetching debug info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDebugInfo();
    }
  }, [user]);

  if (!user) {
    return <div>Please sign in to view debug information.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debug Information</h1>
        <p className="text-muted-foreground">
          This page shows your user information and brand relationship
        </p>
      </div>

      <Button onClick={fetchDebugInfo} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh Debug Info"}
      </Button>

      {debugInfo && (
        <div className="grid gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>User ID:</strong> {debugInfo.user.id}</div>
                <div><strong>Email:</strong> {debugInfo.user.email}</div>
                <div><strong>Role:</strong> <Badge>{debugInfo.user.role}</Badge></div>
                {debugInfo.user.profile && (
                  <div><strong>Display Name:</strong> {debugInfo.user.profile.display_name}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Brand Information */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.brand ? (
                <div className="space-y-2">
                  <div><strong>Brand ID:</strong> {debugInfo.brand.id}</div>
                  <div><strong>Name:</strong> {debugInfo.brand.name}</div>
                  <div><strong>Description:</strong> {debugInfo.brand.description}</div>
                  <div><strong>Industry:</strong> {debugInfo.brand.industry}</div>
                  <div><strong>Website:</strong> {debugInfo.brand.website}</div>
                </div>
              ) : (
                <div className="text-red-600">
                  <strong>No brand found for this user!</strong>
                  <br />
                  You need to create a brand profile.
                </div>
              )}
            </CardContent>
          </Card>

          {/* User's Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Your Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.userCampaigns.length > 0 ? (
                <div className="space-y-2">
                  {debugInfo.userCampaigns.map((campaign: any) => (
                    <div key={campaign.id} className="p-3 border rounded">
                      <div><strong>ID:</strong> {campaign.id}</div>
                      <div><strong>Title:</strong> {campaign.title}</div>
                      <div><strong>Brand ID:</strong> {campaign.brand_id}</div>
                      <div><strong>Status:</strong> <Badge>{campaign.status}</Badge></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No campaigns found for your brand.</div>
              )}
            </CardContent>
          </Card>

          {/* All Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns in Database</CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.allCampaigns.length > 0 ? (
                <div className="space-y-2">
                  {debugInfo.allCampaigns.map((campaign: any) => (
                    <div key={campaign.id} className="p-3 border rounded">
                      <div><strong>ID:</strong> {campaign.id}</div>
                      <div><strong>Title:</strong> {campaign.title}</div>
                      <div><strong>Brand ID:</strong> {campaign.brand_id}</div>
                      <div><strong>Status:</strong> <Badge>{campaign.status}</Badge></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No campaigns found in database.</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
