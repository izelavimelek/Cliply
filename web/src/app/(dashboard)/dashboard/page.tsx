"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Loader2, Users, Building2 } from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth");
        return;
      }

      // Redirect based on user role
      if (user.role === "creator") {
        router.push("/creator");
      } else if (user.role === "brand") {
        router.push("/brand");
      } else if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return null; // Will redirect
}
