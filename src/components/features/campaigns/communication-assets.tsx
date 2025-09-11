"use client";

import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Get brand ID from campaign data
    if (campaign.brand_id) {
      setBrandId(campaign.brand_id);
    }
  }, [campaign]);

  return (
    <div className="space-y-6">
      {/* Full Width Top Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 -mx-6 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Communication</h2>
                <p className="text-base text-muted-foreground mt-1">
                  Manage announcements and communicate with creators
                </p>
              </div>
            </div>
            {brandId && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pr-6">
        {brandId ? (
          <AnnouncementFeed 
            campaignId={campaignId} 
            brandId={brandId} 
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Loading brand information...</p>
          </div>
        )}
      </div>
    </div>
  );
}
