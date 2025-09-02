"use client";

import { DollarSign, Clock, Target, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}

function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon}
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Earnings"
        value="$0.00"
        subtitle="From 0 approved submissions"
        icon={<DollarSign className="h-4 w-4 text-green-500" />}
      />
      <StatsCard
        title="Pending Earnings"
        value="$0.00"
        subtitle="From 0 pending submissions"
        icon={<Clock className="h-4 w-4 text-orange-500" />}
      />
      <StatsCard
        title="Active Campaigns"
        value="0"
        subtitle="Available to apply for"
        icon={<Target className="h-4 w-4 text-blue-500" />}
      />
      <StatsCard
        title="Total Submissions"
        value="0"
        subtitle="Across all campaigns"
        icon={<ListChecks className="h-4 w-4 text-purple-500" />}
      />
    </div>
  );
}
