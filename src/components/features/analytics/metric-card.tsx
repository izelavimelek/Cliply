"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number | null;
    period: string;
  } | null;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  className 
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend || trend.value === null) return null;
    if (trend.value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend.value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (!trend || trend.value === null) return "text-muted-foreground";
    if (trend.value > 0) return "text-green-500";
    if (trend.value < 0) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={cn("text-sm font-medium", getTrendColor())}>
                  {trend.value !== null ? `${Math.abs(trend.value)}% ` : ''}{trend.period}
                </span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-full bg-muted/50">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
