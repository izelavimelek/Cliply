"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Save, CheckCircle, Upload, X } from "lucide-react";
import Link from "next/link";
import { useCampaignValidation } from "@/hooks/useCampaignValidation";

// This ensures the page takes up the full viewport
export const dynamic = 'force-dynamic';

const campaignFormSchema = z.object({
  title: z.string().min(1, "Campaign title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  platforms: z.array(z.enum(["youtube", "tiktok", "instagram", "linkedin"])).min(1, "At least one platform must be selected"),
  thumbnail: z.string().optional(), // Base64 encoded image
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

export default function NewCampaignPage() {
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [stepError, setStepError] = useState<string>("");
  const router = useRouter();
  
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      platforms: ["youtube"],
      thumbnail: "",
    },
  });

  // Use validation hook with current form values
  const currentFormData = form.watch();
  const { sectionStatus, completionCount } = useCampaignValidation(currentFormData);
  
  // Calculate progress based on required fields
  const calculateProgress = () => {
    const title = form.watch("title");
    const description = form.watch("description");
    const platforms = form.watch("platforms");
    
    let completed = 0;
    const total = 3; // title, description, platforms
    
    if (title && title.trim().length > 0) completed++;
    if (description && description.trim().length >= 10) completed++;
    if (platforms && platforms.length > 0) completed++;
    
    return { completed, total, percentage: (completed / total) * 100 };
  };
  
  const progress = calculateProgress();

  // Map form steps to validation sections
  const stepValidationMap = {
    1: 'campaign-overview' as const
  };

  // Validate step 1 - Campaign Overview (title, description, platforms only)
  const validateStep1 = async (): Promise<boolean> => {
    const isValid = await form.trigger(['title', 'description', 'platforms']);
    if (!isValid) {
      const errors = form.formState.errors;
      const errorMessages: string[] = [];
      
      if (errors.title) errorMessages.push(errors.title.message || "Campaign title is required");
      if (errors.description) errorMessages.push(errors.description.message || "Campaign description is required");
      if (errors.platforms) errorMessages.push(errors.platforms.message || "Please select at least one platform");
      
      setStepError(errorMessages.join(", "));
      return false;
    }
    return true;
  };



  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setValue("thumbnail", result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    form.setValue("thumbnail", "");
  };

  // Debug form state
  const formValues = form.watch();
  console.log("Form values:", formValues);
  console.log("Form errors:", form.formState.errors);

  const onSubmit = async (values: CampaignFormData) => {
    setSaving(true);
    try {
      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const campaignData = {
        ...values,
        platform: values.platforms[0], // For backward compatibility
        created_at: new Date().toISOString(),
        status: "draft", // Set status to draft when creating
      };

      console.log("Sending campaign data:", campaignData);

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(campaignData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        const errorMessage = errorData.error || errorData.message || `HTTP ${res.status}: Failed to create campaign`;
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log("Campaign created successfully:", result);
      
      // Dispatch custom event to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('campaign-created', { 
        detail: { campaign: result } 
      }));
      
      // Redirect to dashboard (campaigns list) after successful creation
      if (result && result.id) {
        router.push("/brand/campaigns");
      } else {
        console.error("No campaign ID returned from API:", result);
        alert("Campaign created but couldn't redirect. Please check your campaigns list.");
        router.push("/brand/campaigns");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      let errorMessage = "Error creating campaign";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = (error as any).message || (error as any).error || JSON.stringify(error);
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (platform: "youtube" | "tiktok" | "instagram" | "linkedin") => {
    const currentPlatforms = form.watch("platforms");
    if (currentPlatforms.includes(platform)) {
      if (currentPlatforms.length > 1) {
        form.setValue("platforms", currentPlatforms.filter(p => p !== platform));
      }
    } else {
      form.setValue("platforms", [...currentPlatforms, platform]);
    }
  };

  const handleCreateCampaign = async () => {
    const isValid = await validateStep1();
    
    if (isValid) {
      setStepError(""); // Clear any previous errors
      // Submit the form directly
      form.handleSubmit(onSubmit)();
    }
  };

  const renderStepContent = () => {
        return (
          <div className="space-y-8">
            {/* Question */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <h2 className="text-3xl font-bold text-foreground">
                  What type of campaign are you creating?
                </h2>

              </div>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Choose one or more platforms that best fit your campaign goals and target audience
              </p>
            </div>

            {/* Platform Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                {
                  id: "youtube",
                  icon: "🎥",
                  title: "YouTube",
                  description: "Video content and tutorials",
                  color: "from-red-50 to-red-100 dark:from-red-950 dark:to-red-900",
                  borderColor: "border-red-200 dark:border-red-800"
                },
                {
                  id: "tiktok",
                  icon: "🎵",
                  title: "TikTok",
                  description: "Short-form viral content",
                  color: "from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900",
                  borderColor: "border-gray-200 dark:border-gray-800"
                },
                {
                  id: "instagram",
                  icon: "📸",
                  title: "Instagram",
                  description: "Visual storytelling and photos",
                  color: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
                  borderColor: "border-purple-200 dark:border-purple-800"
                },
                {
                  id: "linkedin",
                  icon: "💼",
                  title: "LinkedIn",
                  description: "Professional networking content",
                  color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
                  borderColor: "border-blue-200 dark:border-blue-800"
                }
              ].map((platform) => {
                const isSelected = form.watch("platforms").includes(platform.id as "youtube" | "tiktok" | "instagram" | "linkedin");
                return (
                  <Card 
                    key={platform.id}
                    className={`cursor-pointer transition-all duration-200 hover:scale-102 border-2 ${
                      isSelected
                        ? "border-green-500 shadow-md ring-2 ring-green-500/20" 
                        : "border-border hover:border-border/60"
                    } bg-card hover:shadow-md`}
                    onClick={() => togglePlatform(platform.id as "youtube" | "tiktok" | "instagram" | "linkedin")}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl mb-2">{platform.icon}</div>
                      <h3 className="text-sm font-semibold mb-1 text-card-foreground">{platform.title}</h3>
                      <p className="text-xs text-muted-foreground">{platform.description}</p>
                      {isSelected && (
                        <div className="mt-2">
                          <div className="w-4 h-4 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Campaign Details Form */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="space-y-4">
                {/* Campaign Title Box */}
                <Card className={`border shadow-sm ${
                  form.formState.errors.title 
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700' 
                    : form.watch("title") && form.watch("title").trim().length > 0
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700'
                    : 'bg-card border-border'
                }`}>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="title" className="text-base font-medium text-card-foreground">Campaign Title</Label>
                        {form.watch("title") && form.watch("title").trim().length > 0 && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <Input
                        id="title"
                        placeholder="Enter a compelling campaign title"
                        className={`text-base p-2 h-10 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors ${
                          form.formState.errors.title ? 'border-red-300 focus:border-red-500' : 'border-border focus:border-primary'
                        }`}
                        {...form.register("title")}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Campaign Description Box */}
                <Card className={`border shadow-sm ${
                  form.formState.errors.description 
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700' 
                    : form.watch("description") && form.watch("description").trim().length >= 10
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700'
                    : 'bg-card border-border'
                }`}>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="description" className="text-base font-medium text-card-foreground">Campaign Description</Label>
                        {form.watch("description") && form.watch("description").trim().length >= 10 && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <Textarea
                        id="description"
                        placeholder="Describe your campaign goals, target audience, and what you're looking for from creators"
                        rows={3}
                        className={`text-base p-2 border bg-background focus:ring-2 focus:ring-primary/20 transition-colors resize-none ${
                          form.formState.errors.description ? 'border-red-300 focus:border-red-500' : 'border-border focus:border-primary'
                        }`}
                        {...form.register("description")}
                      />
                      <div className="text-xs text-muted-foreground">
                        {form.watch("description") ? form.watch("description").length : 0}/10 characters minimum
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Campaign Thumbnail Upload */}
                <Card className="bg-card border border-border shadow-sm">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-card-foreground">Campaign Thumbnail (optional)</Label>
                      
                      {!imagePreview ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Upload an image for your campaign thumbnail
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            PNG, JPG up to 5MB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('thumbnail-upload')?.click()}
                          >
                            Choose Image
                          </Button>
                          <input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Campaign thumbnail preview"
                              className="w-32 h-32 object-cover rounded-lg border border-border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                              onClick={removeImage}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {selectedImage?.name} ({selectedImage ? (selectedImage.size / 1024 / 1024).toFixed(2) : '0'} MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Create Campaign Button */}
            <div className="text-center">
              <Button 
                onClick={handleCreateCampaign} 
                size="lg" 
                className="px-12 py-3 text-lg h-14 font-semibold"
                disabled={saving || progress.completed < progress.total}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                    Creating Campaign...
                  </>
                ) : (
                  <>
                    <Save className="mr-3 h-5 w-5" />
                    Create Campaign
                  </>
                )}
              </Button>
            </div>
          </div>
        );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setStepError("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [stepError]);

  useEffect(() => {
    setStepError(""); // Clear errors when step changes
  }, [step]);

  return (
    <>
      <style jsx global>{`
        body {
          overflow: hidden;
        }
        #__next {
          height: 100vh;
          width: 100vw;
        }
      `}</style>
      <div className="fixed inset-0 bg-background overflow-y-auto z-50 w-screen h-screen">
        {/* Header */}
        <div className="bg-background border-b border-border sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div className="grid grid-cols-4 gap-4 items-center">
              {/* Back Button - 25% */}
              <div className="col-span-1">
                <Link href="/brand/campaigns">
                  <Button variant="ghost" size="lg" className="flex items-center gap-2 text-base">
                    <ArrowLeft className="h-5 w-5" />
                    Back to Campaigns
                  </Button>
                </Link>
              </div>
              
              {/* Progress Bar - 50% */}
              <div className="col-span-2 flex justify-center items-center">
                                  <div className="flex items-center gap-3">
                    <div className="w-80 bg-muted rounded-full h-6 border border-border dark:border-border">
                      <div 
                        className={`h-6 rounded-full transition-all duration-500 ${
                          progress.completed === progress.total 
                            ? 'bg-green-500' 
                            : 'bg-primary'
                        }`}
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {progress.completed} of {progress.total} fields completed
                    </span>
                  </div>
              </div>
              
              {/* Step Indicator - 25% */}
              <div className="col-span-1 flex justify-end items-center gap-2">
              </div>
            </div>
            
            {/* Dark Mode Toggle - Top Right */}
            <div className="absolute top-6 right-8">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {renderStepContent()}
        </div>

        {/* Error Popup - Bottom Right */}
        {stepError && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg shadow-lg border border-red-200 dark:border-red-800/50 max-w-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 bg-red-400 dark:bg-red-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Please fix the following:</p>
                  <p className="text-sm mt-1 opacity-90">{stepError}</p>
                </div>
                <button
                  onClick={() => setStepError("")}
                  className="flex-shrink-0 ml-2 text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
