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
      {/* Full Width Top Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 -mx-6 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Campaign Analytics</h2>
                <p className="text-base text-muted-foreground mt-1">
                  Track performance and measure campaign success
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center py-8">
        <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Analytics dashboard will be implemented here</p>
      </div>
    </div>
  );
}
