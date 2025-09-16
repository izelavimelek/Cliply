"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogoutButton } from "@/components/ui/logout-button";
import { 
  LayoutDashboard, 
  Megaphone, 
  FileText, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Plus, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrandProfileModal } from "@/hooks/useBrandProfileModal";
import { BrandProfileModal } from "@/components/ui/brand-profile-modal";

interface Campaign {
  _id: string;
  title: string;
  status: string;
  budget_status?: string;
  total_budget?: number;
  platforms?: string[];
  category?: string;
  imageUrl?: string;
}

interface BrandSidebarProps {
  userRole: string;
}

export default function BrandSidebar({ userRole }: BrandSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [brandName, setBrandName] = useState<string>("Brand Dashboard");
  const pathname = usePathname();
  
  const { isModalOpen, missingFields, handleNewCampaignClick, handleRedirect, closeModal } = useBrandProfileModal();

  const isCampaignDetailPage = pathname?.includes('/brand/campaigns/') && pathname !== '/brand/campaigns';

  // Dispatch sidebar state changes to parent layout
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-state-change', {
      detail: { collapsed: isCollapsed }
    }));
  }, [isCollapsed]);

  // Auto-collapse when on campaign detail page
  useEffect(() => {
    setIsCollapsed(isCampaignDetailPage);
  }, [isCampaignDetailPage]);

  useEffect(() => {
    console.log('Brand Sidebar useEffect - userRole:', userRole);
    if (userRole === "brand") {
      console.log('Fetching campaigns for brand');
      fetchCampaigns();
      fetchBrandName();
    }
  }, [userRole]);

  const fetchBrandName = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/brands/my-brand', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const brandData = await response.json();
        setBrandName(brandData.name || "Brand Dashboard");
      }
    } catch (error) {
      console.error('Error fetching brand name:', error);
    }
  };


  // Listen for campaign changes (create, update, delete)
  useEffect(() => {
    if (userRole === "brand") {
      const handleCampaignChange = () => {
        console.log('Campaign change detected, refreshing sidebar...');
        fetchCampaigns();
      };

      const handleCampaignUpdate = (event: CustomEvent) => {
        console.log('Campaign update detected:', event.detail);
        if (event.detail?.status === 'deleted') {
          console.log('Campaign soft deleted, refreshing sidebar...');
          fetchCampaigns();
        } else {
          handleCampaignChange();
        }
      };

      window.addEventListener('campaign-updated', handleCampaignUpdate as EventListener);
      window.addEventListener('campaign-deleted', handleCampaignChange);
      window.addEventListener('campaign-created', handleCampaignChange);

      const handleRouteChange = () => {
        if (pathname === '/brand/campaigns') {
          console.log('Navigating to campaigns page, refreshing sidebar...');
          fetchCampaigns();
        }
      };

      window.addEventListener('popstate', handleRouteChange);

      return () => {
        window.removeEventListener('campaign-updated', handleCampaignUpdate as EventListener);
        window.removeEventListener('campaign-deleted', handleCampaignChange);
        window.removeEventListener('campaign-created', handleCampaignChange);
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [userRole, pathname]);

  useEffect(() => {
    if (userRole === "brand" && pathname === '/brand/campaigns') {
      console.log('Pathname changed to campaigns, refreshing sidebar...');
      fetchCampaigns();
    }
  }, [userRole, pathname]);

  useEffect(() => {
    if (userRole === "brand") {
      (window as any).refreshSidebarCampaigns = fetchCampaigns;
      
      return () => {
        delete (window as any).refreshSidebarCampaigns;
      };
    }
  }, [userRole]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = '/api/campaigns?role=brand';
      console.log('Fetching campaigns from:', apiUrl);
      
      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Received campaigns data:', data);
        console.log('Setting campaigns:', data.items || []);
        setCampaigns(data.items || []);
      } else if (res.status === 404) {
        // No brand found - this is expected, not an error
        console.log('No brand found for user, showing empty campaigns list');
        setCampaigns([]);
      } else {
        console.error('Failed to fetch campaigns:', res.status, res.statusText);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const getLinks = () => {
    const links = [
      { href: "/brand", label: "Dashboard", icon: LayoutDashboard },
      { href: "/brand/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/brand/submissions", label: "Submissions", icon: FileText },
      { href: "/brand/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/brand/settings", label: "Settings", icon: Settings },
    ];

    return links.map((link) => {
      const Icon = link.icon;
      const isActive = pathname === link.href;
      
      return (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-3 text-base hover:bg-accent hover:text-accent-foreground transition-colors",
            isActive && "bg-accent text-accent-foreground",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? link.label : undefined}
        >
          <Icon className={cn(
            "transition-all duration-300",
            isCollapsed ? "h-5 w-5" : "h-4 w-4"
          )} />
          {!isCollapsed && <span className="transition-all duration-300">{link.label}</span>}
        </Link>
      );
    });
  };



  return (
    <>
    <div className={cn(
      "flex h-screen flex-col bg-sidebar border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold truncate" title={brandName}>
            {brandName}
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="px-4 pt-4 pb-2 space-y-2">
        {getLinks()}
      </nav>

      {/* Campaigns Section - Modern Redesign */}
      {userRole === "brand" && (
        <div className="flex-1 border-t border-border flex flex-col min-h-0">
          {/* Header with Gradient Background */}
          <div className={cn(
            "relative py-3",
            isCollapsed ? "px-2" : "px-4"
          )}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-t-lg"></div>
            <div className={cn(
              "relative flex items-center",
              isCollapsed ? "justify-center" : "justify-between"
            )}>
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Your Campaigns
                  </h3>
                </div>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    console.log('Manual refresh requested');
                    fetchCampaigns();
                  }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                  title={isCollapsed ? "Refresh" : undefined}
                >
                  <RefreshCw className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "h-4 w-4" : "h-3.5 w-3.5"
                  )} />
                </button>
                <button
                  onClick={handleNewCampaignClick}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                  title={isCollapsed ? "New Campaign" : undefined}
                >
                  <Plus className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "h-4 w-4" : "h-3.5 w-3.5"
                  )} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Campaigns List with Modern Cards */}
          <div className={cn(
            "flex-1 overflow-y-auto pb-3",
            isCollapsed ? "px-2" : "px-4"
          )}>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className={cn(
                      "bg-muted/30 rounded-lg",
                      isCollapsed ? "p-2" : "p-3"
                    )}>
                      <div className={cn(
                        "flex items-center",
                        isCollapsed ? "justify-center" : "gap-3"
                      )}>
                        <div className={cn(
                          "bg-muted/50 rounded-lg",
                          isCollapsed ? "w-8 h-8" : "w-10 h-10"
                        )}></div>
                        {!isCollapsed && (
                          <div className="flex-1 space-y-1">
                            <div className="h-3 bg-muted/50 rounded w-3/4"></div>
                            <div className="h-2 bg-muted/30 rounded w-1/2"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className={cn(
                "text-center py-8",
                isCollapsed ? "px-1" : ""
              )}>
                {!isCollapsed ? (
                  <>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No campaigns yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Create campaigns to see them here</p>
                  </>
                ) : (
                  <div className="w-8 h-8 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ) : (
              <div className={cn(
                "space-y-2",
                isCollapsed ? "" : "space-y-3"
              )}>
                {campaigns.map((campaign) => {
                  const isActive = pathname === `/brand/campaigns/${campaign._id}`;
                  const statusColor = campaign.status === 'active' 
                    ? 'bg-green-500' 
                    : campaign.status === 'pending_budget'
                    ? 'bg-orange-500'
                    : campaign.status === 'paused'
                    ? 'bg-yellow-500'
                    : campaign.status === 'completed'
                    ? 'bg-blue-500'
                    : 'bg-gray-400';
                  
                  return (
                    <Link
                      key={campaign._id}
                      href={`/brand/campaigns/${campaign._id}`}
                      className={cn(
                        "group block rounded-lg border transition-all duration-200 hover:shadow-sm",
                        isActive 
                          ? "border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm" 
                          : "border-border/50 hover:border-border hover:bg-accent/30"
                      )}
                      title={isCollapsed ? campaign.title : undefined}
                    >
                      <div className={cn(
                        isCollapsed ? "p-2" : "p-4"
                      )}>
                        <div className={cn(
                          "flex items-center",
                          isCollapsed ? "justify-center" : "gap-3"
                        )}>
                          {/* Campaign Image/Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className={cn(
                              "rounded-lg overflow-hidden ring-2 ring-offset-1 transition-all duration-200",
                              isActive ? "ring-primary/30" : "ring-transparent group-hover:ring-accent/30",
                              isCollapsed ? "w-8 h-8" : "w-10 h-10"
                            )}>
                              {campaign.imageUrl ? (
                                <img
                                  src={campaign.imageUrl}
                                  alt={campaign.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className={cn(
                                  "bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center",
                                  isCollapsed ? "w-8 h-8" : "w-10 h-10"
                                )}>
                                  <span className={cn(
                                    "font-semibold text-foreground",
                                    isCollapsed ? "text-xs" : "text-sm"
                                  )}>
                                    {campaign.title.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Status Indicator */}
                            <div className={cn(
                              "absolute -top-1 -right-1 rounded-full border-2 border-background",
                              statusColor,
                              isCollapsed ? "w-2 h-2" : "w-3 h-3"
                            )}></div>
                          </div>
                          
                          {/* Campaign Info - Only show when not collapsed */}
                          {!isCollapsed && (
                            <>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                  {campaign.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                    campaign.status === 'active' 
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : campaign.status === 'pending_budget'
                                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                      : campaign.status === 'paused'
                                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : campaign.status === 'completed'
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                                  )}>
                                    {campaign.status === 'pending_budget' ? 'Pending Budget' : 
                                     campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Arrow Indicator */}
                              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Theme Toggle and Logout at Bottom */}
      <div className={cn(
        "mt-auto border-t border-border p-3",
        isCollapsed ? "px-2" : "px-4"
      )}>
        <div className={cn(
          "flex items-center",
          isCollapsed ? "gap-1 justify-center" : "gap-2 justify-between"
        )}>
          <ThemeToggle isCollapsed={isCollapsed} />
          <LogoutButton 
            isCollapsed={isCollapsed}
            showText={!isCollapsed}
          />
        </div>
      </div>
    </div>
    
    <BrandProfileModal
      isOpen={isModalOpen}
      onClose={closeModal}
      onRedirect={handleRedirect}
      missingFields={missingFields}
    />
    </>
  );
}
