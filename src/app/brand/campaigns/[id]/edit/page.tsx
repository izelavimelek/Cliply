"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Save, 
  Target, 
  DollarSign, 
  Calendar, 
  FileText, 
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

const campaignEditSchema = z.object({
  title: z.string().min(1, "Campaign title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  platform: z.enum(["youtube", "tiktok", "instagram"]),
  rate_per_thousand: z.number().min(0.01, "Rate must be greater than 0"),
  total_budget: z.number().min(10, "Budget must be at least $10"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  rules: z.string().optional(),
  requirements: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "completed"]),
});

type CampaignFormData = z.infer<typeof campaignEditSchema>;

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  platform: string;
  rate_per_thousand: number;
  total_budget: number;
  budget_spent: number;
  start_date: string;
  end_date: string;
  rules?: string;
  requirements?: string;
  tags?: string;
  created_at: string;
  brand_id: string;
}

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const campaignId = params.id as string;

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignEditSchema),
    defaultValues: {
      title: "",
      description: "",
      platform: "youtube",
      rate_per_thousand: 10,
      total_budget: 1000,
      start_date: "",
      end_date: "",
      rules: "",
      requirements: "",
      tags: "",
      status: "draft",
    },
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`);
        if (res.ok) {
          const campaignData = await res.json();
          setCampaign(campaignData);
          
          // Set form values
          form.reset({
            title: campaignData.title || "",
            description: campaignData.description || "",
            platform: campaignData.platform || "youtube",
            rate_per_thousand: campaignData.rate_per_thousand || 10,
            total_budget: campaignData.total_budget || 1000,
            start_date: campaignData.start_date ? campaignData.start_date.split('T')[0] : "",
            end_date: campaignData.end_date ? campaignData.end_date.split('T')[0] : "",
            rules: campaignData.rules || "",
            requirements: campaignData.requirements || "",
            tags: campaignData.tags || "",
            status: campaignData.status || "draft",
          });
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId, form]);

  const onSubmit = async (values: CampaignFormData) => {
    setSaving(true);
    setSaveStatus('saving');
    
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update campaign");
      }

      setSaveStatus('success');
      setCampaign(prev => prev ? { ...prev, ...values } : null);
      
      // Show success message briefly then redirect
      setTimeout(() => {
        router.push(`/brand/campaigns/${campaignId}`);
      }, 1500);
      
    } catch (error) {
      console.error("Error updating campaign:", error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return '🎥';
      case 'tiktok': return '🎵';
      case 'instagram': return '📸';
      default: return '📱';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">The campaign you're trying to edit doesn't exist or has been removed.</p>
          <Link href="/brand/campaigns">
            <Button>Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/brand/campaigns/${campaignId}`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Campaign
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{getPlatformIcon(campaign.platform)}</span>
            <h1 className="text-3xl font-bold">Edit Campaign</h1>
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Modify your campaign details and settings</p>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <Card className={`mb-6 border-2 ${
          saveStatus === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800' :
          saveStatus === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800' :
          'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {saveStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {saveStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {saveStatus === 'saving' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
              <span className={`font-medium ${
                saveStatus === 'success' ? 'text-green-800 dark:text-green-200' :
                saveStatus === 'error' ? 'text-red-800 dark:text-red-200' :
                'text-blue-800 dark:text-blue-200'
              }`}>
                {saveStatus === 'success' && 'Campaign updated successfully! Redirecting...'}
                {saveStatus === 'error' && 'Failed to update campaign. Please try again.'}
                {saveStatus === 'saving' && 'Saving changes...'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="budget">Budget & Timeline</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
                <CardDescription>
                  Basic information about your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter a compelling campaign title"
                      {...form.register("title")}
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform *</Label>
                    <Select onValueChange={(value) => form.setValue("platform", value as "youtube" | "tiktok" | "instagram")} value={form.watch("platform")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">🎥 YouTube</SelectItem>
                        <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                        <SelectItem value="instagram">📸 Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your campaign goals, target audience, and what you're looking for from creators"
                    rows={4}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget & Timeline
                </CardTitle>
                <CardDescription>
                  Set your campaign budget and schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rate_per_thousand">Rate per 1000 views ($) *</Label>
                    <Input
                      id="rate_per_thousand"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="10.00"
                      {...form.register("rate_per_thousand", { valueAsNumber: true })}
                    />
                    {form.formState.errors.rate_per_thousand && (
                      <p className="text-sm text-destructive">{form.formState.errors.rate_per_thousand.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_budget">Total Budget ($) *</Label>
                    <Input
                      id="total_budget"
                      type="number"
                      step="0.01"
                      min="10"
                      placeholder="1000.00"
                      {...form.register("total_budget", { valueAsNumber: true })}
                    />
                    {form.formState.errors.total_budget && (
                      <p className="text-sm text-destructive">{form.formState.errors.total_budget.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      {...form.register("start_date")}
                    />
                    {form.formState.errors.start_date && (
                      <p className="text-sm text-destructive">{form.formState.errors.start_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      {...form.register("end_date")}
                    />
                    {form.formState.errors.end_date && (
                      <p className="text-sm text-destructive">{form.formState.errors.end_date.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Requirements & Rules
                </CardTitle>
                <CardDescription>
                  Define what creators need to follow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="requirements">Content Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Specific requirements for content (length, format, hashtags, etc.)"
                    rows={3}
                    {...form.register("requirements")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rules">Campaign Rules & Guidelines</Label>
                  <Textarea
                    id="rules"
                    placeholder="Any specific rules, content guidelines, or constraints creators should follow"
                    rows={3}
                    {...form.register("rules")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas (e.g., fashion, lifestyle, beauty)"
                    {...form.register("tags")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Campaign Settings
                </CardTitle>
                <CardDescription>
                  Control campaign status and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Campaign Status</Label>
                  <Select onValueChange={(value) => form.setValue("status", value as "draft" | "active" | "paused" | "completed")} value={form.watch("status")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">⚪ Draft - Not visible to creators</SelectItem>
                      <SelectItem value="active">🟢 Active - Visible and accepting submissions</SelectItem>
                      <SelectItem value="paused">🟡 Paused - Temporarily stopped</SelectItem>
                      <SelectItem value="completed">🔵 Completed - Campaign finished</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Changing status to "Active" will make your campaign visible to creators
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Campaign Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Campaign ID:</span>
                      <p className="font-mono">{campaign.id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p>{new Date(campaign.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Brand ID:</span>
                      <p className="font-mono">{campaign.brand_id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Budget Spent:</span>
                      <p className="font-medium">${campaign.budget_spent?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 border-t">
          <Link href={`/brand/campaigns/${campaignId}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          
          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
