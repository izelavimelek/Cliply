"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth");
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={user.role as "creator" | "brand" | "admin"} />
      <div className="flex-1">
        <Topbar />
        <main>{children}</main>
      </div>
    </div>
  );
}

