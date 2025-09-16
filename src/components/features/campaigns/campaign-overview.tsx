"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowRight, CheckCircle, Edit, Save } from "lucide-react";
import { FaYoutube, FaTiktok, FaInstagram, FaTwitter } from "react-icons/fa";
import { CampaignSectionProps, SectionValidation } from "./types";
import { useSectionFormValidation } from "@/hooks/useCampaignValidation";
import { getCampaignOverviewProgress } from "@/lib/campaign-validation";

interface CampaignOverviewProps extends Omit<CampaignSectionProps, 'activeSection'> {
  overviewValidation: SectionValidation;
  completionCount: { completed: number; total: number };
}

export function CampaignOverview({
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
  overviewValidation,
  completionCount
}: CampaignOverviewProps) {

  // Get campaign overview progress from centralized validation
  const overviewProgress = getCampaignOverviewProgress(campaign);

  return (
    <div className="space-y-6">
      {/* Full Width Top Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 -mx-6 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">Campaign Overview</h2>
                  {overviewValidation.isCompleted && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </div>
                  )}
                </div>
                <p className="text-base text-muted-foreground mt-1">
                  Set up the core details that will help creators understand and connect with your campaign
                </p>
              </div>
            </div>
            {overviewValidation.isCompleted && (
              <Button 
                onClick={() => setActiveSection('budget-timeline')}
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
            <h3 className="font-semibold text-base">Campaign Overview Progress</h3>
            <span className="text-sm text-muted-foreground">
              {overviewProgress.completed}/{overviewProgress.total} areas completed
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(overviewProgress.completed / overviewProgress.total) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          {/* Campaign Basics */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Campaign Basics</h3>
                    <p className="text-sm text-muted-foreground">Essential information about your campaign</p>
                  </div>
                </div>
                {editingSection !== 'campaign-basics' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => startEditing('campaign-basics')}
                    className="hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              {editingSection === 'campaign-basics' ? (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  {/* Campaign Title */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="title" className="text-sm font-bold text-foreground">
                        Campaign Title<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <Input
                      id="title"
                      value={sectionData.title || ''}
                      onChange={(e) => setSectionData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Summer Collection Launch, Product Review Campaign, Brand Awareness Drive"
                      maxLength={100}
                      className={`transition-all duration-300 ${overviewValidation.getFieldStyle(!sectionData.title || (sectionData.title?.length || 0) < 5)} focus:ring-2 focus:ring-offset-0 hover:border-primary/50`}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        Make it clear and appealing to attract the right creators
                      </p>
                      <span className={`text-xs font-medium ${
                        (sectionData.title || '').length >= 80 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'
                      }`}>
                        {(sectionData.title || '').length}/100
                      </span>
                    </div>
                  </div>

                  {/* Campaign Description */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="description" className="text-sm font-bold text-foreground">
                        Campaign Description<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <Textarea
                      id="description"
                      value={sectionData.description || ''}
                      onChange={(e) => setSectionData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what your campaign is about, what you're promoting, and what you want creators to showcase..."
                      maxLength={500}
                      rows={4}
                      className={`transition-all duration-300 resize-none ${overviewValidation.getFieldStyle(!sectionData.description || (sectionData.description?.length || 0) < 10)} focus:ring-2 focus:ring-offset-0 hover:border-primary/50`}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        Explain your goals, target audience, and key messages
                      </p>
                      <span className={`text-xs font-medium ${
                        (sectionData.description || '').length >= 400 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'
                      }`}>
                        {(sectionData.description || '').length}/500
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      onClick={cancelEditing}
                      disabled={savingSection === 'campaign-basics'}
                      className="hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => saveSection('campaign-basics', {
                        title: sectionData.title,
                        description: sectionData.description
                      })}
                      disabled={savingSection === 'campaign-basics' || !sectionData.title || !sectionData.description}
                      className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {savingSection === 'campaign-basics' ? (
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
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-base">Campaign Title<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                      </div>
                      <p className="text-foreground">
                        {campaign?.title || <span className="text-muted-foreground italic">Click edit to set title</span>}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-base">Description<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {campaign?.description || <span className="text-muted-foreground italic">Click edit to set description</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Targeting */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Campaign Targeting</h3>
                    <p className="text-sm text-muted-foreground">Define your campaign's focus and reach</p>
                  </div>
                </div>
                {editingSection !== 'campaign-targeting' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => startEditing('campaign-targeting')}
                    className="hover:bg-primary/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              {editingSection === 'campaign-targeting' ? (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  {/* Campaign Objective */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="objective" className="text-sm font-bold text-foreground">
                        Campaign Objective<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <Select 
                      value={sectionData.objective || ''} 
                      onValueChange={(value) => setSectionData(prev => ({ ...prev, objective: value }))}
                    >
                      <SelectTrigger className={`transition-all duration-300 ${
                        !sectionData.objective 
                          ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20' 
                          : 'border-border hover:border-primary/50'
                      } focus:ring-2 focus:ring-offset-0`}>
                        <SelectValue placeholder="Select your campaign's primary goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Brand Awareness</SelectItem>
                        <SelectItem value="engagement">Community Engagement</SelectItem>
                        <SelectItem value="conversions">Drive Conversions</SelectItem>
                        <SelectItem value="ugc">User-Generated Content</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This helps creators understand what kind of content will work best
                    </p>
                  </div>

                  {/* Platform Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-bold text-foreground">
                        Target Platforms<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { 
                          id: 'youtube', 
                          name: 'YouTube', 
                          icon: <FaYoutube className="w-5 h-5 text-red-600" />
                        },
                        { 
                          id: 'tiktok', 
                          name: 'TikTok', 
                          icon: <FaTiktok className="w-5 h-5 text-black dark:text-white" />
                        },
                        { 
                          id: 'instagram', 
                          name: 'Instagram', 
                          icon: <FaInstagram className="w-5 h-5 text-pink-600" />
                        },
                        { 
                          id: 'twitter', 
                          name: 'Twitter/X', 
                          icon: <FaTwitter className="w-5 h-5 text-blue-500" />
                        }
                      ].map((platform) => (
                        <div key={platform.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={platform.id}
                            checked={sectionData.platforms?.includes(platform.id) || false}
                            onCheckedChange={(checked) => {
                              const currentPlatforms = sectionData.platforms || [];
                              const newPlatforms = checked
                                ? [...currentPlatforms, platform.id]
                                : currentPlatforms.filter(p => p !== platform.id);
                              setSectionData(prev => ({ ...prev, platforms: newPlatforms }));
                            }}
                          />
                          <Label htmlFor={platform.id} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                            {platform.icon}
                            {platform.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select where you want your content to appear
                    </p>
                  </div>

                  {/* Campaign Category */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="category" className="text-sm font-bold text-foreground">
                        Campaign Category<span className="text-red-600 dark:text-red-400 ml-1">*</span>
                      </Label>
                    </div>
                    <Select 
                      value={sectionData.category || ''} 
                      onValueChange={(value) => setSectionData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className={`transition-all duration-300 ${
                        !sectionData.category 
                          ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20' 
                          : 'border-border hover:border-primary/50'
                      } focus:ring-2 focus:ring-offset-0`}>
                        <SelectValue placeholder="Select your industry/niche" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="fashion">Fashion & Beauty</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="fitness">Health & Fitness</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="business">Business & Finance</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This helps match your campaign with creators in your industry
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      onClick={cancelEditing}
                      disabled={savingSection === 'campaign-targeting'}
                      className="hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => saveSection('campaign-targeting', {
                        objective: sectionData.objective,
                        platforms: sectionData.platforms,
                        category: sectionData.category
                      })}
                      disabled={savingSection === 'campaign-targeting' || !sectionData.objective || !sectionData.platforms?.length || !sectionData.category}
                      className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {savingSection === 'campaign-targeting' ? (
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
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-base">Objective<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                      </div>
                      <p className="text-foreground">
                        {campaign?.objective ? (
                          <Badge variant="secondary" className="capitalize">
                            {campaign.objective.replace('_', ' ')}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground italic">Click edit to select objective</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-base">Platforms<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {campaign?.platforms?.length ? (
                          campaign.platforms.map(platform => (
                            <Badge key={platform} variant="outline" className="capitalize">
                              {platform}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground italic">Click edit to select platforms</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-base">Category<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                      </div>
                      <p className="text-foreground">
                        {campaign?.category ? (
                          <Badge variant="outline" className="capitalize">
                            {campaign.category.replace('_', ' ')}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground italic">Click edit to select category</span>
                        )}
                      </p>
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
