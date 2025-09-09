"use client";

import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/app/sidebar";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "creator")) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      console.log('Layout received sidebar-state-change event:', event.detail);
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

  if (!user || user.role !== "creator") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Dynamic Sidebar */}
      <div className="fixed left-0 top-0 h-full z-40">
        <Sidebar userRole={user.role} />
      </div>

      {/* Main Content - Responsive margin based on sidebar state */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
