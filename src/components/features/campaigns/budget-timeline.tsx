"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowRight, CheckCircle, Edit, Save } from "lucide-react";
import { CampaignSectionProps, SectionValidation } from "./types";
import { getBudgetTimelineProgress } from "@/lib/campaign-validation";

interface BudgetTimelineProps extends Omit<CampaignSectionProps, 'activeSection'> {
  budgetValidation: SectionValidation;
}

export function BudgetTimeline({
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
}: BudgetTimelineProps) {

  // Get budget & timeline progress from centralized validation
  const budgetProgress = getBudgetTimelineProgress(campaign);
  const budgetFieldsCompleted = budgetProgress.completed;

  return (
    <div className="space-y-6">
      {/* Full Width Top Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 -mx-6 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">Budget & Timeline</h2>
                  {budgetFieldsCompleted === 5 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </div>
                  )}
                </div>
                <p className="text-base text-muted-foreground mt-1">
                  Set your campaign budget and define key dates for creators
                </p>
              </div>
            </div>
            {budgetFieldsCompleted === 5 && (
              <Button 
                onClick={() => setActiveSection('content-requirements')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="text-sm font-medium">Next Step</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Full Width Progress Section */}
      <div className="-mx-6 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base">Budget & Timeline Progress</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {budgetFieldsCompleted}/5 areas completed
              </span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${(budgetFieldsCompleted / 5) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          {/* Timeline Configuration */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Timeline Configuration</h3>
                    <p className="text-sm text-muted-foreground">Set key dates for your campaign</p>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              {editingSection === 'timeline-config' ? (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  {/* Campaign Start Date */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="start_date" className="text-sm font-bold text-foreground">
                        Campaign Start Date<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <Input
                      id="start_date"
                      type="date"
                      value={sectionData.start_date || ''}
                      onChange={(e) => setSectionData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                    <p className="text-xs text-muted-foreground">
                      When creators can start discovering and working on your campaign
                    </p>
                  </div>

                  {/* Campaign End Date */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="end_date" className="text-sm font-bold text-foreground">
                        Campaign End Date<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <Input
                      id="end_date"
                      type="date"
                      value={sectionData.end_date || ''}
                      onChange={(e) => setSectionData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                    <p className="text-xs text-muted-foreground">
                      When the campaign officially ends and no new submissions are accepted
                    </p>
                  </div>

                  {/* Submission Deadline */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="submission_deadline" className="text-sm font-bold text-foreground">
                        Submission Deadline<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <Input
                      id="submission_deadline"
                      type="date"
                      value={sectionData.submission_deadline || ''}
                      onChange={(e) => setSectionData(prev => ({ ...prev, submission_deadline: e.target.value }))}
                      className="border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                    <p className="text-xs text-muted-foreground">
                      When creators must submit their content (before campaign end)
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      onClick={cancelEditing}
                      disabled={savingSection === 'timeline-config'}
                      className="hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => saveSection('timeline-config', {
                        start_date: sectionData.start_date,
                        end_date: sectionData.end_date,
                        submission_deadline: sectionData.submission_deadline
                      })}
                      disabled={savingSection === 'timeline-config' || !sectionData.start_date || !sectionData.end_date || !sectionData.submission_deadline}
                      className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {savingSection === 'timeline-config' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Clickable Start Date */}
                    <div 
                      className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border"
                      onClick={() => startEditing('timeline-config')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-base">Start Date<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                        <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-foreground group-hover:text-primary transition-colors">
                        {campaign?.start_date ? (
                          new Date(campaign.start_date).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground italic">Click to set start date</span>
                        )}
                      </p>
                    </div>
                    
                    {/* Clickable End Date */}
                    <div 
                      className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border"
                      onClick={() => startEditing('timeline-config')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-base">End Date<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                        <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-foreground group-hover:text-primary transition-colors">
                        {campaign?.end_date ? (
                          new Date(campaign.end_date).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground italic">Click to set end date</span>
                        )}
                      </p>
                    </div>
                    
                    {/* Clickable Submission Deadline */}
                    <div 
                      className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border"
                      onClick={() => startEditing('timeline-config')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-base">Submission Deadline<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                        <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-foreground group-hover:text-primary transition-colors">
                        {campaign?.submission_deadline ? (
                          new Date(campaign.submission_deadline).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground italic">Click to set deadline</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Configuration */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Budget Configuration</h3>
                    <p className="text-sm text-muted-foreground">Set your spending limits and payment structure</p>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              {editingSection === 'budget-config' ? (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  {/* Total Budget */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="total_budget" className="text-sm font-bold text-foreground">
                        Total Campaign Budget<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                        $
                      </span>
                      <Input
                        id="total_budget"
                        type="number"
                        value={sectionData.total_budget || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          setSectionData(prev => ({ ...prev, total_budget: value }));
                        }}
                        placeholder="10000"
                        min="1"
                        step="0.01"
                        className="pl-8 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The maximum amount you're willing to spend on this campaign
                    </p>
                  </div>

                  {/* Rate Type */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-bold text-foreground">
                        Payment Structure
                      </Label>
                    </div>
                    <Select 
                      value={sectionData.rate_type || ''} 
                      onValueChange={(value) => setSectionData(prev => ({ ...prev, rate_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose how you want to pay creators" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_thousand">Per 1,000 Views</SelectItem>
                        <SelectItem value="fixed_fee">Fixed Fee per Creator</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Base + Performance)</SelectItem>
                        <SelectItem value="commission">Commission Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This determines how creators will be compensated for their content
                    </p>
                  </div>

                  {/* Rate Amount */}
                  {sectionData.rate_type && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-bold text-foreground">
                          {sectionData.rate_type === 'per_thousand' ? 'Rate per 1,000 Views' : 
                           sectionData.rate_type === 'fixed_fee' ? 'Fixed Fee Amount' : 'Rate Amount'}
                        </Label>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">Required</span>
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                          $
                        </span>
                        <Input
                          type="number"
                          value={sectionData.rate_type === 'per_thousand' ? sectionData.rate_per_thousand || '' : sectionData.fixed_fee || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined;
                            if (sectionData.rate_type === 'per_thousand') {
                              setSectionData(prev => ({ ...prev, rate_per_thousand: value }));
                            } else {
                              setSectionData(prev => ({ ...prev, fixed_fee: value }));
                            }
                          }}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="pl-8 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {sectionData.rate_type === 'per_thousand' ? 'Amount per 1,000 views' : 
                         sectionData.rate_type === 'fixed_fee' ? 'Fixed amount per creator' : 'Rate amount'}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      onClick={cancelEditing}
                      disabled={savingSection === 'budget-config'}
                      className="hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => saveSection('budget-config', {
                        total_budget: sectionData.total_budget,
                        rate_type: sectionData.rate_type,
                        rate_per_thousand: sectionData.rate_per_thousand,
                        fixed_fee: sectionData.fixed_fee
                      })}
                      disabled={savingSection === 'budget-config' || !sectionData.total_budget || !sectionData.rate_type || 
                        (sectionData.rate_type === 'per_thousand' && (!sectionData.rate_per_thousand || sectionData.rate_per_thousand <= 0)) ||
                        (sectionData.rate_type === 'fixed_fee' && (!sectionData.fixed_fee || sectionData.fixed_fee <= 0))}
                      className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {savingSection === 'budget-config' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Clickable Total Budget */}
                    <div 
                      className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border"
                      onClick={() => startEditing('budget-config')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-base">Total Budget<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                        <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-foreground group-hover:text-primary transition-colors">
                        {campaign?.total_budget ? `$${campaign.total_budget.toLocaleString()}` : (
                          <span className="text-muted-foreground italic">Click to set budget</span>
                        )}
                      </p>
                    </div>
                    
                    {/* Clickable Payment Type */}
                    <div 
                      className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border"
                      onClick={() => startEditing('budget-config')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-base">Payment Type<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                        <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="group-hover:text-primary transition-colors">
                        {campaign?.rate_type ? (
                          <Badge variant="secondary" className="capitalize">
                            {campaign.rate_type.replace('_', ' ')}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground italic">Click to set type</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Clickable Rate */}
                    <div 
                      className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border"
                      onClick={() => startEditing('budget-config')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-base">Rate<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                        <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="group-hover:text-primary transition-colors">
                        {campaign?.rate_per_thousand ? (
                          <p className="text-foreground group-hover:text-primary transition-colors">
                            ${campaign.rate_per_thousand.toFixed(2)}
                            {campaign.rate_type === 'per_thousand' ? ' per 1K views' : ''}
                          </p>
                        ) : campaign?.fixed_fee ? (
                          <p className="text-foreground group-hover:text-primary transition-colors">
                            ${campaign.fixed_fee.toFixed(2)} per creator
                          </p>
                        ) : (
                          <span className="text-muted-foreground italic">Click to set rate</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
