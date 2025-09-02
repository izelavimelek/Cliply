"use client";

import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/app/sidebar";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "creator")) {
      router.push("/auth");
    }
  }, [user, loading, router]);

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

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
