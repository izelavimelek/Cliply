"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  CompassIcon,
  MessageCircleIcon,
  BellIcon,
  LayoutDashboardIcon,
  UserIcon,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/creator", icon: HomeIcon },
  { name: "Discover", href: "/creator/campaigns", icon: CompassIcon },
  { name: "Messages", href: "/creator/messages", icon: MessageCircleIcon },
  { name: "Notifications", href: "/creator/notifications", icon: BellIcon },
  { name: "Dashboard", href: "/creator/analytics", icon: LayoutDashboardIcon },
  { name: "Profile", href: "/creator/profile", icon: UserIcon },
];

export function CreatorDashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/creator" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Cliply</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
