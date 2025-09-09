"use client";

import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sidebar } from "@/components/app/sidebar";

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Check if we're on the new campaign page - don't render sidebar for it
  const isNewCampaignPage = pathname === '/brand/campaigns/new';

  useEffect(() => {
    if (!loading && (!user || user.role !== "brand")) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebar-state-change', handleSidebarStateChange as EventListener);
    
    return () => {
      window.removeEventListener('sidebar-state-change', handleSidebarStateChange as EventListener);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "brand") {
    return null;
  }

  // For new campaign page, render without sidebar to ensure full-screen
  if (isNewCampaignPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Sidebar */}
      <div className="fixed left-0 top-0 h-full z-50">
        <Sidebar userRole="brand" />
      </div>

      {/* Main Content - Responsive margin based on sidebar state */}
      <main className={`flex-1 transition-all duration-300 relative z-10 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}
