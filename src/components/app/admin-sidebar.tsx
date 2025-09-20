"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/ui/logout-button";
import {
  Shield,
  LayoutDashboard,
  Users,
  Target,
  FileText,
  DollarSign,
  Settings,
  BarChart3,
  Activity,
  AlertTriangle,
  Database,
  Mail,
  Bell,
  ChevronLeft,
  ChevronRight,
  Building2
} from "lucide-react";

interface AdminSidebarProps {
  userRole?: "admin";
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({
    pendingReviews: 0,
    systemAlerts: 0,
    activeUsers: 0
  });
  
  const pathname = usePathname();
  const router = useRouter();

  // Load sidebar stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        // TODO: Implement real API endpoints for admin stats
        // const response = await fetch('/api/admin/sidebar-stats');
        // const data = await response.json();
        
        // Mock data for now
        setStats({
          pendingReviews: 12,
          systemAlerts: 3,
          activeUsers: 247
        });
      } catch (error) {
        console.error('Error loading sidebar stats:', error);
      }
    };

    loadStats();
  }, []);

  const getLinks = () => {
    const links = [
      { 
        href: "/admin", 
        label: "Dashboard", 
        icon: LayoutDashboard,
        badge: null
      },
      { 
        href: "/admin/users", 
        label: "Users", 
        icon: Users,
        badge: stats.activeUsers > 0 ? stats.activeUsers.toString() : null
      },
      { 
        href: "/admin/brands", 
        label: "Brands", 
        icon: Building2,
        badge: null
      },
      { 
        href: "/admin/campaigns", 
        label: "Campaigns", 
        icon: Target,
        badge: null
      },
      { 
        href: "/admin/submissions", 
        label: "Submissions", 
        icon: FileText,
        badge: stats.pendingReviews > 0 ? stats.pendingReviews.toString() : null
      },
      { 
        href: "/admin/payouts", 
        label: "Payouts", 
        icon: DollarSign,
        badge: null
      },
      { 
        href: "/admin/analytics", 
        label: "Analytics", 
        icon: BarChart3,
        badge: null
      },
      { 
        href: "/admin/system", 
        label: "System Health", 
        icon: Activity,
        badge: stats.systemAlerts > 0 ? stats.systemAlerts.toString() : null
      },
      { 
        href: "/admin/notifications", 
        label: "Notifications", 
        icon: Bell,
        badge: null
      },
      { 
        href: "/admin/settings", 
        label: "Settings", 
        icon: Settings,
        badge: null
      },
    ];

    return links.map((link) => {
      const Icon = link.icon;
      const isActive = pathname === link.href;
      
      return (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-3 text-base hover:bg-accent hover:text-accent-foreground transition-colors relative",
            isActive && "bg-accent text-accent-foreground",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? link.label : undefined}
        >
          <Icon className={cn(
            "transition-all duration-300",
            isCollapsed ? "h-5 w-5" : "h-4 w-4"
          )} />
          {!isCollapsed && (
            <>
              <span className="transition-all duration-300 flex-1">{link.label}</span>
              {link.badge && (
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full",
                  link.label === "Submissions" 
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                    : link.label === "System Health"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                )}>
                  {link.badge}
                </span>
              )}
            </>
          )}
          {isCollapsed && link.badge && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {link.badge}
            </span>
          )}
        </Link>
      );
    });
  };

  return (
    <div className={cn(
      "flex h-screen bg-card border-r border-border transition-all duration-300 ease-in-out flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            <span className="font-bold text-lg">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "h-8 w-8 p-0",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {getLinks()}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground mb-2">
            System Status: Online
          </div>
        )}
        
        <LogoutButton
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isCollapsed && "px-2"
          )}
          showText={!isCollapsed}
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  );
}
