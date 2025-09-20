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
  UserCheck, 
  ArrowRight, 
  CheckCircle, 
  Save, 
  Edit,
  Target, 
  Globe, 
  Languages, 
  Calendar,
  Users,
  Heart,
  MapPin
} from "lucide-react";
import { CampaignSectionProps, SectionValidation } from "./types";
import { getAudienceTargetingProgress } from "@/lib/campaign-validation";

interface AudienceTargetingProps extends Omit<CampaignSectionProps, 'activeSection'> {
  audienceValidation: SectionValidation;
}

export function AudienceTargeting({
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
  audienceValidation
}: AudienceTargetingProps) {

  // Get audience targeting progress from centralized validation
  const audienceProgress = getAudienceTargetingProgress(campaign);

  return (
    <div className="space-y-6">
      {/* Full Width Top Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 -mx-6 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">Audience Targeting</h2>
                  {audienceValidation.isCompleted && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </div>
                  )}
                </div>
                <p className="text-base text-muted-foreground mt-1">
                  Define your target audience demographics and preferences for campaign optimization
                </p>

              </div>
            </div>
            {audienceValidation.isCompleted && (
              <Button 
                onClick={() => setActiveSection('assets')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="text-sm font-medium">Next: Assets</span>
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
            <h3 className="font-semibold text-base">Audience Setup Progress</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {audienceProgress.completed}/{audienceProgress.total} mandatory areas completed
              </span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${(audienceProgress.completed / audienceProgress.total) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Audience sections with edit/display pattern */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Geography / Regions - MANDATORY */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Geography / Regions</h3>
                  <p className="text-sm text-muted-foreground">Target specific countries, states, or regions</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'geography' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="geography" className="text-sm font-medium text-foreground">Target Regions<span className="text-red-600 dark:text-red-400 ml-1">*</span></Label>
                  </div>
                  <Textarea
                    id="geography"
                    placeholder="Enter countries, states, or regions separated by commas (e.g., United States, California, New York, Canada, United Kingdom)"
                    value={sectionData.target_geography?.join(', ') || ''}
                    onChange={(e) => {
                      const regions = e.target.value.split(',').map(region => region.trim()).filter(region => region.length > 0);
                      setSectionData(prev => ({
                        ...prev,
                        target_geography: regions
                      }));
                    }}
                    rows={3}
                    className="text-base p-3 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    Specify the geographic areas where your target audience is located. This helps creators understand where their content should resonate.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'geography'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('geography', {
                      target_geography: sectionData.target_geography
                    })}
                    disabled={savingSection === 'geography' || !sectionData.target_geography || sectionData.target_geography.length === 0}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'geography' ? (
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
              <div 
                className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border space-y-4"
                onClick={() => startEditing('geography')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-base">Target Regions<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                  <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {campaign?.target_geography && campaign.target_geography.length > 0 ? (
                  <div className="flex flex-wrap gap-2 group-hover:text-primary transition-colors">
                    {campaign.target_geography.map((region, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 group-hover:bg-primary/20 transition-colors">
                        <MapPin className="h-3 w-3" />
                        {region}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic group-hover:text-primary transition-colors">Click to specify target geographic regions</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Languages - MANDATORY */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Language(s)</h3>
                  <p className="text-sm text-muted-foreground">Primary languages for your target audience</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'languages' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="languages" className="text-sm font-medium text-foreground">Target Languages<span className="text-red-600 dark:text-red-400 ml-1">*</span></Label>
                  </div>
                  <Select
                    value={sectionData.target_languages?.[0] || ''}
                    onValueChange={(value) => setSectionData(prev => ({
                      ...prev,
                      target_languages: value ? [value] : []
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Portuguese">Portuguese</SelectItem>
                      <SelectItem value="Russian">Russian</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Korean">Korean</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Turkish">Turkish</SelectItem>
                      <SelectItem value="Dutch">Dutch</SelectItem>
                      <SelectItem value="Swedish">Swedish</SelectItem>
                      <SelectItem value="Norwegian">Norwegian</SelectItem>
                      <SelectItem value="Danish">Danish</SelectItem>
                      <SelectItem value="Finnish">Finnish</SelectItem>
                      <SelectItem value="Polish">Polish</SelectItem>
                      <SelectItem value="Czech">Czech</SelectItem>
                      <SelectItem value="Hungarian">Hungarian</SelectItem>
                      <SelectItem value="Romanian">Romanian</SelectItem>
                      <SelectItem value="Bulgarian">Bulgarian</SelectItem>
                      <SelectItem value="Greek">Greek</SelectItem>
                      <SelectItem value="Hebrew">Hebrew</SelectItem>
                      <SelectItem value="Thai">Thai</SelectItem>
                      <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                      <SelectItem value="Indonesian">Indonesian</SelectItem>
                      <SelectItem value="Malay">Malay</SelectItem>
                      <SelectItem value="Filipino">Filipino</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Specify the primary languages your target audience speaks. This helps creators understand what language to use in their content.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'languages'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('languages', {
                      target_languages: sectionData.target_languages
                    })}
                    disabled={savingSection === 'languages' || !sectionData.target_languages || sectionData.target_languages.length === 0}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'languages' ? (
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
              <div 
                className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border space-y-4"
                onClick={() => startEditing('languages')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-base">Target Languages<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                  <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {campaign?.target_languages && campaign.target_languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2 group-hover:text-primary transition-colors">
                    {campaign.target_languages.map((language, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 group-hover:bg-primary/20 transition-colors">
                        <Languages className="h-3 w-3" />
                        {language}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic group-hover:text-primary transition-colors">Click to specify target languages</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Age Range - MANDATORY */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Age Range</h3>
                  <p className="text-sm text-muted-foreground">Target age demographics for your campaign</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'age-range' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="min_age" className="text-sm font-medium text-foreground">Minimum Age<span className="text-red-600 dark:text-red-400 ml-1">*</span></Label>
                    </div>
                    <Input
                      id="min_age"
                      type="number"
                      min="13"
                      max="100"
                      placeholder="e.g., 18"
                      value={sectionData.target_age_range?.min || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : null;
                        setSectionData(prev => ({
                          ...prev,
                          target_age_range: {
                            min: value || 0,
                            max: prev.target_age_range?.max || 0
                          }
                        }));
                      }}
                      className="text-base p-3 h-10 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="max_age" className="text-sm font-medium text-foreground">Maximum Age<span className="text-red-600 dark:text-red-400 ml-1">*</span></Label>
                    </div>
                    <Input
                      id="max_age"
                      type="number"
                      min="13"
                      max="100"
                      placeholder="e.g., 35"
                      value={sectionData.target_age_range?.max || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : null;
                        setSectionData(prev => ({
                          ...prev,
                          target_age_range: {
                            min: prev.target_age_range?.min || 0,
                            max: value || 0
                          }
                        }));
                      }}
                      className="text-base p-3 h-10 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Define the age range of your target audience. This helps creators understand the demographic they should target.
                </p>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'age-range'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('age-range', {
                      target_age_range: sectionData.target_age_range
                    })}
                    disabled={savingSection === 'age-range' || !sectionData.target_age_range?.min || !sectionData.target_age_range?.max}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'age-range' ? (
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
              <div 
                className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border space-y-4"
                onClick={() => startEditing('age-range')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-base">Target Age Range<span className="text-red-600 dark:text-red-400 ml-1">*</span></h4>
                  <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {campaign?.target_age_range?.min && campaign?.target_age_range?.max ? (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-medium group-hover:text-primary transition-colors">Target Age Range: </span>
                      <span className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {campaign.target_age_range.min} - {campaign.target_age_range.max} years old
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic group-hover:text-primary transition-colors">Click to set the target age range</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gender - OPTIONAL */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Gender</h3>
                  <p className="text-sm text-muted-foreground">Target gender demographics (optional)</p>
                  <Badge variant="outline" className="mt-1">Optional</Badge>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'gender' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-foreground">Target Gender</Label>
                  <Select
                    value={sectionData.target_gender || ''}
                    onValueChange={(value) => setSectionData(prev => ({ ...prev, target_gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non_binary">Non-Binary</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {sectionData.target_gender === 'custom' && (
                    <Input
                      placeholder="Describe your custom gender targeting"
                      value=""
                      onChange={(e) => {}}
                      className="mt-2"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Specify if you want to target a specific gender demographic. Leave as "All Genders" for broader targeting.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'gender'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('gender', {
                      target_gender: sectionData.target_gender
                    })}
                    disabled={savingSection === 'gender'}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'gender' ? (
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
              <div 
                className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border space-y-4"
                onClick={() => startEditing('gender')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-base">Target Gender</h4>
                  <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {campaign?.target_gender ? (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-medium group-hover:text-primary transition-colors">Target Gender: </span>
                      <span className="capitalize group-hover:text-primary transition-colors">
                        {campaign.target_gender === 'all' && 'All Genders'}
                        {campaign.target_gender === 'male' && 'Male'}
                        {campaign.target_gender === 'female' && 'Female'}
                        {campaign.target_gender === 'non_binary' && 'Non-Binary'}
                        {campaign.target_gender === 'custom' ? 'Custom' : ''}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic group-hover:text-primary transition-colors">Click to specify gender targeting (optional)</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audience Interests - OPTIONAL */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Audience Interests</h3>
                  <p className="text-sm text-muted-foreground">Hobbies, interests, and lifestyle preferences</p>
                  <Badge variant="outline" className="mt-1">Optional</Badge>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'interests' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interests" className="text-sm font-medium text-foreground">Interest Tags</Label>
                  <Textarea
                    id="interests"
                    placeholder="Enter interests separated by commas (e.g., fitness, travel, cooking, gaming, fashion, technology, sports, music)"
                    value={sectionData.audience_interests?.join(', ') || ''}
                    onChange={(e) => {
                      const interests = e.target.value.split(',').map(interest => interest.trim()).filter(interest => interest.length > 0);
                      setSectionData(prev => ({
                        ...prev,
                        audience_interests: interests
                      }));
                    }}
                    rows={4}
                    className="text-base p-3 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add interest tags that describe your target audience's hobbies, lifestyle, and preferences. This helps creators understand what content themes will resonate.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'interests'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('interests', {
                      audience_interests: sectionData.audience_interests
                    })}
                    disabled={savingSection === 'interests'}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'interests' ? (
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
              <div 
                className="cursor-pointer group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border space-y-4"
                onClick={() => startEditing('interests')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-base">Audience Interests</h4>
                  <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {campaign?.audience_interests && campaign.audience_interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {campaign.audience_interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 group-hover:bg-primary/20 transition-colors">
                        <Heart className="h-3 w-3" />
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic group-hover:text-primary transition-colors">Click to add audience interest tags (optional)</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      

    </div>
  );
}
