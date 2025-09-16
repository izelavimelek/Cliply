"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  Save, 
  Edit,
  Target, 
  Shield, 
  Settings, 
  MessageSquare, 
  Eye 
} from "lucide-react";
import { CampaignSectionProps, SectionValidation } from "./types";
import { getContentRequirementsProgress } from "@/lib/campaign-validation";

interface ContentRequirementsProps extends Omit<CampaignSectionProps, 'activeSection'> {
  contentValidation: SectionValidation;
}

export function ContentRequirements({
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
  setActiveSection,
  contentValidation
}: ContentRequirementsProps) {

  // Get content requirements progress from centralized validation
  const contentProgress = getContentRequirementsProgress(campaign);

  return (
    <div className="space-y-6">
      {/* Full Width Top Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 -mx-6 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">Content Requirements</h2>
                  {contentValidation.isCompleted && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </div>
                  )}
                </div>
                <p className="text-base text-muted-foreground mt-1">
                  Define what creators need to include in their submissions and content guidelines
                </p>
              </div>
            </div>
            {contentValidation.isCompleted && (
              <Button 
                onClick={() => setActiveSection('audience-targeting')}
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
            <h3 className="font-semibold text-base">Content Setup Progress</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {contentProgress.completed}/{contentProgress.total} areas completed
              </span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${(contentProgress.completed / contentProgress.total) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content sections with edit/display pattern */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Deliverable Quantity */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Deliverable Quantity</h3>
                  <p className="text-sm text-muted-foreground">Specify how many pieces of content creators need to deliver</p>
                </div>
              </div>
              {editingSection !== 'deliverables' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startEditing('deliverables')}
                  className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'deliverables' ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Content Deliverables
                    </Label>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">At least one required</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clips" className="text-sm font-medium text-foreground">Short Clips (≤60s)</Label>
                      <Input
                        id="clips"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={sectionData.deliverable_quantity?.clips || ''}
                        onChange={(e) => setSectionData(prev => ({
                          ...prev,
                          deliverable_quantity: {
                            ...prev.deliverable_quantity,
                            clips: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        }))}
                        className="text-base p-3 h-10 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="long_videos" className="text-sm font-medium text-foreground">Long Videos (&gt;60s)</Label>
                      <Input
                        id="long_videos"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={sectionData.deliverable_quantity?.long_videos || ''}
                        onChange={(e) => setSectionData(prev => ({
                          ...prev,
                          deliverable_quantity: {
                            ...prev.deliverable_quantity,
                            long_videos: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        }))}
                        className="text-base p-3 h-10 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="images" className="text-sm font-medium text-foreground">Static Images</Label>
                      <Input
                        id="images"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={sectionData.deliverable_quantity?.images || ''}
                        onChange={(e) => setSectionData(prev => ({
                          ...prev,
                          deliverable_quantity: {
                            ...prev.deliverable_quantity,
                            images: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        }))}
                        className="text-base p-3 h-10 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    At least one deliverable type is required. Specify the minimum quantity for each type.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'deliverables'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('deliverables', {
                      deliverable_quantity: sectionData.deliverable_quantity
                    })}
                    disabled={savingSection === 'deliverables' || 
                      (!sectionData.deliverable_quantity?.clips && 
                       !sectionData.deliverable_quantity?.long_videos && 
                       !sectionData.deliverable_quantity?.images)}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'deliverables' ? (
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-base">Short Clips (≤60s)<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                    </div>
                    <p className="text-foreground text-2xl font-semibold">
                      {campaign?.deliverable_quantity?.clips || <span className="text-muted-foreground italic text-base">Not set</span>}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-base">Long Videos (&gt;60s)<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                    </div>
                    <p className="text-foreground text-2xl font-semibold">
                      {campaign?.deliverable_quantity?.long_videos || <span className="text-muted-foreground italic text-base">Not set</span>}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-base">Static Images<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                    </div>
                    <p className="text-foreground text-2xl font-semibold">
                      {campaign?.deliverable_quantity?.images || <span className="text-muted-foreground italic text-base">Not set</span>}
                    </p>
                  </div>
                </div>
                {!campaign?.deliverable_quantity?.clips && !campaign?.deliverable_quantity?.long_videos && !campaign?.deliverable_quantity?.images && (
                  <p className="text-sm text-muted-foreground italic">Click edit to set how many videos, clips, or images creators need to deliver</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Required Elements */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Required Elements</h3>
                  <p className="text-sm text-muted-foreground">Select elements that creators must include in their content</p>
                </div>
              </div>
              {editingSection !== 'required-elements' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startEditing('required-elements')}
                  className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'required-elements' ? (
              <div className="space-y-6">
            {/* Logo Placement */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="logo_placement"
                    checked={sectionData.required_elements?.logo_placement || false}
                    onCheckedChange={(checked) => setSectionData(prev => ({
                      ...prev,
                      required_elements: {
                        ...prev.required_elements,
                        logo_placement: checked as boolean
                      }
                    }))}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="logo_placement" className="text-sm font-medium">
                        Logo Placement Required<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Brand logo must be visible in the content
                    </p>
                  </div>
                </div>
              </div>
              {sectionData.required_elements?.logo_placement && (
                <div className="pl-7 space-y-3 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Logo placement instructions</Label>
                    <Textarea
                      placeholder="e.g., Logo should appear in bottom-right corner, be clearly visible for at least 3 seconds..."
                      value={sectionData.required_elements?.logo_instructions || ''}
                      onChange={(e) => setSectionData(prev => ({
                        ...prev,
                        required_elements: {
                          ...prev.required_elements,
                          logo_instructions: e.target.value
                        }
                      }))}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Logo duration (seconds)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 5"
                      min="1"
                      max="60"
                      value={sectionData.required_elements?.logo_duration || ''}
                      onChange={(e) => setSectionData(prev => ({
                        ...prev,
                        required_elements: {
                          ...prev.required_elements,
                          logo_duration: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Brand Mention */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="brand_mention"
                    checked={sectionData.required_elements?.brand_mention || false}
                    onCheckedChange={(checked) => setSectionData(prev => ({
                      ...prev,
                      required_elements: {
                        ...prev.required_elements,
                        brand_mention: checked as boolean
                      }
                    }))}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="brand_mention" className="text-sm font-medium">
                        Brand Mention Required<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Creator must verbally mention your brand
                    </p>
                  </div>
                </div>
              </div>
              {sectionData.required_elements?.brand_mention && (
                <div className="pl-7 space-y-3 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Specific phrase to mention</Label>
                    <Input
                      placeholder="e.g., 'Thanks to [Brand] for sponsoring this video'"
                      value={sectionData.required_elements?.brand_phrase || ''}
                      onChange={(e) => setSectionData(prev => ({
                        ...prev,
                        required_elements: {
                          ...prev.required_elements,
                          brand_phrase: e.target.value
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">When to mention</Label>
                    <Select
                      value={sectionData.required_elements?.mention_timing || ''}
                      onValueChange={(value) => setSectionData(prev => ({
                        ...prev,
                        required_elements: {
                          ...prev.required_elements,
                          mention_timing: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginning">At the beginning (0-5s)</SelectItem>
                        <SelectItem value="middle">In the middle</SelectItem>
                        <SelectItem value="end">At the end</SelectItem>
                        <SelectItem value="multiple">Multiple times</SelectItem>
                        <SelectItem value="anytime">Anytime during video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="call_to_action"
                    checked={sectionData.required_elements?.call_to_action || false}
                    onCheckedChange={(checked) => setSectionData(prev => ({
                      ...prev,
                      required_elements: {
                        ...prev.required_elements,
                        call_to_action: checked as boolean
                      }
                    }))}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="call_to_action" className="text-sm font-medium">
                        Call-to-Action Required<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Include a specific call-to-action
                    </p>
                  </div>
                </div>
              </div>
              {sectionData.required_elements?.call_to_action && (
                <div className="pl-7 space-y-3 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">CTA Type</Label>
                    <Select
                      value={sectionData.required_elements?.cta_type || ''}
                      onValueChange={(value) => setSectionData(prev => ({
                        ...prev,
                        required_elements: {
                          ...prev.required_elements,
                          cta_type: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select CTA type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visit_website">Visit Website</SelectItem>
                        <SelectItem value="download_app">Download App</SelectItem>
                        <SelectItem value="use_code">Use Discount Code</SelectItem>
                        <SelectItem value="follow_social">Follow Social Media</SelectItem>
                        <SelectItem value="subscribe">Subscribe/Sign Up</SelectItem>
                        <SelectItem value="custom">Custom CTA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">CTA Text/Message</Label>
                    <Textarea
                      placeholder="e.g., 'Visit our website using the link in the description' or 'Use code SAVE20 for 20% off'"
                      value={sectionData.required_elements?.cta_text || ''}
                      onChange={(e) => setSectionData(prev => ({
                        ...prev,
                        required_elements: {
                          ...prev.required_elements,
                          cta_text: e.target.value
                        }
                      }))}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>


            {/* Hashtag Requirements */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="hashtag_requirements"
                    checked={sectionData.required_elements?.hashtag_requirements || false}
                    onCheckedChange={(checked) => setSectionData(prev => ({
                      ...prev,
                      required_elements: {
                        ...prev.required_elements,
                        hashtag_requirements: checked as boolean
                      }
                    }))}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="hashtag_requirements" className="text-sm font-medium">
                        Hashtag Requirements<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Specify required hashtags and hashtag guidelines
                    </p>
                  </div>
                </div>
              </div>
              {sectionData.required_elements?.hashtag_requirements && (
                <div className="pl-7 space-y-3 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Required hashtags</Label>
                    <Input
                      placeholder="e.g., #brandname #sponsored #ad"
                      value={sectionData.required_elements?.required_hashtags || ''}
                      onChange={(e) => setSectionData(prev => ({
                        ...prev,
                        required_elements: {
                          ...prev.required_elements,
                          required_hashtags: e.target.value
                        }
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate hashtags with spaces (include # symbol)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Minimum total hashtags</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 5"
                      min="1"
                      max="30"
                      value={sectionData.required_elements?.min_hashtags || ''}
                      onChange={(e) => setSectionData(prev => ({
                        ...prev,
                        required_elements: {
                          ...prev.required_elements,
                          min_hashtags: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Hashtag placement</Label>
                    <Select
                      value={sectionData.required_elements?.hashtag_placement || ''}
                      onValueChange={(value) => setSectionData(prev => ({
                        ...prev,
                        required_elements: {
                          ...prev.required_elements,
                          hashtag_placement: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select placement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caption">In caption/description</SelectItem>
                        <SelectItem value="video_overlay">Video overlay/text</SelectItem>
                        <SelectItem value="both">Both caption and video</SelectItem>
                        <SelectItem value="any">Creator's choice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Additional hashtag instructions</Label>
                    <Textarea
                      placeholder="e.g., Include trending hashtags relevant to your niche, avoid controversial hashtags..."
                      value={sectionData.required_elements?.hashtag_instructions || ''}
                      onChange={(e) => setSectionData(prev => ({
                        ...prev,
                        required_elements: {
                          ...prev.required_elements,
                          hashtag_instructions: e.target.value
                        }
                      }))}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Requirements */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div>
                  <Label className="text-sm font-medium">Additional Requirements</Label>
                  <p className="text-xs text-muted-foreground">
                    Any other specific requirements for content creation
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Textarea
                  placeholder="e.g., Must show product in use, include unboxing, feature specific benefits, etc."
                  value={sectionData.required_elements?.additional_requirements || ''}
                  onChange={(e) => setSectionData(prev => ({
                    ...prev,
                    required_elements: {
                      ...prev.required_elements,
                      additional_requirements: e.target.value
                    }
                  }))}
                  rows={3}
                />
              </div>
            </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'required-elements'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('required-elements', {
                      required_elements: sectionData.required_elements
                    })}
                    disabled={savingSection === 'required-elements'}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'required-elements' ? (
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
                {/* Display mode - show all required elements with their status */}
                <div className="space-y-3">
                  {/* Logo Placement */}
                  <div 
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.required_elements?.logo_placement 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      console.log('Logo placement clicked');
                      // First open edit mode
                      startEditing('required-elements');
                      // Then immediately set the selection
                      setTimeout(() => {
                        setSectionData(prev => ({
                          ...prev,
                          required_elements: {
                            ...campaign?.required_elements,
                            ...prev.required_elements,
                            logo_placement: true
                          }
                        }));
                      }, 50);
                    }}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                      campaign?.required_elements?.logo_placement 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.required_elements?.logo_placement ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Logo Placement Required<span className="text-red-600 dark:text-red-400 ml-1">*</span></span>
                        {campaign?.required_elements?.logo_placement && (
                          <Badge variant="secondary" className="text-xs">Enabled</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Brand logo must be visible in the content
                      </p>
                      {campaign?.required_elements?.logo_placement && campaign.required_elements.logo_instructions && (
                        <p className="text-sm text-foreground mt-1">{campaign.required_elements.logo_instructions}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Brand Mention */}
                  <div 
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.required_elements?.brand_mention 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      console.log('Brand mention clicked');
                      // First open edit mode
                      startEditing('required-elements');
                      // Then immediately set the selection
                      setTimeout(() => {
                        setSectionData(prev => ({
                          ...prev,
                          required_elements: {
                            ...campaign?.required_elements,
                            ...prev.required_elements,
                            brand_mention: true
                          }
                        }));
                      }, 50);
                    }}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                      campaign?.required_elements?.brand_mention 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.required_elements?.brand_mention ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Brand Mention Required<span className="text-red-600 dark:text-red-400 ml-1">*</span></span>
                        {campaign?.required_elements?.brand_mention && (
                          <Badge variant="secondary" className="text-xs">Enabled</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Creator must verbally mention your brand
                      </p>
                      {campaign?.required_elements?.brand_mention && campaign.required_elements.brand_phrase && (
                        <p className="text-sm text-foreground mt-1">"{campaign.required_elements.brand_phrase}"</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Call to Action */}
                  <div 
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.required_elements?.call_to_action 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      console.log('Call to action clicked');
                      // First open edit mode
                      startEditing('required-elements');
                      // Then immediately set the selection
                      setTimeout(() => {
                        setSectionData(prev => ({
                          ...prev,
                          required_elements: {
                            ...campaign?.required_elements,
                            ...prev.required_elements,
                            call_to_action: true
                          }
                        }));
                      }, 50);
                    }}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                      campaign?.required_elements?.call_to_action 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.required_elements?.call_to_action ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Call-to-Action Required<span className="text-red-600 dark:text-red-400 ml-1">*</span></span>
                        {campaign?.required_elements?.call_to_action && (
                          <Badge variant="secondary" className="text-xs">Enabled</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Include a specific call-to-action
                      </p>
                      {campaign?.required_elements?.call_to_action && campaign.required_elements.cta_text && (
                        <p className="text-sm text-foreground mt-1">{campaign.required_elements.cta_text}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Hashtag Requirements */}
                  <div 
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.required_elements?.hashtag_requirements 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      console.log('Hashtag requirements clicked');
                      // First open edit mode
                      startEditing('required-elements');
                      // Then immediately set the selection
                      setTimeout(() => {
                        setSectionData(prev => ({
                          ...prev,
                          required_elements: {
                            ...campaign?.required_elements,
                            ...prev.required_elements,
                            hashtag_requirements: true
                          }
                        }));
                      }, 50);
                    }}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                      campaign?.required_elements?.hashtag_requirements 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.required_elements?.hashtag_requirements ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Hashtag Requirements<span className="text-red-600 dark:text-red-400 ml-1">*</span></span>
                        {campaign?.required_elements?.hashtag_requirements && (
                          <Badge variant="secondary" className="text-xs">Enabled</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Specify required hashtags and hashtag guidelines
                      </p>
                      <div className="mt-1 space-y-1">
                        {campaign?.required_elements?.hashtag_requirements && campaign.required_elements.required_hashtags && (
                          <p className="text-sm text-foreground">
                            <span className="font-medium">Required:</span> {campaign.required_elements.required_hashtags}
                          </p>
                        )}
                        {campaign?.required_elements?.hashtag_requirements && campaign.required_elements.min_hashtags && (
                          <p className="text-sm text-foreground">
                            <span className="font-medium">Minimum total:</span> {campaign.required_elements.min_hashtags} hashtags
                          </p>
                        )}
                        {campaign?.required_elements?.hashtag_requirements && campaign.required_elements.hashtag_placement && (
                          <p className="text-sm text-foreground">
                            <span className="font-medium">Placement:</span> {
                              campaign.required_elements.hashtag_placement === 'caption' ? 'In caption/description' :
                              campaign.required_elements.hashtag_placement === 'video_overlay' ? 'Video overlay/text' :
                              campaign.required_elements.hashtag_placement === 'both' ? 'Both caption and video' :
                              campaign.required_elements.hashtag_placement === 'any' ? 'Creator\'s choice' :
                              campaign.required_elements.hashtag_placement
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Requirements */}
                  <div 
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.required_elements?.additional_requirements
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      console.log('Additional requirements clicked');
                      // First open edit mode
                      startEditing('required-elements');
                      // Then immediately set the selection
                      setTimeout(() => {
                        setSectionData(prev => ({
                          ...prev,
                          required_elements: {
                            ...campaign?.required_elements,
                            ...prev.required_elements,
                            additional_requirements: campaign?.required_elements?.additional_requirements || ''
                          }
                        }));
                      }, 50);
                    }}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                      campaign?.required_elements?.additional_requirements
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.required_elements?.additional_requirements ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Additional Requirements</span>
                        {campaign?.required_elements?.additional_requirements && (
                          <Badge variant="secondary" className="text-xs">Enabled</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Any other specific requirements for content creation
                      </p>
                      {campaign?.required_elements?.additional_requirements && (
                        <p className="text-sm text-foreground mt-1">{campaign.required_elements.additional_requirements}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prohibited Content */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Prohibited Content</h3>
                  <p className="text-sm text-muted-foreground">Content that creators must avoid in their submissions</p>
                </div>
              </div>
              {editingSection !== 'prohibited-content' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startEditing('prohibited-content')}
                  className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'prohibited-content' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="competitor_brands"
                    checked={sectionData.prohibited_content?.competitor_brands || false}
                    onCheckedChange={(checked) => setSectionData(prev => ({
                      ...prev,
                      prohibited_content: {
                        ...prev.prohibited_content,
                        competitor_brands: checked as boolean
                      }
                    }))}
                  />
                  <Label htmlFor="competitor_brands" className="text-sm">Competitor brands</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="profanity"
                    checked={sectionData.prohibited_content?.profanity || false}
                    onCheckedChange={(checked) => setSectionData(prev => ({
                      ...prev,
                      prohibited_content: {
                        ...prev.prohibited_content,
                        profanity: checked as boolean
                      }
                    }))}
                  />
                  <Label htmlFor="profanity" className="text-sm">Profanity or inappropriate language</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="political"
                    checked={sectionData.prohibited_content?.political || false}
                    onCheckedChange={(checked) => setSectionData(prev => ({
                      ...prev,
                      prohibited_content: {
                        ...prev.prohibited_content,
                        political: checked as boolean
                      }
                    }))}
                  />
                  <Label htmlFor="political" className="text-sm">Political content</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom_prohibited">Custom prohibited content</Label>
                <Textarea
                  id="custom_prohibited"
                  placeholder="List specific content to avoid (e.g., alcohol, gambling, specific topics)"
                  value={sectionData.prohibited_content?.custom?.join(', ') || ''}
                  onChange={(e) => {
                    const custom = e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0);
                    setSectionData(prev => ({
                      ...prev,
                      prohibited_content: {
                        ...prev.prohibited_content,
                        custom: custom
                      }
                    }));
                  }}
                  rows={4}
                />
              </div>
                </div>
            
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'prohibited-content'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('prohibited-content', {
                      prohibited_content: sectionData.prohibited_content
                    })}
                    disabled={savingSection === 'prohibited-content'}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'prohibited-content' ? (
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
                {/* Display mode - show all prohibited content options with their status */}
                <div className="space-y-3">
                  {/* Competitor Brands */}
                  <div 
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.prohibited_content?.competitor_brands 
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/30' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      // Quick toggle - update immediately
                      const newValue = !campaign?.prohibited_content?.competitor_brands;
                      setSectionData(prev => ({
                        ...prev,
                        prohibited_content: {
                          ...prev.prohibited_content,
                          competitor_brands: newValue
                        }
                      }));
                      // Auto-save the selection
                      saveSection('prohibited-content', {
                        prohibited_content: {
                          ...campaign?.prohibited_content,
                          competitor_brands: newValue
                        }
                      });
                    }}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                      campaign?.prohibited_content?.competitor_brands 
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.prohibited_content?.competitor_brands ? (
                        <Shield className="h-3 w-3 text-red-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Competitor brands</span>
                        {campaign?.prohibited_content?.competitor_brands && (
                          <Badge variant="destructive" className="text-xs">Prohibited</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        No competitor brand mentions or references allowed
                      </p>
                    </div>
                  </div>
                  
                  {/* Profanity */}
                  <div 
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.prohibited_content?.profanity 
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/30' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      // Quick toggle - update immediately
                      const newValue = !campaign?.prohibited_content?.profanity;
                      setSectionData(prev => ({
                        ...prev,
                        prohibited_content: {
                          ...prev.prohibited_content,
                          profanity: newValue
                        }
                      }));
                      // Auto-save the selection
                      saveSection('prohibited-content', {
                        prohibited_content: {
                          ...campaign?.prohibited_content,
                          profanity: newValue
                        }
                      });
                    }}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                      campaign?.prohibited_content?.profanity 
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.prohibited_content?.profanity ? (
                        <Shield className="h-3 w-3 text-red-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Profanity or inappropriate language</span>
                        {campaign?.prohibited_content?.profanity && (
                          <Badge variant="destructive" className="text-xs">Prohibited</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        No profanity, inappropriate language, or offensive content
                      </p>
                    </div>
                  </div>
                  
                  {/* Political Content */}
                  <div 
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.prohibited_content?.political 
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/30' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      // Quick toggle - update immediately
                      const newValue = !campaign?.prohibited_content?.political;
                      setSectionData(prev => ({
                        ...prev,
                        prohibited_content: {
                          ...prev.prohibited_content,
                          political: newValue
                        }
                      }));
                      // Auto-save the selection
                      saveSection('prohibited-content', {
                        prohibited_content: {
                          ...campaign?.prohibited_content,
                          political: newValue
                        }
                      });
                    }}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                      campaign?.prohibited_content?.political 
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.prohibited_content?.political ? (
                        <Shield className="h-3 w-3 text-red-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Political content</span>
                        {campaign?.prohibited_content?.political && (
                          <Badge variant="destructive" className="text-xs">Prohibited</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        No political statements, endorsements, or controversial topics
                      </p>
                    </div>
                  </div>
                  
                  {/* Custom Prohibited Content */}
                  <div 
                    className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.prohibited_content?.custom && campaign.prohibited_content.custom.length > 0
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/30' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => startEditing('prohibited-content')}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full mt-0.5 ${
                      campaign?.prohibited_content?.custom && campaign.prohibited_content.custom.length > 0
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.prohibited_content?.custom && campaign.prohibited_content.custom.length > 0 ? (
                        <Shield className="h-3 w-3 text-red-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Custom prohibited content</span>
                  {campaign?.prohibited_content?.custom && campaign.prohibited_content.custom.length > 0 && (
                          <Badge variant="destructive" className="text-xs">Prohibited</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Specific content types to avoid (alcohol, gambling, etc.)
                      </p>
                      {campaign?.prohibited_content?.custom && campaign.prohibited_content.custom.length > 0 && (
                        <p className="text-sm text-foreground mt-1">{campaign.prohibited_content.custom.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tone & Style */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Tone & Style Guidelines</h3>
                  <p className="text-sm text-muted-foreground">Define the desired tone and style for content creation</p>
                </div>
              </div>
              {editingSection !== 'tone-style' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startEditing('tone-style')}
                  className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'tone-style' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tone_style">Content Tone & Style</Label>
                  <Select 
                    value={sectionData.tone_style || ''} 
                    onValueChange={(value) => setSectionData(prev => ({ ...prev, tone_style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the desired tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fun">Fun & Playful</SelectItem>
                      <SelectItem value="professional">Professional & Corporate</SelectItem>
                      <SelectItem value="educational">Educational & Informative</SelectItem>
                      <SelectItem value="cinematic">Cinematic & Artistic</SelectItem>
                      <SelectItem value="casual">Casual & Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'tone-style'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('tone-style', {
                      tone_style: sectionData.tone_style
                    })}
                    disabled={savingSection === 'tone-style'}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'tone-style' ? (
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
                {/* Display mode - show all tone options with current selection */}
                <div className="space-y-3">
                  {[
                    { value: 'fun', label: 'Fun & Playful', description: 'Lighthearted, energetic, and entertaining content' },
                    { value: 'professional', label: 'Professional & Corporate', description: 'Formal, business-focused, and authoritative tone' },
                    { value: 'educational', label: 'Educational & Informative', description: 'Informative, instructional, and knowledge-sharing content' },
                    { value: 'cinematic', label: 'Cinematic & Artistic', description: 'High-quality, visually stunning, and creative content' },
                    { value: 'casual', label: 'Casual & Conversational', description: 'Relaxed, friendly, and conversational tone' }
                  ].map((tone) => (
                    <div 
                      key={tone.value} 
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                        campaign?.tone_style === tone.value 
                          ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                          : 'bg-muted/30 border-border hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        // Quick selection - update immediately
                        setSectionData(prev => ({ ...prev, tone_style: tone.value }));
                        // Auto-save the selection
                        saveSection('tone-style', { tone_style: tone.value });
                      }}
                    >
                      <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                        campaign?.tone_style === tone.value 
                          ? 'bg-primary/20' 
                          : 'bg-muted'
                      }`}>
                        {campaign?.tone_style === tone.value ? (
                          <Settings className="h-3 w-3 text-primary" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tone.label}</span>
                          {campaign?.tone_style === tone.value && (
                            <Badge variant="secondary" className="text-xs">Selected</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{tone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Music & Audio Guidelines */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Music & Audio Guidelines</h3>
                  <p className="text-sm text-muted-foreground">Specify audio requirements and music preferences</p>
                </div>
              </div>
              {editingSection !== 'music-audio' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startEditing('music-audio')}
                  className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'music-audio' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="music_guidelines">Music & Audio Instructions</Label>
                  <Textarea
                    id="music_guidelines"
                    placeholder="e.g., Use upbeat music, no copyright music, background music volume should be low enough for voiceover, etc."
                    value={sectionData.music_guidelines || ''}
                    onChange={(e) => setSectionData(prev => ({ ...prev, music_guidelines: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'music-audio'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('music-audio', {
                      music_guidelines: sectionData.music_guidelines
                    })}
                    disabled={savingSection === 'music-audio'}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'music-audio' ? (
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
                {/* Display mode - show music guidelines status */}
                <div className="space-y-3">
                  <div 
                    className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.music_guidelines 
                        ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => startEditing('music-audio')}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full mt-0.5 ${
                      campaign?.music_guidelines 
                        ? 'bg-primary/20' 
                        : 'bg-muted'
                    }`}>
                {campaign?.music_guidelines ? (
                        <MessageSquare className="h-3 w-3 text-primary" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Music & Audio Guidelines</span>
                        {campaign?.music_guidelines && (
                          <Badge variant="secondary" className="text-xs">Configured</Badge>
                        )}
                  </div>
                      <p className="text-xs text-muted-foreground">
                        Specify audio requirements, music preferences, and sound guidelines
                      </p>
                      {campaign?.music_guidelines && (
                        <p className="text-sm text-foreground mt-1">{campaign.music_guidelines}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Example References */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Example References</h3>
                  <p className="text-sm text-muted-foreground">Provide URLs to examples that creators can reference</p>
                </div>
              </div>
              {editingSection !== 'example-references' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startEditing('example-references')}
                  className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'example-references' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="example_references">Example URLs</Label>
                  <Textarea
                    id="example_references"
                    placeholder="Enter URLs separated by new lines (e.g., https://youtube.com/watch?v=example1)"
                    value={sectionData.example_references?.join('\n') || ''}
                    onChange={(e) => {
                      const references = e.target.value.split('\n').map(url => url.trim()).filter(url => url.length > 0);
                      setSectionData(prev => ({
                        ...prev,
                        example_references: references
                      }));
                    }}
                    rows={4}
                    className="text-base p-3 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter one URL per line. Include links to brand videos, competitor examples, or style references.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'example-references'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('example-references', {
                      example_references: sectionData.example_references
                    })}
                    disabled={savingSection === 'example-references'}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'example-references' ? (
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
                {/* Display mode - show example references status */}
                <div className="space-y-3">
                  <div 
                    className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.example_references && campaign.example_references.length > 0
                        ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => startEditing('example-references')}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full mt-0.5 ${
                      campaign?.example_references && campaign.example_references.length > 0
                        ? 'bg-primary/20' 
                        : 'bg-muted'
                    }`}>
                {campaign?.example_references && campaign.example_references.length > 0 ? (
                        <Eye className="h-3 w-3 text-primary" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Example References</span>
                        {campaign?.example_references && campaign.example_references.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {campaign.example_references.length} {campaign.example_references.length === 1 ? 'reference' : 'references'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Provide URLs to examples that creators can reference for inspiration
                      </p>
                      {campaign?.example_references && campaign.example_references.length > 0 && (
                        <div className="mt-2 space-y-1">
                    {campaign.example_references.map((url, index) => (
                            <div key={index} className="p-2 bg-background rounded border">
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-primary hover:text-primary/80 underline break-all"
                        >
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* General Requirements & Rules */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">7</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">General Requirements & Rules</h3>
                  <p className="text-sm text-muted-foreground">Additional requirements, specifications, and campaign guidelines</p>
                </div>
              </div>
              {editingSection !== 'general-requirements' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startEditing('general-requirements')}
                  className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'general-requirements' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="requirements" className="text-sm font-medium text-foreground">Additional Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="e.g., Must feature product in first 3 seconds, include website URL in description, minimum 1080p quality..."
                      value={sectionData.requirements || ''}
                      onChange={(e) => setSectionData(prev => ({ ...prev, requirements: e.target.value }))}
                      rows={6}
                      className="text-base p-3 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rules" className="text-sm font-medium text-foreground">Rules & Guidelines</Label>
                    <Textarea
                      id="rules"
                      placeholder="e.g., Content must be original, submissions due 48h before campaign end, no stock footage allowed..."
                      value={sectionData.rules || ''}
                      onChange={(e) => setSectionData(prev => ({ ...prev, rules: e.target.value }))}
                      rows={6}
                      className="text-base p-3 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'general-requirements'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('general-requirements', {
                      requirements: sectionData.requirements,
                      rules: sectionData.rules
                    })}
                    disabled={savingSection === 'general-requirements'}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'general-requirements' ? (
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
                {/* Display mode - show all general requirements options with their status */}
                  <div className="space-y-3">
                  {/* Additional Requirements */}
                  <div 
                    className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.requirements 
                        ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => startEditing('general-requirements')}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full mt-0.5 ${
                      campaign?.requirements 
                        ? 'bg-primary/20' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.requirements ? (
                        <FileText className="h-3 w-3 text-primary" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                        </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Additional Requirements</span>
                        {campaign?.requirements && (
                          <Badge variant="secondary" className="text-xs">Configured</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Technical specifications, quality standards, and specific content requirements
                      </p>
                      {campaign?.requirements && (
                        <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{campaign.requirements}</p>
                      )}
                        </div>
                      </div>
                  
                  {/* Rules & Guidelines */}
                  <div 
                    className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      campaign?.rules 
                        ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/30' 
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                    onClick={() => startEditing('general-requirements')}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full mt-0.5 ${
                      campaign?.rules 
                        ? 'bg-orange-100 dark:bg-orange-900/30' 
                        : 'bg-muted'
                    }`}>
                      {campaign?.rules ? (
                        <Shield className="h-3 w-3 text-orange-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Rules & Guidelines</span>
                        {campaign?.rules && (
                          <Badge variant="outline" className="text-xs text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">Configured</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Campaign rules, submission guidelines, and compliance requirements
                      </p>
                      {campaign?.rules && (
                        <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{campaign.rules}</p>
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
  );
}
