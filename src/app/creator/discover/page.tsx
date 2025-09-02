"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Target, 
  DollarSign, 
  Calendar,
  Users,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { FaYoutube, FaTiktok, FaInstagram, FaTwitter } from "react-icons/fa";

// Type definitions
interface Campaign {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  total_budget?: number;
  budget_spent?: number;
  rate_type?: 'fixed' | 'per_thousand';
  rate_per_thousand?: number;
  brand_name?: string;
  brand_id?: string;
  platforms?: string[];
  platform?: string;
  views?: number;
  status?: string;
}

type PlatformType = 'instagram' | 'tiktok' | 'youtube' | 'twitter';

export default function DiscoverPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [joinedCampaigns, setJoinedCampaigns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const campaignsPerPage = 9;

  // Fetch joined campaigns
  const fetchJoinedCampaigns = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/creator/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const joinedIds = data.items.map((campaign: any) => campaign._id);
        setJoinedCampaigns(joinedIds);
      }
    } catch (error) {
      console.error('Error fetching joined campaigns:', error);
    }
  };

  // Fetch campaigns from the database
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch('/api/campaigns?status=active', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }

        const data = await response.json();
        setCampaigns(data.items || []);
        // Calculate total pages based on total count
        const totalCount = data.total || data.items?.length || 0;
        setTotalPages(Math.ceil(totalCount / campaignsPerPage));
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCampaigns();
    }
  }, [user, currentPage]);

  // Fetch joined campaigns on component mount
  useEffect(() => {
    if (user) {
      fetchJoinedCampaigns();
    }
  }, [user]);

  // Listen for campaign join events to refresh joined campaigns
  useEffect(() => {
    const handleCampaignJoined = () => {
      console.log('Campaign joined event received, refreshing joined campaigns');
      fetchJoinedCampaigns();
    };

    window.addEventListener('campaign-joined', handleCampaignJoined);
    return () => {
      window.removeEventListener('campaign-joined', handleCampaignJoined);
    };
  }, []);

  // Pagination logic
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/creator/campaigns/${campaignId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{campaigns.length} live Content Rewards</h1>
        </div>
        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Type: All</SelectItem>
              <SelectItem value="clipping">Clipping</SelectItem>
              <SelectItem value="ugc">UGC</SelectItem>
              <SelectItem value="review">Review</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Category: All</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by: Highest available budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="budget">Sort by: Highest available budget</SelectItem>
              <SelectItem value="rate">Sort by: Highest payment rate</SelectItem>
              <SelectItem value="views">Sort by: Most views</SelectItem>
              <SelectItem value="newest">Sort by: Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading campaigns...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">Error loading campaigns: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {/* Campaigns Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No active campaigns available at the moment.</p>
            </div>
          ) : (
            campaigns.map((campaign) => {
              // Calculate progress based on actual campaign data
              const totalBudget = campaign.total_budget || 0;
              const paidOut = campaign.budget_spent || 0;
              const progressPercentage = totalBudget > 0 ? (paidOut / totalBudget) * 100 : 0;
              
              // Get brand name from campaign data
              const brandName = campaign.brand_name || campaign.brand_id || 'Unknown Brand';
              
              // Format payment rate
              const rateType = campaign.rate_type || 'fixed';
              const rate = campaign.rate_per_thousand || campaign.total_budget || 0;
              const paymentRate = rateType === 'per_thousand' ? `$${rate}/1K` : `$${rate} fixed`;
              
              // Get platforms array
              const platforms = campaign.platforms || [campaign.platform].filter(Boolean) || [];
              
              return (
                <Card 
                  key={campaign._id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleCampaignClick(campaign._id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {brandName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{campaign.title}</h3>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {paymentRate}
                        </Badge>
                        {joinedCampaigns.includes(campaign._id) && (
                          <Badge variant="default" className="bg-blue-600 text-white text-xs">
                            ✓ Joined
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {campaign.description || 'No description available'}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>${paidOut.toLocaleString()} of ${totalBudget.toLocaleString()} paid out</span>
                        <span>{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${progressPercentage > 0 ? 'bg-orange-500' : 'bg-gray-300'}`}
                          style={{ width: `${Math.max(progressPercentage, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{campaign.category || 'Campaign'}</Badge>
                      <div className="flex items-center gap-1">
                        {platforms.map((platform: string | undefined) => {
                          if (!platform) return null;
                          const platformIcons: Record<PlatformType, React.ReactElement> = {
                            'instagram': <FaInstagram className="w-4 h-4 text-pink-600" />,
                            'tiktok': <FaTiktok className="w-4 h-4 text-black dark:text-white" />,
                            'youtube': <FaYoutube className="w-4 h-4 text-red-600" />,
                            'twitter': <FaTwitter className="w-4 h-4 text-blue-500" />
                          };
                          const platformKey = platform.toLowerCase() as PlatformType;
                          return (
                            <span key={platform} title={platform}>
                              {platformIcons[platformKey] || <span className="w-4 h-4 bg-gray-400 rounded"></span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {campaign.views || 0} Views
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  className={`px-3 py-2 text-sm ${
                    currentPage === page 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "hover:bg-muted"
                  }`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
