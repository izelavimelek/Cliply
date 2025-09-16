"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Instagram, 
  Youtube, 
  Target, 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  FileText,
  Globe,
  Tag,
  BarChart3
} from "lucide-react";
import { CampaignType, campaignTypeLabels } from "@/types/campaign";

export interface BrandCampaign {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: CampaignType;
  rate_per_thousand: number;
  status: string;
  budget_status?: string;
  start_date: string;
  end_date: string;
  platform?: string;
  platforms?: string[];
  progress?: number;
  totalPaid?: string;
  targetAmount?: string;
  category?: string;
}

export function BrandCampaignCard({
  title,
  description,
  imageUrl,
  type,
  rate_per_thousand,
  status,
  start_date,
  end_date,
  platform,
  platforms = [],
  progress = 0,
  totalPaid = "$0",
  targetAmount = "$0",
  category = "Personal brand",
}: BrandCampaign) {
  const getPlatformIcon = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'youtube':
        return <Youtube className="h-4 w-4 text-red-600" />;
      case 'tiktok':
        return <Globe className="h-4 w-4 text-black dark:text-white" />;
      case 'twitter':
        return <Globe className="h-4 w-4 text-blue-500" />;
      default:
        return <Globe className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const displayPlatforms = platforms.length > 0 ? platforms : (platform ? [platform] : []);

  return (
    <Card className="w-full hover:shadow-md transition-all duration-200 py-2">
      <div className="px-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-10 h-10 flex-shrink-0">
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="object-cover w-full h-full rounded-lg"
                />
              ) : (
                <Target className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
          
          {/* Content Section - Compact Layout */}
          <div className="flex-1 min-w-0">
            {/* Header Row - Title, Description, and Status */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="font-semibold text-base text-foreground truncate">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>
              <Badge 
                variant="outline"
                className={`text-xs ${
                  status === 'active' 
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                    : status === 'draft'
                    ? 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                    : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            
            {/* Progress Bar - Compact */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Budget Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.max(progress, 2)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground min-w-[3rem] text-right">
                  {totalPaid} of {targetAmount}
                </span>
              </div>
            </div>
            
            {/* Campaign Details - Horizontal Compact Layout */}
            <div className="flex items-center gap-6 text-xs mb-4">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-medium">${rate_per_thousand}/1K</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{category}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{campaignTypeLabels[type]}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Platforms:</span>
                <div className="flex gap-1">
                  {displayPlatforms.slice(0, 2).map((platformName, index) => (
                    <div key={index} className="flex items-center">
                      {getPlatformIcon(platformName)}
                    </div>
                  ))}
                  {displayPlatforms.length > 2 && (
                    <span className="text-muted-foreground">+{displayPlatforms.length - 2}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dates - Compact Horizontal */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Started {new Date(start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Ends {new Date(end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
