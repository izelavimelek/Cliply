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
    <Card className="w-full border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md">
      <div className="p-6">
        <div className="flex gap-4">
          {/* Minimal Icon */}
          <div className="w-12 h-12 flex-shrink-0">
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="object-cover w-full h-full rounded-lg"
                />
              ) : (
                <Target className="h-6 w-6 text-gray-500" />
              )}
            </div>
          </div>
          
          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Header Row - Title and Status */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                  {description}
                </p>
              </div>
              <Badge 
                variant={status === 'active' ? 'default' : 'secondary'}
                className={`text-xs px-2 py-1 ${
                  status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                    : status === 'draft'
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            
            {/* Progress Section - Minimal */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>Budget Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-gray-900 dark:bg-white transition-all duration-300"
                    style={{ width: `${Math.max(progress, 2)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[4rem] text-right">
                  {totalPaid} of {targetAmount}
                </span>
              </div>
            </div>
            
            {/* Campaign Details - Minimal Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Rate</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">${rate_per_thousand}/1K</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Category</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{category}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {campaignTypeLabels[type]}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Platforms</div>
                  <div className="flex gap-1">
                    {displayPlatforms.slice(0, 2).map((platformName, index) => (
                      <div key={index} className="flex items-center">
                        {getPlatformIcon(platformName)}
                      </div>
                    ))}
                    {displayPlatforms.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">+{displayPlatforms.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates - Minimal */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Started {new Date(start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Ends {new Date(end_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
