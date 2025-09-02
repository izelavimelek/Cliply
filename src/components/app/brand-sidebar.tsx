"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const pathname = usePathname();

  const isCampaignDetailPage = pathname?.includes('/brand/campaigns/') && pathname !== '/brand/campaigns';

  // Auto-collapse when on campaign detail page
  useEffect(() => {
    setIsCollapsed(isCampaignDetailPage);
  }, [isCampaignDetailPage]);

  useEffect(() => {
    console.log('Brand Sidebar useEffect - userRole:', userRole);
    if (userRole === "brand") {
      console.log('Fetching campaigns for brand');
      fetchCampaigns();
    }
  }, [userRole]);

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
    <div className={cn(
      "flex h-screen flex-col bg-background border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Brand Dashboard</h2>
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

      {/* Campaigns Section - Separate and Scrollable */}
      {userRole === "brand" && (
        <div className="flex-1 border-t border-border flex flex-col min-h-0">
          <div className={cn(
            "flex items-center px-4 py-3",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                YOUR CAMPAIGNS
              </h3>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  console.log('Manual refresh requested');
                  fetchCampaigns();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title={isCollapsed ? "Refresh" : undefined}
              >
                <RefreshCw className={cn(
                  "transition-all duration-300",
                  isCollapsed ? "h-4 w-4" : "h-3 w-3"
                )} />
              </button>
              <Link 
                href="/brand/campaigns/new"
                className="text-muted-foreground hover:text-foreground"
                title={isCollapsed ? "New Campaign" : undefined}
              >
                <Plus className={cn(
                  "transition-all duration-300",
                  isCollapsed ? "h-4 w-4" : "h-3 w-3"
                )} />
              </Link>
            </div>
          </div>
          
          {/* Scrollable Campaigns List */}
          <div className="flex-1 overflow-y-auto px-4 pb-2">
            <div className="space-y-1">
              {loading ? (
                <div className={cn(
                  "text-xs text-muted-foreground",
                  isCollapsed ? "px-2 py-1 text-center" : "px-3 py-1"
                )}>
                  {isCollapsed ? "..." : "Loading campaigns..."}
                </div>
              ) : campaigns.length === 0 ? (
                <div className={cn(
                  "text-xs text-muted-foreground",
                  isCollapsed ? "px-2 py-1 text-center" : "px-3 py-1"
                )}>
                  {isCollapsed ? "0" : "No campaigns yet"}
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <Link
                    key={campaign._id}
                    href={`/brand/campaigns/${campaign._id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-base hover:bg-accent hover:text-accent-foreground transition-colors",
                      pathname === `/brand/campaigns/${campaign._id}` && "bg-accent text-accent-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? campaign.title : undefined}
                  >
                    <div className={cn(
                      "rounded-md overflow-hidden flex-shrink-0",
                      isCollapsed ? "w-10 h-10" : "w-8 h-8"
                    )}>
                      {campaign.imageUrl ? (
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className={cn(
                            "font-semibold text-muted-foreground transition-all duration-300",
                            isCollapsed ? "text-base" : "text-sm"
                          )}>
                            {campaign.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {!isCollapsed && (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{campaign.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {campaign.status} • {campaign.platforms?.join(', ') || 'All platforms'}
                          </p>
                        </div>
                        {campaign.budget_status === 'over_budget' && (
                          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" title="Over Budget"></div>
                        )}
                      </>
                    )}
                  </Link>
                ))
              )}
            </div>
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
