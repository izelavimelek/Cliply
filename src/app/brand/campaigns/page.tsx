"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Target } from "lucide-react";
import Link from "next/link";
import { BrandCampaignCard } from "@/components/features/dashboard/brand-campaign-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function BrandCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchCampaigns();
    }
  }, [authLoading, user]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const res = await fetch('/api/campaigns?role=brand', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch campaigns');
      }

      const data = await res.json();
      console.log("Campaigns data received:", data);
      const campaignsData = data.items || [];
      setCampaigns(campaignsData);
      // Filter out deleted campaigns from initial load
      setFilteredCampaigns(campaignsData.filter((campaign: any) => campaign.status !== 'deleted'));
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError(error instanceof Error ? error.message : 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === "all") {
      // Filter out deleted campaigns from "all" view
      setFilteredCampaigns(campaigns.filter(campaign => campaign.status !== 'deleted'));
    } else {
      const filtered = campaigns.filter(campaign => campaign.status === filter);
      setFilteredCampaigns(filtered);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('No authentication token found');
        return;
      }

      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete campaign');
      }

      // Update campaign status to 'deleted' in local state (soft delete)
      setCampaigns(prev => prev.map(c => 
        c._id === campaignId ? { ...c, status: 'deleted' } : c
      ));
      setFilteredCampaigns(prev => prev.map(c => 
        c._id === campaignId ? { ...c, status: 'deleted' } : c
      ));
      
      // Dispatch custom event to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('campaign-updated', { 
        detail: { campaignId, status: 'deleted' } 
      }));
      
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
      alert('Campaign archived successfully');
    } catch (error) {
      console.error('Error archiving campaign:', error);
      alert(error instanceof Error ? error.message : 'Failed to archive campaign');
    }
  };

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    try {
      setUpdatingStatus(campaignId);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('No authentication token found');
        return;
      }

      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update campaign status');
      }

      // Update campaign in local state
      setCampaigns(prev => prev.map(c => 
        c._id === campaignId ? { ...c, status: newStatus } : c
      ));
      setFilteredCampaigns(prev => prev.map(c => 
        c._id === campaignId ? { ...c, status: newStatus } : c
      ));
      
      // Dispatch custom event to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('campaign-updated', { 
        detail: { campaignId, status: newStatus } 
      }));
      
      alert('Campaign status updated successfully');
    } catch (error) {
      console.error('Error updating campaign status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update campaign status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openDeleteDialog = (campaignId: string) => {
    setCampaignToDelete(campaignId);
    setDeleteDialogOpen(true);
  };

  const getFilterSpecificTitle = () => {
    switch (activeFilter) {
      case "active":
        return "No active campaigns";
      case "pending_budget":
        return "No campaigns waiting for budget";
      case "paused":
        return "No paused campaigns";
      case "completed":
        return "No completed campaigns";
      default:
        return "No campaigns match this filter";
    }
  };

  const getFilterSpecificMessage = () => {
    switch (activeFilter) {
      case "active":
        return "All your campaigns are either paused, waiting for budget, or completed. Create a new campaign or activate an existing one to get started.";
      case "pending_budget":
        return "All your campaigns have been funded and are ready to go! If you need to add more budget to a campaign, you can do so from the campaign details.";
      case "paused":
        return "No campaigns are currently paused. All campaigns are either active, waiting for budget, or completed.";
      case "completed":
        return "No campaigns have been completed yet. Keep working on your active campaigns to see them move to completed status.";
      default:
        return "Try adjusting your filter or create a new campaign";
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to view campaigns.</div>;
  }

  if (loading) {
    return <div>Loading campaigns...</div>;
  }

  if (error) {
    // If the error is "No brand found for this user", redirect to brand setup
    if (error.includes('No brand found for this user')) {
      return (
        <div className="space-y-4">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Brand Setup Required</h3>
            <p className="text-muted-foreground mb-4">
              You need to set up your brand profile before creating campaigns.
            </p>
            <Link href="/brand/setup-brand">
              <Button>Set Up Brand</Button>
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="text-red-600">Error: {error}</div>
        <Button onClick={fetchCampaigns}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your influencer marketing campaigns
          </p>
        </div>
        <Link href="/brand/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => handleFilterChange("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === "all"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({campaigns.length})
        </button>
        <button
          onClick={() => handleFilterChange("active")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === "active"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Active ({campaigns.filter(c => c.status === "active").length})
        </button>
        <button
          onClick={() => handleFilterChange("pending_budget")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === "pending_budget"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Budget ({campaigns.filter(c => c.status === "pending_budget").length})
        </button>
        <button
          onClick={() => handleFilterChange("paused")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === "pending"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Paused ({campaigns.filter(c => c.status === "paused").length})
        </button>
        <button
          onClick={() => handleFilterChange("completed")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === "completed"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed ({campaigns.filter(c => c.status === "completed").length})
        </button>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {campaigns.length === 0 ? "No campaigns yet" : getFilterSpecificTitle()}
              </h3>
              <p className="text-muted-foreground mb-4">
                {campaigns.length === 0 
                  ? "Create your first campaign to start working with creators"
                  : getFilterSpecificMessage()
                }
              </p>
              <Link href="/brand/campaigns/new">
                <Button>Create Campaign</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign._id} className="flex flex-col lg:flex-row gap-4 items-start">
              {/* Campaign Card */}
              <div className="flex-1">
                <BrandCampaignCard
                  _id={campaign._id}
                  title={campaign.title}
                  description={campaign.description}
                  imageUrl={campaign.imageUrl}
                  type={campaign.type}
                  rate_per_thousand={campaign.rate_per_thousand}
                  status={campaign.status}
                  budget_status={campaign.budget_status}
                  start_date={campaign.start_date}
                  end_date={campaign.end_date}
                  platform={campaign.platform}
                  platforms={campaign.platforms}
                  progress={campaign.progress || 0}
                  totalPaid={campaign.totalPaid || "$0"}
                  targetAmount={campaign.targetAmount || "$0"}
                  category={campaign.category || "Personal brand"}
                />
              </div>
              
              {/* Action Buttons - Right side, responsive */}
              <div className="flex flex-row lg:flex-col gap-1 lg:gap-1 w-full lg:w-auto">
                <Link href={`/brand/campaigns/${campaign._id}`} className="flex-1 lg:flex-none">
                  <Button variant="outline" size="sm" className="w-full lg:w-32 py-1.5">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
                <Link href={`/brand/campaigns/${campaign._id}/edit`} className="flex-1 lg:flex-none">
                  <Button variant="outline" size="sm" className="w-full lg:w-32 py-1.5">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                
                {/* Status Change Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full lg:w-32 py-1.5"
                      disabled={updatingStatus === campaign._id}
                    >
                      <MoreHorizontal className="mr-2 h-4 w-4" />
                      Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(campaign._id, 'active')}
                      disabled={campaign.status === 'active' || updatingStatus === campaign._id}
                    >
                      Set Active
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(campaign._id, 'pending_budget')}
                      disabled={campaign.status === 'pending_budget' || updatingStatus === campaign._id}
                    >
                      Set Pending Budget
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(campaign._id, 'paused')}
                      disabled={campaign.status === 'paused' || updatingStatus === campaign._id}
                    >
                      Set Paused
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange(campaign._id, 'completed')}
                      disabled={campaign.status === 'completed' || updatingStatus === campaign._id}
                    >
                      Set Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Delete Button */}
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full lg:w-32 py-1.5"
                  onClick={() => openDeleteDialog(campaign._id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this campaign? It will be hidden from the interface but can be restored later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => campaignToDelete && handleDeleteCampaign(campaignToDelete)}
            >
              Archive Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


