"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Target, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Pause, 
  Play,
  DollarSign,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  brand_name: string;
  brand_id: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'active' | 'paused' | 'completed' | 'cancelled';
  total_budget: number;
  budget_spent: number;
  submissions: number;
  created_at: string;
  category: string;
  rejection_reason?: string;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [budgetRange, setBudgetRange] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      // TODO: Implement real API endpoint for campaign management
      // const response = await fetch('/api/admin/campaigns');
      // const data = await response.json();
      
      // Mock data for now
      const mockCampaigns: Campaign[] = [
        {
          id: "1",
          title: "Gaming Headset Review Campaign",
          brand_name: "TechCorp",
          brand_id: "brand1",
          status: "active",
          total_budget: 5000,
          budget_spent: 2300,
          submissions: 23,
          created_at: "2024-01-15T10:00:00Z",
          category: "Gaming"
        },
        {
          id: "2",
          title: "Fashion Summer Collection",
          brand_name: "StyleBrand",
          brand_id: "brand2",
          status: "paused",
          total_budget: 8000,
          budget_spent: 1200,
          submissions: 8,
          created_at: "2024-01-12T14:30:00Z",
          category: "Fashion"
        },
        {
          id: "3",
          title: "Fitness App Promotion",
          brand_name: "HealthTech",
          brand_id: "brand3",
          status: "completed",
          total_budget: 3000,
          budget_spent: 2950,
          submissions: 45,
          created_at: "2024-01-08T09:15:00Z",
          category: "Health"
        },
        {
          id: "4",
          title: "Beauty Product Showcase",
          brand_name: "GlowCorp",
          brand_id: "brand4",
          status: "pending_approval",
          total_budget: 4500,
          budget_spent: 0,
          submissions: 0,
          created_at: "2024-01-20T16:45:00Z",
          category: "Beauty"
        },
        {
          id: "5",
          title: "Tech Gadget Unboxing",
          brand_name: "InnovateTech",
          brand_id: "brand5",
          status: "pending_approval",
          total_budget: 6200,
          budget_spent: 0,
          submissions: 0,
          created_at: "2024-01-19T11:20:00Z",
          category: "Technology"
        },
        {
          id: "6",
          title: "Food Delivery Service",
          brand_name: "QuickEats",
          brand_id: "brand6",
          status: "rejected",
          total_budget: 2800,
          budget_spent: 0,
          submissions: 0,
          created_at: "2024-01-18T09:30:00Z",
          category: "Food",
          rejection_reason: "Campaign objectives not clearly defined"
        }
      ];
      
      setCampaigns(mockCampaigns);
      setLoading(false);
    } catch (error) {
      console.error("Error loading campaigns:", error);
      setLoading(false);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: string, rejectionReason?: string) => {
    console.log(`Action ${action} for campaign ${campaignId}`, rejectionReason ? `Reason: ${rejectionReason}` : '');
    
    try {
      // Update local state immediately for better UX
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => {
          if (campaign.id !== campaignId) return campaign;
          
          switch (action) {
            case 'approve':
              return { ...campaign, status: 'approved' as const };
            case 'reject':
              return { ...campaign, status: 'rejected' as const, rejection_reason: rejectionReason };
            case 'pause':
              return { ...campaign, status: 'paused' as const };
            case 'resume':
              return { ...campaign, status: 'active' as const };
            case 'complete':
              return { ...campaign, status: 'completed' as const };
            case 'cancel':
              return { ...campaign, status: 'cancelled' as const };
            default:
              return campaign;
          }
        })
      );

      // TODO: Implement actual API calls
      // const token = localStorage.getItem('auth_token');
      // await fetch(`/api/admin/campaigns/${campaignId}/${action}`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ rejectionReason }),
      // });
      
    } catch (error) {
      console.error(`Error performing ${action} on campaign ${campaignId}:`, error);
      alert(`Failed to ${action} campaign. Please try again.`);
    }
  };

  const handleRejectCampaign = (campaignId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      handleCampaignAction(campaignId, 'reject', reason);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.brand_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    const matchesCategory = filterCategory === "all" || campaign.category === filterCategory;
    
    let matchesBudget = true;
    if (budgetRange !== "all") {
      switch (budgetRange) {
        case "0-1000":
          matchesBudget = campaign.total_budget <= 1000;
          break;
        case "1000-5000":
          matchesBudget = campaign.total_budget > 1000 && campaign.total_budget <= 5000;
          break;
        case "5000-10000":
          matchesBudget = campaign.total_budget > 5000 && campaign.total_budget <= 10000;
          break;
        case "10000+":
          matchesBudget = campaign.total_budget > 10000;
          break;
      }
    }
    
    let matchesDate = true;
    if (dateRange !== "all") {
      const campaignDate = new Date(campaign.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - campaignDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case "7":
          matchesDate = daysDiff <= 7;
          break;
        case "30":
          matchesDate = daysDiff <= 30;
          break;
        case "90":
          matchesDate = daysDiff <= 90;
          break;
        case "365":
          matchesDate = daysDiff <= 365;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesBudget && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case 'pending_approval':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-600">Paused</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-600 text-white">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (spent: number, total: number) => {
    return Math.round((spent / total) * 100);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterCategory("all");
    setBudgetRange("all");
    setDateRange("all");
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filterStatus !== "all") count++;
    if (filterCategory !== "all") count++;
    if (budgetRange !== "all") count++;
    if (dateRange !== "all") count++;
    return count;
  };

  const getUniqueCategories = () => {
    return Array.from(new Set(campaigns.map(c => c.category)));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Target className="w-8 h-8" />
          Campaign Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage all platform campaigns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {campaigns.filter(c => c.status === 'pending_approval').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${campaigns.reduce((sum, c) => sum + c.total_budget, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {campaigns.reduce((sum, c) => sum + c.submissions, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Directory</CardTitle>
          <CardDescription>
            Search and filter platform campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Collapsed Filter Bar */}
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by campaign title or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="gap-2 relative"
              >
                <Filter className="h-4 w-4" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
                {isFilterExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Expanded Filter Options */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isFilterExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {getUniqueCategories().map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                    <Select value={budgetRange} onValueChange={setBudgetRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Budgets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Budgets</SelectItem>
                        <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                        <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                        <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                        <SelectItem value="10000+">$10,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {getActiveFilterCount() > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {searchTerm && (
                      <Badge variant="outline" className="gap-1">
                        Search: "{searchTerm}"
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setSearchTerm("")}
                        />
                      </Badge>
                    )}
                    {filterStatus !== "all" && (
                      <Badge variant="outline" className="gap-1">
                        Status: {filterStatus}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setFilterStatus("all")}
                        />
                      </Badge>
                    )}
                    {filterCategory !== "all" && (
                      <Badge variant="outline" className="gap-1">
                        Category: {filterCategory}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setFilterCategory("all")}
                        />
                      </Badge>
                    )}
                    {budgetRange !== "all" && (
                      <Badge variant="outline" className="gap-1">
                        Budget: {budgetRange === "10000+" ? "$10,000+" : `$${budgetRange.replace("-", " - $")}`}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setBudgetRange("all")}
                        />
                      </Badge>
                    )}
                    {dateRange !== "all" && (
                      <Badge variant="outline" className="gap-1">
                        Date: Last {dateRange} days
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setDateRange("all")}
                        />
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
              <span>
                Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              </span>
              {getActiveFilterCount() > 0 && (
                <span>
                  {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} applied
                </span>
              )}
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget Progress</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{campaign.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {campaign.brand_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(campaign.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          ${campaign.budget_spent.toLocaleString()} / ${campaign.total_budget.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all" 
                            style={{ width: `${calculateProgress(campaign.budget_spent, campaign.total_budget)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {calculateProgress(campaign.budget_spent, campaign.total_budget)}% used
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{campaign.submissions}</div>
                        <div className="text-xs text-muted-foreground">submissions</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCampaignAction(campaign.id, 'view')}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          {/* Approval Actions for Pending Campaigns */}
                          {campaign.status === 'pending_approval' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleCampaignAction(campaign.id, 'approve')}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Campaign
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRejectCampaign(campaign.id)}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Campaign
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {/* Status Management Actions */}
                          {campaign.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleCampaignAction(campaign.id, 'pause')}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause Campaign
                            </DropdownMenuItem>
                          )}
                          {campaign.status === 'paused' && (
                            <DropdownMenuItem onClick={() => handleCampaignAction(campaign.id, 'resume')}>
                              <Play className="w-4 h-4 mr-2" />
                              Resume Campaign
                            </DropdownMenuItem>
                          )}
                          {(campaign.status === 'active' || campaign.status === 'paused') && (
                            <DropdownMenuItem onClick={() => handleCampaignAction(campaign.id, 'complete')}>
                              Complete Campaign
                            </DropdownMenuItem>
                          )}
                          
                          {/* Show rejection reason for rejected campaigns */}
                          {campaign.status === 'rejected' && campaign.rejection_reason && (
                            <DropdownMenuItem 
                              onClick={() => alert(`Rejection Reason: ${campaign.rejection_reason}`)}
                              className="text-orange-600"
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              View Rejection Reason
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem 
                            onClick={() => handleCampaignAction(campaign.id, 'cancel')}
                            className="text-red-600"
                          >
                            Cancel Campaign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
