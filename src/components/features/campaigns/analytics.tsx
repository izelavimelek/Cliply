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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Campaign Analytics
          </h2>
          <p className="text-muted-foreground mt-1">Track performance metrics and insights</p>
        </div>
      </div>
      
      <div className="text-center py-8">
        <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Analytics dashboard will be implemented here</p>
      </div>
    </div>
  );
}
