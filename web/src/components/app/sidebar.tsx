"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, LayoutGrid, User, Building2, ShieldCheck, Target, TrendingUp, DollarSign, Settings } from "lucide-react";

interface SidebarProps {
  userRole?: "creator" | "brand" | "admin";
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const getLinks = () => {
    switch (userRole) {
      case "creator":
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/creator/campaigns", label: "Browse Campaigns", icon: Target },
          { href: "/creator/submissions", label: "My Submissions", icon: TrendingUp },
          { href: "/creator/earnings", label: "Earnings", icon: DollarSign },
          { href: "/creator/profile", label: "Profile", icon: User },
        ];
      case "brand":
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/brand/campaigns", label: "My Campaigns", icon: Target },
          { href: "/brand/submissions", label: "Review Submissions", icon: TrendingUp },
          { href: "/brand/analytics", label: "Analytics", icon: DollarSign },
          { href: "/brand/profile", label: "Brand Profile", icon: Building2 },
        ];
      case "admin":
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/admin/users", label: "User Management", icon: User },
          { href: "/admin/campaigns", label: "Campaign Oversight", icon: Target },
          { href: "/admin/payouts", label: "Payout Management", icon: DollarSign },
          { href: "/admin/settings", label: "System Settings", icon: Settings },
        ];
      default:
        return [
          { href: "/dashboard", label: "Dashboard", icon: Home },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-60 shrink-0 border-r bg-background/50 backdrop-blur">
      <div className="p-4 text-lg font-semibold flex items-center gap-2">
        <LayoutGrid className="h-5 w-5" /> Cliply
      </div>
      <nav className="px-2 pb-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
              pathname === href && "bg-accent text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
