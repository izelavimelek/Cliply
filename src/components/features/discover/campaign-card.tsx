"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignType } from "@/types/campaign";
import { Instagram, Youtube } from "lucide-react";

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: CampaignType;
  budget: string;
  requirements?: string[];
  deadline?: string;
  status?: string;
  reward?: string;
  category?: string;
  platforms?: string[];
  progress?: number;
  totalPaid?: string;
  targetAmount?: string;
}

export function CampaignCard({
  title,
  description,
  imageUrl,
  type,
  budget,
  requirements,
  deadline,
  status = "Active",
  reward = "$3.00 / 1K",
  category = "Personal brand",
  platforms = ["Instagram", "YouTube"],
  progress = 100,
  totalPaid = "$7,481.29",
  targetAmount = "$7,481.29",
}: Campaign) {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Status Header */}
      <div className="bg-muted px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">
          {status} 1
        </span>
      </div>
      
      {/* Main Content - Horizontal Layout */}
      <div className="px-4 py-2">
        <div className="flex gap-4">
          {/* Thumbnail Image */}
          <div className="flex-shrink-0">
            <div className="w-20 h-32 bg-muted rounded-lg overflow-hidden">
              <img
                src={imageUrl || "/placeholder.jpg"}
                alt={title}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          
          {/* Content Section */}
          <div className="flex-1 space-y-3">
            {/* Campaign Title */}
            <h3 className="font-semibold text-base leading-tight text-foreground">
              {title}
            </h3>
            
            {/* Payment Progress */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {totalPaid} of {targetAmount} paid out
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-warning rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {progress}%
                </span>
              </div>
            </div>
            
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Reward</div>
                <Badge className="bg-brand-blue hover:bg-brand-blue-hover text-white text-xs px-2 py-1">
                  {reward}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Category</div>
                <div className="text-sm font-medium text-foreground">{category}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="text-sm font-medium text-foreground">{type}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Platforms</div>
                <div className="flex gap-2">
                  {platforms.map((platform, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {getPlatformIcon(platform)}
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
