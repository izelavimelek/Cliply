"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Campaign {
  _id: string;
  title: string;
  status: string;
  created_at: string;
  brand_id: string;
}

export default function DebugCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/debug/campaigns');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      setUpdating(campaignId);
      const response = await fetch('/api/debug/campaigns', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId, status: newStatus }),
      });

      if (response.ok) {
        // Refresh campaigns list
        await fetchCampaigns();
        alert('Campaign status updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
      alert('Failed to update campaign status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return <div className="p-6">Loading campaigns...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Campaigns</h1>
      
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{campaign.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    ID: {campaign._id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(campaign.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCampaignStatus(campaign._id, 'draft')}
                      disabled={updating === campaign._id || campaign.status === 'draft'}
                    >
                      {updating === campaign._id ? 'Updating...' : 'Set to Draft'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCampaignStatus(campaign._id, 'active')}
                      disabled={updating === campaign._id || campaign.status === 'active'}
                    >
                      {updating === campaign._id ? 'Updating...' : 'Set to Active'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      {campaigns.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No campaigns found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
