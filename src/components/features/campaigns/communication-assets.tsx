"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Edit } from "lucide-react";
import { CampaignSectionProps } from "./types";
import { AnnouncementFeed } from "./announcement-feed";
import { useState, useEffect } from "react";

interface CommunicationAssetsProps extends Omit<CampaignSectionProps, 'activeSection'> {}

export function CommunicationAssets({
  campaign,
  campaignId,
  sectionData,
  setSectionData,
  editingSection,
  setEditingSection,
  savingSection,
  saveSection,
  startEditing,
  cancelEditing,
  setActiveSection
}: CommunicationAssetsProps) {
  const [brandId, setBrandId] = useState<string | null>(null);

  useEffect(() => {
    // Get brand ID from campaign data
    if (campaign.brand_id) {
      setBrandId(campaign.brand_id);
    }
  }, [campaign]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-2xl font-bold">
            Communication
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage announcements and communicate with creators
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => startEditing('communication-assets')}>
            <Edit className="h-4 w-4 mr-2" />Edit
          </Button>
        </div>
      </div>
      
      {brandId ? (
        <AnnouncementFeed campaignId={campaignId} brandId={brandId} />
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Loading brand information...</p>
        </div>
      )}
    </div>
  );
}
