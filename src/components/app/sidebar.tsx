"use client";

import BrandSidebar from "./brand-sidebar";
import CreatorSidebar from "./creator-sidebar";

interface SidebarProps {
  userRole?: "creator" | "brand" | "admin";
}

export function Sidebar({ userRole }: SidebarProps) {
  console.log('Main Sidebar - userRole:', userRole);
  
  if (userRole === "brand") {
    console.log('Rendering BrandSidebar');
    return <BrandSidebar userRole={userRole} />;
  }
  
  if (userRole === "creator") {
    console.log('Rendering CreatorSidebar');
    return <CreatorSidebar userRole={userRole} />;
  }
  
  // Default fallback for admin or unknown roles
  return (
    <div className="flex h-full flex-col bg-background border-r border-border w-64">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      </div>
      <div className="flex-1 p-4">
        <p className="text-muted-foreground">Admin sidebar not implemented yet</p>
      </div>
    </div>
  );
}