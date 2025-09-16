"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Edit, CheckCircle, Save, X } from "lucide-react";
import { CampaignSectionProps } from "./types";
import { getAgreementsComplianceProgress } from "@/lib/campaign-validation";

interface AgreementsComplianceProps extends Omit<CampaignSectionProps, 'activeSection'> {}

export function AgreementsCompliance({
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
}: AgreementsComplianceProps) {

  // Get agreements compliance progress from centralized validation
  const complianceProgress = getAgreementsComplianceProgress(campaign);

  return (
    <div className="space-y-6">
      {/* Full Width Top Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 -mx-6 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">Agreements & Compliance</h2>
                  {complianceProgress.completed === complianceProgress.total && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </div>
                  )}
                </div>
                <p className="text-base text-muted-foreground mt-1">
                  Set usage rights and legal requirements for your campaign
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Progress Section */}
      <div className="-mx-6 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base">Compliance Setup Progress</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {complianceProgress.completed}/{complianceProgress.total} areas completed
              </span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${(complianceProgress.completed / complianceProgress.total) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Usage Rights */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Usage Rights</h3>
                  <p className="text-sm text-muted-foreground">Define how creators can use your brand content</p>
                </div>
              </div>
              {editingSection !== 'usage-rights' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startEditing('usage-rights')}
                  className="hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'usage-rights' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-foreground">Usage Rights</Label>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">Required</span>
                    </div>
                  </div>
                  <Select
                    value={sectionData.usage_rights || ''}
                    onValueChange={(value) => setSectionData(prev => ({
                      ...prev,
                      usage_rights: value as 'organic_only' | 'ads_allowed' | 'full_commercial'
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select usage rights" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organic_only">Organic Only - No paid promotion</SelectItem>
                      <SelectItem value="ads_allowed">Ads Allowed - Can use in paid ads</SelectItem>
                      <SelectItem value="full_commercial">Full Commercial - Any commercial use</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Specify how creators can use your brand content and any restrictions
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'usage-rights'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('usage-rights', {
                      usage_rights: sectionData.usage_rights
                    })}
                    disabled={savingSection === 'usage-rights' || !sectionData.usage_rights || sectionData.usage_rights.length === 0}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'usage-rights' ? (
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
                {campaign?.usage_rights ? (
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <p className="text-sm font-medium">
                        {campaign.usage_rights === 'organic_only' && 'Organic Only - No paid promotion'}
                        {campaign.usage_rights === 'ads_allowed' && 'Ads Allowed - Can use in paid ads'}
                        {campaign.usage_rights === 'full_commercial' && 'Full Commercial - Any commercial use'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Click edit to specify usage rights</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exclusivity Settings */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Exclusivity Settings</h3>
                  <p className="text-sm text-muted-foreground">Set exclusivity requirements for creators</p>
                </div>
              </div>
              {editingSection !== 'exclusivity' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startEditing('exclusivity')}
                  className="hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'exclusivity' ? (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="exclusivity_enabled"
                      checked={sectionData.exclusivity?.enabled || false}
                      onCheckedChange={(checked) => setSectionData(prev => ({
                        ...prev,
                        exclusivity: {
                          ...prev.exclusivity,
                          enabled: checked as boolean
                        }
                      }))}
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="exclusivity_enabled" className="text-sm font-medium">
                        Require Exclusivity
                      </Label>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {sectionData.exclusivity?.enabled && (
                    <div className="pl-7 space-y-4 border-l-2 border-primary/20">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="category_exclusive"
                          checked={sectionData.exclusivity?.category_exclusive || false}
                          onCheckedChange={(checked) => setSectionData(prev => ({
                            ...prev,
                            exclusivity: {
                              ...prev.exclusivity,
                              category_exclusive: checked as boolean
                            }
                          }))}
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="category_exclusive" className="text-sm font-medium">
                            Category Exclusivity
                          </Label>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                      

                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'exclusivity'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('exclusivity', {
                      exclusivity: sectionData.exclusivity
                    })}
                    disabled={savingSection === 'exclusivity' || sectionData.exclusivity?.enabled === undefined}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'exclusivity' ? (
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
                {campaign?.exclusivity ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Exclusivity:</span>
                      <span className={campaign.exclusivity.enabled ? "text-green-600" : "text-muted-foreground"}>
                        {campaign.exclusivity.enabled ? "Required" : "Not Required"}
                      </span>
                    </div>

                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Click edit to configure exclusivity settings</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legal Confirmations */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Legal Confirmations</h3>
                  <p className="text-sm text-muted-foreground">Confirm compliance with platform and legal requirements</p>
                </div>
              </div>
              {editingSection !== 'legal-confirmations' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => startEditing('legal-confirmations')}
                  className="hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {editingSection === 'legal-confirmations' ? (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="platform_compliant"
                      checked={sectionData.legal_confirmations?.platform_compliant || false}
                      onCheckedChange={(checked) => setSectionData(prev => ({
                        ...prev,
                        legal_confirmations: {
                          ...prev.legal_confirmations,
                          platform_compliant: checked as boolean
                        }
                      }))}
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="platform_compliant" className="text-sm font-medium">
                        Platform Compliance
                      </Label>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    Confirm that your campaign complies with all platform guidelines and terms of service
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="no_unlicensed_assets"
                      checked={sectionData.legal_confirmations?.no_unlicensed_assets || false}
                      onCheckedChange={(checked) => setSectionData(prev => ({
                        ...prev,
                        legal_confirmations: {
                          ...prev.legal_confirmations,
                          no_unlicensed_assets: checked as boolean
                        }
                      }))}
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="no_unlicensed_assets" className="text-sm font-medium">
                        No Unlicensed Assets
                      </Label>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">
                    Confirm that you have rights to all assets and content used in this campaign
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={cancelEditing}
                    disabled={savingSection === 'legal-confirmations'}
                    className="hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => saveSection('legal-confirmations', {
                      legal_confirmations: sectionData.legal_confirmations
                    })}
                    disabled={savingSection === 'legal-confirmations' || 
                      !sectionData.legal_confirmations?.platform_compliant || 
                      !sectionData.legal_confirmations?.no_unlicensed_assets}
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {savingSection === 'legal-confirmations' ? (
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
                {campaign?.legal_confirmations ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Platform Compliance:</span>
                      <span className={campaign.legal_confirmations.platform_compliant ? "text-green-600" : "text-red-600"}>
                        {campaign.legal_confirmations.platform_compliant ? "Confirmed" : "Not Confirmed"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">No Unlicensed Assets:</span>
                      <span className={campaign.legal_confirmations.no_unlicensed_assets ? "text-green-600" : "text-red-600"}>
                        {campaign.legal_confirmations.no_unlicensed_assets ? "Confirmed" : "Not Confirmed"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Click edit to complete legal confirmations</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
