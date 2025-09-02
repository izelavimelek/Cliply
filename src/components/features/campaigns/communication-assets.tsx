"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Edit } from "lucide-react";
import { CampaignSectionProps } from "./types";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Communication
          </h2>
          <p className="text-muted-foreground mt-1">Manage communication with creators</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => startEditing('communication-assets')}>
            <Edit className="h-4 w-4 mr-2" />Edit
          </Button>
        </div>
      </div>
      
      <div className="text-center py-8">
        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Communication features will be implemented here</p>
      </div>
    </div>
  );
}
