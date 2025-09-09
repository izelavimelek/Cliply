"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";

interface PerformanceChartProps {
  data: {
    date: string;
    views: number;
    engagement: number;
    submissions: number;
    budget_spent: number;
  }[];
  type?: 'line' | 'bar' | 'area';
  metric?: 'views' | 'engagement' | 'submissions' | 'budget';
}

export function PerformanceChart({ 
  data, 
  type = 'line', 
  metric = 'views' 
}: PerformanceChartProps) {
  const [selectedMetric, setSelectedMetric] = useState(metric);
  const [chartType, setChartType] = useState(type);

  // Mock data for demonstration - in real app, this would come from props
  const mockData = data.length > 0 ? data : [
    { date: '2024-01-01', views: 1200, engagement: 4.2, submissions: 5, budget_spent: 500 },
    { date: '2024-01-02', views: 1800, engagement: 5.1, submissions: 8, budget_spent: 750 },
    { date: '2024-01-03', views: 2200, engagement: 4.8, submissions: 12, budget_spent: 900 },
    { date: '2024-01-04', views: 1900, engagement: 5.3, submissions: 7, budget_spent: 650 },
    { date: '2024-01-05', views: 2500, engagement: 5.7, submissions: 15, budget_spent: 1100 },
    { date: '2024-01-06', views: 2100, engagement: 4.9, submissions: 9, budget_spent: 800 },
    { date: '2024-01-07', views: 2800, engagement: 6.1, submissions: 18, budget_spent: 1200 },
  ];

  const getMetricValue = (item: any) => {
    switch (selectedMetric) {
      case 'views': return item.views;
      case 'engagement': return item.engagement;
      case 'submissions': return item.submissions;
      case 'budget': return item.budget_spent;
      default: return item.views;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'views': return 'Views';
      case 'engagement': return 'Engagement Rate (%)';
      case 'submissions': return 'Submissions';
      case 'budget': return 'Budget Spent ($)';
      default: return 'Views';
    }
  };

  const getMetricIcon = () => {
    switch (selectedMetric) {
      case 'views': return <Activity className="h-4 w-4" />;
      case 'engagement': return <TrendingUp className="h-4 w-4" />;
      case 'submissions': return <BarChart3 className="h-4 w-4" />;
      case 'budget': return <BarChart3 className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const maxValue = Math.max(...mockData.map(getMetricValue));
  const minValue = Math.min(...mockData.map(getMetricValue));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getMetricIcon()}
              Performance Chart
            </CardTitle>
            <CardDescription>
              Track {getMetricLabel().toLowerCase()} over time
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="submissions">Submissions</SelectItem>
                <SelectItem value="budget">Budget Spent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="area">Area</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {/* Simple SVG Chart - In a real app, you'd use a proper charting library like Recharts */}
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <g key={index}>
                <line
                  x1="40"
                  y1={40 + ratio * 280}
                  x2="100%"
                  y2={40 + ratio * 280}
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.1"
                />
                <text
                  x="30"
                  y={40 + ratio * 280 + 5}
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.6"
                  textAnchor="end"
                >
                  {Math.round(maxValue - (maxValue - minValue) * ratio).toLocaleString()}
                </text>
              </g>
            ))}
            
            {/* Data points and lines */}
            {mockData.map((item, index) => {
              const x = 40 + (index * (100 - 40) / (mockData.length - 1)) * 0.8;
              const y = 40 + (1 - (getMetricValue(item) - minValue) / (maxValue - minValue)) * 280;
              const nextItem = mockData[index + 1];
              
              return (
                <g key={index}>
                  {/* Data point */}
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="hsl(var(--primary))"
                    className="hover:r-6 transition-all"
                  />
                  
                  {/* Line to next point */}
                  {nextItem && (
                    <line
                      x1={x}
                      y1={y}
                      x2={40 + ((index + 1) * (100 - 40) / (mockData.length - 1)) * 0.8}
                      y2={40 + (1 - (getMetricValue(nextItem) - minValue) / (maxValue - minValue)) * 280}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      opacity="0.7"
                    />
                  )}
                  
                  {/* X-axis labels */}
                  <text
                    x={x}
                    y="340"
                    fontSize="10"
                    fill="currentColor"
                    opacity="0.6"
                    textAnchor="middle"
                  >
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{getMetricValue(mockData[mockData.length - 1]).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Latest</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{Math.round(mockData.reduce((acc, item) => acc + getMetricValue(item), 0) / mockData.length).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Average</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{maxValue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Peak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {((getMetricValue(mockData[mockData.length - 1]) - getMetricValue(mockData[0])) / getMetricValue(mockData[0]) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Growth</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
