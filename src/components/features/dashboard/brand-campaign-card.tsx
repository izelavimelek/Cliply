"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, Target } from "lucide-react";
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
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const displayPlatforms = platforms.length > 0 ? platforms : (platform ? [platform] : []);

  return (
    <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Main Content - Redesigned Layout */}
      <div className="p-2 px-6">
        <div className="flex gap-4">
          {/* Thumbnail Image - 12% of card width */}
          <div className="w-[12%] flex-shrink-0">
            <div className="w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          
          {/* Content Section - 88% of card width */}
          <div className="w-[88%] min-w-0">
            {/* Header Row - Title and Status */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-base leading-tight text-foreground line-clamp-2 flex-1 pr-3">
                {title}
              </h3>
              <Badge 
                variant={
                  status === 'active' ? 'default' : 
                  status === 'pending_budget' ? 'destructive' : 
                  status === 'paused' ? 'secondary' : 
                  'outline'
                }
                className="text-xs flex-shrink-0"
              >
                {status === 'pending_budget' ? 'Pending Budget' : status}
              </Badge>
            </div>
            
            {/* Progress Section */}
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-2">
                {totalPaid} of {targetAmount} paid out
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(progress, 1)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground min-w-[2.5rem]">
                  {progress}%
                </span>
              </div>
            </div>
            
            {/* Campaign Details - Horizontal Row Layout with Stacked Labels/Values */}
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs font-medium text-muted-foreground">Reward</span>
                <Badge className="bg-brand-blue hover:bg-brand-blue-hover text-white text-sm px-3 py-1">
                  ${rate_per_thousand}/1K
                </Badge>
              </div>
              
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs font-medium text-muted-foreground">Category</span>
                <span className="text-sm font-medium text-foreground">{category}</span>
              </div>
              
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs font-medium text-muted-foreground">Type</span>
                <span className="text-sm font-medium text-foreground">
                  {campaignTypeLabels[type]}
                </span>
              </div>
              
              <div className="flex flex-col items-start gap-1">
                <span className="text-xs font-medium text-muted-foreground">Platforms</span>
                <div className="flex gap-2">
                  {displayPlatforms.map((platformName, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {getPlatformIcon(platformName)}
                  </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
