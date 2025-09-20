"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Eye, Heart, DollarSign, BarChart3, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  totalViews: number;
  totalEngagement: number;
  totalBudget: number;
  totalSpent: number;
  roi: number;
  viewsData: { date: string; value: number }[];
  engagementData: { date: string; value: number }[];
  budgetData: { date: string; budget: number; spent: number }[];
  roiData: { date: string; value: number }[];
}

interface AnalyticsGraphsProps {
  data: AnalyticsData;
}

// Views Trend Chart
function ViewsTrendChart({ data }: { data: { totalViews: number; viewsData: { date: string; value: number }[] } }) {
  const chartData = data.viewsData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const currentValue = data.viewsData[data.viewsData.length - 1]?.value || 0;
  const previousValue = data.viewsData[data.viewsData.length - 2]?.value || 0;
  const percentChange = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-4 w-4 text-blue-500" />
          Views Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-foreground">{data.totalViews.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">total views</div>
          </div>
          
          {/* Recharts Line Chart */}
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="rgb(59 130 246)" 
                  strokeWidth={2}
                  dot={{ fill: 'rgb(59 130 246)', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 4, stroke: 'rgb(59 130 246)', strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            {percentChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={percentChange >= 0 ? "text-green-500" : "text-red-500"}>
              {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Engagement Rate Chart
function EngagementRateChart({ data }: { data: { totalEngagement: number; engagementData: { date: string; value: number }[] } }) {
  const chartData = data.engagementData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const currentValue = data.engagementData[data.engagementData.length - 1]?.value || 0;
  const previousValue = data.engagementData[data.engagementData.length - 2]?.value || 0;
  const percentChange = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="h-4 w-4 text-pink-500" />
          Engagement Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-foreground">{data.totalEngagement.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">average engagement</div>
          </div>
          
          {/* Recharts Bar Chart */}
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar 
                  dataKey="value" 
                  fill="rgb(236 72 153)" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            {percentChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={percentChange >= 0 ? "text-green-500" : "text-red-500"}>
              {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Budget Performance Chart
function BudgetPerformanceChart({ data }: { data: { totalBudget: number; totalSpent: number; budgetData: { date: string; budget: number; spent: number }[] } }) {
  const spentPercentage = data.totalBudget > 0 ? (data.totalSpent / data.totalBudget) * 100 : 0;
  
  // Create spending trend data for mini bar chart
  const trendData = data.budgetData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    spentRatio: item.budget > 0 ? (item.spent / item.budget) * 100 : 0
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4 text-green-500" />
          Budget Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-foreground">${data.totalSpent.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              of ${data.totalBudget.toLocaleString()} budget
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="text-sm">
              <span className="font-medium text-green-600">{spentPercentage.toFixed(1)}% utilized</span>
            </div>
          </div>
          
          {/* Mini spending trend chart */}
          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Bar 
                  dataKey="spentRatio" 
                  fill="rgb(34 197 94)" 
                  radius={[1, 1, 0, 0]}
                  opacity={0.6}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Daily spending trend
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ROI Performance Chart
function ROIPerformanceChart({ data }: { data: { roi: number; roiData: { date: string; value: number }[] } }) {
  const chartData = data.roiData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const currentValue = data.roiData[data.roiData.length - 1]?.value || 0;
  const previousValue = data.roiData[data.roiData.length - 2]?.value || 0;
  const percentChange = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-purple-500" />
          ROI Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-foreground">{data.roi.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">return on investment</div>
          </div>
          
          {/* Recharts Area Chart */}
          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(147 51 234)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgb(147 51 234)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(147 51 234)"
                  strokeWidth={2}
                  fill="url(#roiGradient)"
                  dot={{ fill: 'rgb(147 51 234)', strokeWidth: 0, r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            {percentChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={percentChange >= 0 ? "text-green-500" : "text-red-500"}>
              {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsGraphs({ data }: AnalyticsGraphsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ViewsTrendChart data={{ totalViews: data.totalViews, viewsData: data.viewsData }} />
      <EngagementRateChart data={{ totalEngagement: data.totalEngagement, engagementData: data.engagementData }} />
      <BudgetPerformanceChart data={{ 
        totalBudget: data.totalBudget, 
        totalSpent: data.totalSpent, 
        budgetData: data.budgetData 
      }} />
      <ROIPerformanceChart data={{ roi: data.roi, roiData: data.roiData }} />
    </div>
  );
}
