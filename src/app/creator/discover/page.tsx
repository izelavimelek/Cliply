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
        let campaigns = data.items || [];
        
        // Fetch brand details for campaigns that don't have brand_name
        const campaignsWithBrandNames = await Promise.all(
          campaigns.map(async (campaign: Campaign) => {
            if (!campaign.brand_name && campaign.brand_id) {
              try {
                const brandResponse = await fetch(`/api/brands/${campaign.brand_id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                
                if (brandResponse.ok) {
                  const brandData = await brandResponse.json();
                  return { ...campaign, brand_name: brandData.name || 'Brand Partner' };
                }
              } catch (error) {
                console.error('Error fetching brand details:', error);
              }
            }
            return campaign;
          })
        );
        
        setCampaigns(campaignsWithBrandNames);
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
    console.log('Discover page - Campaign clicked, minimizing sidebar');
    
    // Minimize sidebar when navigating to campaign from discover page
    window.dispatchEvent(new CustomEvent('sidebar-state-change', {
      detail: { collapsed: true }
    }));
    
    // Navigate immediately using Next.js router
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
              
              // Get brand name from campaign data - use actual brand name or friendly fallback
              let brandName = campaign.brand_name;
              
              // If no brand_name is available, use a friendly fallback instead of showing ID
              if (!brandName || brandName.trim() === '') {
                brandName = 'Brand Partner';
              }
              
              // Clean up brand name - remove "by" prefix if present
              if (brandName.toLowerCase().startsWith('by ')) {
                brandName = brandName.substring(3);
              }
              
              // Format payment rate
              const rateType = campaign.rate_type || 'fixed';
              const rate = campaign.rate_per_thousand || campaign.total_budget || 0;
              const paymentRate = rateType === 'per_thousand' ? `$${rate}/1K` : `$${rate} fixed`;
              
              // Get platforms array
              const platforms = campaign.platforms || [campaign.platform].filter(Boolean) || [];
              
              return (
                <Card 
                  key={campaign._id} 
                  className="group relative overflow-hidden border-0 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 rounded-2xl"
                  onClick={() => handleCampaignClick(campaign._id)}
                >
                  {/* Gradient Background Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Joined Badge - Floating */}
                  {joinedCampaigns.includes(campaign._id) && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Joined
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="relative p-6">
                    {/* Header Section */}
                    <div className="flex items-start gap-4 mb-5">
                      {/* Brand Avatar */}
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <span className="text-lg font-bold text-white">
                            {brandName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
                      </div>
                      
                      {/* Campaign Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              {campaign.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              {brandName}
                            </p>
                          </div>
                        </div>
                        
                        {/* Payment Rate - Prominent */}
                        <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl font-bold text-lg shadow-sm">
                          <DollarSign className="w-5 h-5 mr-1" />
                          {paymentRate}
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 mb-5 line-clamp-2 leading-relaxed">
                      {campaign.description || 'No description available'}
                    </p>
                    
                    {/* Progress Section */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Campaign Progress
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {progressPercentage.toFixed(0)}% funded
                        </span>
                      </div>
                      
                      {/* Enhanced Progress Bar */}
                      <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800" />
                        <div 
                          className="relative h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-sm"
                          style={{ width: `${Math.max(progressPercentage, 4)}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>${paidOut.toLocaleString()} paid out</span>
                        <span>${totalBudget.toLocaleString()} total</span>
                      </div>
                    </div>
                    
                    {/* Footer Section */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      {/* Left Side - Category & Views */}
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium px-3 py-1"
                        >
                          {campaign.category || 'Campaign'}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">{campaign.views || 0}</span>
                        </div>
                      </div>
                      
                      {/* Right Side - Platforms */}
                      <div className="flex items-center gap-2">
                        {platforms.map((platform: string | undefined) => {
                          if (!platform) return null;
                          const platformIcons: Record<PlatformType, React.ReactElement> = {
                            'instagram': <FaInstagram className="w-5 h-5 text-pink-600" />,
                            'tiktok': <FaTiktok className="w-5 h-5 text-black dark:text-white" />,
                            'youtube': <FaYoutube className="w-5 h-5 text-red-600" />,
                            'twitter': <FaTwitter className="w-5 h-5 text-blue-500" />
                          };
                          const platformKey = platform.toLowerCase() as PlatformType;
                          return (
                            <div 
                              key={platform} 
                              title={platform}
                              className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-sm"
                            >
                              {platformIcons[platformKey] || <span className="w-5 h-5 bg-gray-400 rounded"></span>}
                            </div>
                          );
                        })}
                      </div>
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
