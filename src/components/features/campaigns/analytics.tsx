"use client";

import { BarChart3 } from "lucide-react";
import { CampaignSectionProps } from "./types";

interface AnalyticsProps extends Omit<CampaignSectionProps, 'activeSection'> {}

export function Analytics({
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
}: AnalyticsProps) {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-2xl font-bold">
            Campaign Analytics
          </h2>
        </div>
      </div>
      
      <div className="text-center py-8">
        <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Analytics dashboard will be implemented here</p>
      </div>
    </div>
  );
}
