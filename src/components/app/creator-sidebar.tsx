"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  BarChart3, 
  Settings, 
  Wallet,
  Menu, 
  X, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
  _id: string;
  title: string;
  status: string;
  application_status: string;
  applied_at: string;
  approved_at?: string;
  platforms?: string[];
  category?: string;
  imageUrl?: string;
}

interface CreatorSidebarProps {
  userRole: string;
}

export default function CreatorSidebar({ userRole }: CreatorSidebarProps) {
  console.log('CreatorSidebar component rendered with userRole:', userRole);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Dispatch sidebar state changes to parent layout
  useEffect(() => {
    console.log('Sidebar state changed to:', isCollapsed);
    window.dispatchEvent(new CustomEvent('sidebar-state-change', {
      detail: { collapsed: isCollapsed }
    }));
  }, [isCollapsed]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const isCampaignDetailPage = pathname?.includes('/creator/campaigns/') && pathname !== '/creator/campaigns';

  // Auto-collapse when on campaign detail page
  useEffect(() => {
    if (isCampaignDetailPage) {
      // Always collapse sidebar when on campaign detail page
      console.log('Sidebar - isCampaignDetailPage:', isCampaignDetailPage);
      console.log('Sidebar - Setting collapsed to true for campaign detail page');
      setIsCollapsed(true);
    } else {
      // Not on campaign detail page, expand sidebar
      console.log('Sidebar - Not on campaign detail page, expanding sidebar');
      setIsCollapsed(false);
    }
  }, [isCampaignDetailPage, pathname]);

  // Listen for navigation events to auto-collapse sidebar when navigating to campaigns
  useEffect(() => {
    const handleNavigation = () => {
      // Small delay to ensure URL has updated
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const isCampaignPage = currentPath.includes('/creator/campaigns/') && currentPath !== '/creator/campaigns';
        const urlParams = new URLSearchParams(window.location.search);
        const fromSidebar = urlParams.get('from') === 'sidebar';
        
        if (isCampaignPage && fromSidebar) {
          console.log('Navigation detected - collapsing sidebar for campaign page');
          setIsCollapsed(true);
        } else if (!isCampaignPage) {
          // If navigating away from campaign pages, expand sidebar
          console.log('Navigation detected - expanding sidebar (not on campaign page)');
          setIsCollapsed(false);
        }
      }, 100);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleNavigation);
    
    // Also listen for custom navigation events
    window.addEventListener('campaign-navigation', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('campaign-navigation', handleNavigation);
    };
  }, []);

  useEffect(() => {
    console.log('Creator Sidebar useEffect - userRole:', userRole);
    if (userRole === "creator") {
      console.log('Fetching campaigns for creator on initial load');
      fetchCampaigns();
    } else {
      console.log('User role is not creator, not fetching campaigns');
    }
  }, [userRole]);

  // Listen for campaign changes (join, etc.)
  useEffect(() => {
    if (userRole === "creator") {
      const handleCampaignChange = (event?: Event) => {
        console.log('Campaign change detected, refreshing sidebar...', event?.type);
        fetchCampaigns();
      };

      window.addEventListener('campaign-joined', handleCampaignChange);

      return () => {
        window.removeEventListener('campaign-joined', handleCampaignChange);
      };
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === "creator") {
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

      const apiUrl = '/api/creator/campaigns';
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
      } else {
        console.error('Failed to fetch campaigns:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLinks = () => {
    const links = [
      { href: "/creator", label: "Dashboard", icon: LayoutDashboard },
      { href: "/creator/discover", label: "Discover", icon: Search },
      { href: "/creator/submissions", label: "Submissions", icon: FileText },
      { href: "/creator/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/creator/wallet", label: "Wallet", icon: Wallet },
      { href: "/creator/settings", label: "Settings", icon: Settings },
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
    <div className={cn(
      "flex h-screen flex-col bg-background border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Creator Dashboard</h2>
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

      {/* Joined Campaigns Section - Modern Redesign */}
      {userRole === "creator" && (
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
                    Active Campaigns
                  </h3>
                </div>
              )}
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
                      <Search className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No campaigns yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Join campaigns to see them here</p>
                  </>
                ) : (
                  <div className="w-8 h-8 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ) : (
              <div className={cn(
                "space-y-2",
                isCollapsed ? "" : "space-y-3"
              )}>
                {campaigns.map((campaign) => {
                  const isActive = pathname === `/creator/campaigns/${campaign._id}`;
                  const statusColor = campaign.application_status === 'approved' 
                    ? 'bg-green-500' 
                    : campaign.application_status === 'pending' 
                    ? 'bg-yellow-500' 
                    : 'bg-gray-400';
                  
                  return (
                    <Link
                      key={campaign._id}
                      href={`/creator/campaigns/${campaign._id}?from=sidebar`}
                      onClick={(e) => {
                        // Prevent default navigation temporarily
                        e.preventDefault();
                        
                        // Immediately collapse sidebar when clicking on a campaign
                        console.log('Campaign clicked - collapsing sidebar');
                        setIsCollapsed(true);
                        
                        // Dispatch sidebar state change event for layout
                        window.dispatchEvent(new CustomEvent('sidebar-state-change', {
                          detail: { collapsed: true }
                        }));
                        
                        // Dispatch custom event for additional handling
                        window.dispatchEvent(new CustomEvent('campaign-navigation'));
                        
                        // Navigate after a small delay to ensure events are processed
                        setTimeout(() => {
                          window.location.href = `/creator/campaigns/${campaign._id}?from=sidebar`;
                        }, 50);
                      }}
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
                                    campaign.application_status === 'approved' 
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : campaign.application_status === 'pending'
                                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                                  )}>
                                    {campaign.application_status === 'approved' ? 'Active' : 
                                     campaign.application_status === 'pending' ? 'Pending' : 'Unknown'}
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

      {/* Theme Toggle at Bottom */}
      <div className={cn(
        "mt-auto border-t border-border p-3",
        isCollapsed ? "px-2" : "px-4"
      )}>
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
