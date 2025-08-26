"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { 
  Target, 
  DollarSign, 
  FileText, 
  UserCheck, 
  Shield, 
  Users, 
  BarChart3, 
  MessageSquare,
  Edit,
  Play,
  Pause,
  Menu,
  X,
  Globe,
  CheckCircle,
  Upload,
  Camera
} from "lucide-react";
import { useCampaignValidation, useSectionFormValidation } from "@/hooks/useCampaignValidation";
import { getDetailedValidationErrors } from "@/lib/campaign-validation";
import {
  CampaignOverview,
  BudgetTimeline,
  ContentRequirements,
  AudienceTargeting,
  Submissions,
  Analytics,
  CommunicationAssets,
  Campaign,
  Submission
} from "@/components/features/campaigns";

export default function CampaignDetailPage() {
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('campaign-overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [sectionData, setSectionData] = useState<Partial<Campaign>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const campaignId = params.id as string;

  // Logo upload functions
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Logo file size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    
    setUploadingLogo(true);
    try {
      // Convert file to base64 for thumbnail field
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;
        
        // Update campaign with new thumbnail
        const response = await fetch(`/api/campaigns/${campaignId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            thumbnail: base64Image
          }),
        });
        
        if (response.ok) {
          // Update campaign with new thumbnail
          setCampaign(prev => prev ? { ...prev, thumbnail: base64Image } : null);
          setLogoFile(null);
          setLogoPreview(null);
          setToastMessage({ type: 'success', message: 'Campaign logo updated successfully!' });
          setLogoModalOpen(false);
        } else {
          throw new Error('Failed to update logo');
        }
      };
      reader.readAsDataURL(logoFile);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setToastMessage({ type: 'error', message: 'Failed to upload logo. Please try again.' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeExistingLogo = async () => {
    setRemovingLogo(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thumbnail: null
        }),
      });
      
      if (response.ok) {
        setCampaign(prev => prev ? { ...prev, thumbnail: null } : null);
        setToastMessage({ type: 'success', message: 'Campaign logo removed successfully!' });
        setLogoModalOpen(false);
      } else {
        throw new Error('Failed to remove logo');
      }
    } catch (error) {
      console.error('Error removing logo:', error);
      setToastMessage({ type: 'error', message: 'Failed to remove logo. Please try again.' });
    } finally {
      setRemovingLogo(false);
    }
  };

  // Auto-hide toast messages after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Use campaign validation hook
  const { sectionStatus, completionCount, isComplete, getSectionStyle, getSectionIcon } = useCampaignValidation(campaign);
  
  // Pre-calculate validation for all sections at component level
  const overviewValidation = useSectionFormValidation(campaign, 'campaign-overview');
  const budgetValidation = useSectionFormValidation(campaign, 'budget-timeline');
  const contentValidation = useSectionFormValidation(campaign, 'content-requirements');
  const audienceValidation = useSectionFormValidation(campaign, 'audience-targeting');

  // Optional: Enable debugging by uncommenting the code below
  // useEffect(() => {
  //   if (campaign) {
  //     const validationErrors = getDetailedValidationErrors(campaign);
  //     console.log('Campaign validation debug:', { sectionStatus, completionCount, validationErrors });
  //   }
  // }, [campaign, sectionStatus, completionCount]);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const [campaignRes, submissionsRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`),
          fetch(`/api/submissions?campaign_id=${campaignId}`)
        ]);

        if (campaignRes.ok) {
          const campaignData = await campaignRes.json();
          setCampaign(campaignData);
          // Initialize sectionData with campaign data for validation
          setSectionData(campaignData);
        }

        if (submissionsRes.ok) {
          const submissionsData = await submissionsRes.json();
          setSubmissions(submissionsData.items || []);
        }
      } catch (error) {
        console.error('Error fetching campaign data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  const updateCampaignStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setCampaign(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const saveSection = async (sectionName: string, data: Partial<Campaign>) => {
    setSavingSection(sectionName);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        const updatedCampaign = await res.json();
        setCampaign(updatedCampaign);
        setEditingSection(null);
        setSectionData(updatedCampaign);
      } else {
        throw new Error('Failed to save section');
      }
    } catch (error) {
      console.error(`Error saving ${sectionName}:`, error);
      alert(`Failed to save ${sectionName}. Please try again.`);
    } finally {
      setSavingSection(null);
    }
  };

  const startEditing = (sectionName: string) => {
    setEditingSection(sectionName);
    setSectionData(campaign || {});
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setSectionData(campaign || {});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'pending_budget': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
          <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
          <Link href="/brand/campaigns">
            <Button>Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = campaign.status === 'active';
  const isDraft = campaign.status === 'draft';
  const isPaused = campaign.status === 'paused';

  return (
    <>
      {/* Custom Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            toastMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span className="text-sm font-medium">{toastMessage.message}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="ml-2 text-current hover:opacity-70 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logo Management Modal */}
      {logoModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Manage Campaign Logo</h3>
              <button
                onClick={() => setLogoModalOpen(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Logo Display */}
            {(campaign as any).thumbnail && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Current logo</p>
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-border">
                    <img
                      src={(campaign as any).thumbnail}
                      alt="Current Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={removeExistingLogo}
                  disabled={removingLogo}
                  className="w-full"
                >
                  {removingLogo ? 'Removing...' : 'Remove Logo'}
                </Button>
              </div>
            )}

            {/* Upload New Logo */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Upload new logo</p>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="space-y-2 w-full"
                >
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Click to select image</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </button>
              </div>
            </div>

            {/* New Logo Preview and Actions */}
            {logoFile && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">New logo preview</p>
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-border">
                    <img
                      src={logoPreview || ''}
                      alt="New Logo Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={uploadLogo}
                    disabled={uploadingLogo}
                    className="flex-1"
                  >
                    {uploadingLogo ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => setLogoModalOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-64 z-50 p-2 bg-background border border-border rounded-md shadow-lg"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Secondary Campaign Sidebar - Fixed Position, Outside Main Content */}
      <div className={`fixed inset-y-0 left-20 z-40 w-64 min-w-64 max-w-64 bg-muted/80 border-r border-border flex-shrink-0 h-screen flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Campaign Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Campaign Logo */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden group cursor-pointer border-2 border-border/50 hover:border-border transition-colors" onClick={() => setLogoModalOpen(true)}>
                  {logoPreview || (campaign as any).thumbnail ? (
                    <img 
                      src={logoPreview || (campaign as any).thumbnail} 
                      alt="Campaign Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                  )}
                  
                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {/* Edit Button Overlay - Top right corner */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoModalOpen(true);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-primary hover:bg-primary/80 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
                >
                  <Edit className="h-3 w-3" />
                </button>
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base leading-tight truncate mb-1" title={campaign.title}>
                  {campaign.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    className={`${getStatusColor(campaign.status)} text-xs font-medium px-2 py-0.5`}
                    variant="secondary"
                  >
                    {campaign.status === 'pending_budget' ? 'Pending Budget' : campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {campaign.platforms?.map((platform, index) => (
                    <div key={index} className="w-6 h-6 bg-muted rounded-md flex items-center justify-center">
                      {platform === 'youtube' && (
                        <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      )}
                      {platform === 'tiktok' && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      )}
                      {platform === 'instagram' && (
                        <svg className="w-4 h-4 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z"/>
                        </svg>
                      )}
                      {platform === 'linkedin' && (
                        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      )}
                      {platform === 'facebook' && (
                        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )}
                      {platform === 'twitter' && (
                        <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.665 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      )}
                    </div>
                  ))}
                  {(!campaign.platforms || campaign.platforms.length === 0) && (
                    <div className="w-6 h-6 bg-muted rounded-md flex items-center justify-center">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0 ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          

          
          {/* Campaign Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/50">
            <div className="text-center py-1">
              <div className="text-xs font-bold text-foreground">
                ${campaign.total_budget?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-muted-foreground">Budget</div>
            </div>
            <div className="text-center py-1">
              <div className="text-xs font-bold text-foreground">
                {submissions.length}
              </div>
              <div className="text-xs text-muted-foreground">Submissions</div>
            </div>
          </div>
        </div>

        {/* Campaign Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 pb-6">
          {/* Campaign & Requirements Section */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Campaign & Requirements
            </div>
            <button 
              onClick={() => setActiveSection('campaign-overview')}
              className={`w-full text-left px-2 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 border ${
                getSectionStyle('campaign-overview', activeSection === 'campaign-overview')
              }`}
            >
              <Target className="h-4 w-4" />
              Campaign Overview
              {getSectionIcon('campaign-overview')}
            </button>
            <button 
              onClick={() => setActiveSection('budget-timeline')}
              className={`w-full text-left px-2 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 border ${
                getSectionStyle('budget-timeline', activeSection === 'budget-timeline')
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Budget & Timeline
              {getSectionIcon('budget-timeline')}
            </button>
            <button 
              onClick={() => setActiveSection('content-requirements')}
              className={`w-full text-left px-2 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 border ${
                getSectionStyle('content-requirements', activeSection === 'content-requirements')
              }`}
            >
              <FileText className="h-4 w-4" />
              Content Requirements
              {getSectionIcon('content-requirements')}
            </button>
            <button 
              onClick={() => setActiveSection('audience-targeting')}
              className={`w-full text-left px-2 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 border ${
                getSectionStyle('audience-targeting', activeSection === 'audience-targeting')
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Audience Targeting
              {getSectionIcon('audience-targeting')}
            </button>

          </div>

          {/* Submissions & Analytics Section */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Performance
            </div>
            <button 
              onClick={() => setActiveSection('submissions')}
              className={`w-full text-left px-2 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 border ${
                activeSection === 'submissions' 
                  ? 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:text-primary-100 border-primary/40 dark:border-primary/500 shadow-md' 
                  : 'bg-muted/50 dark:bg-muted/30 text-muted-foreground dark:text-muted-foreground border-transparent hover:bg-muted dark:hover:bg-muted/50 hover:border-border'
              }`}
            >
              <Users className="h-4 w-4" />
              Submissions ({submissions.length})
            </button>
            <button 
              onClick={() => setActiveSection('analytics')}
              className={`w-full text-left px-2 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 border ${
                activeSection === 'analytics' 
                  ? 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:text-primary-100 border-primary/40 dark:border-primary/500 shadow-md' 
                  : 'bg-muted/50 dark:bg-muted/30 text-muted-foreground dark:text-muted-foreground border-transparent hover:bg-muted dark:hover:bg-muted/50 hover:border-border'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>
            <button 
              onClick={() => setActiveSection('communication-assets')}
              className={`w-full text-left px-2 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 border ${
                activeSection === 'communication-assets' 
                  ? 'bg-primary/20 dark:bg-primary/30 text-primary-foreground dark:text-primary-100 border-primary/40 dark:border-primary/500 shadow-md' 
                  : 'bg-muted/50 dark:bg-muted/30 text-muted-foreground dark:text-muted-foreground border-transparent hover:bg-muted dark:hover:bg-muted/50 hover:border-border'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Communication & Assets
            </button>
          </div>

          {/* Management Section */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Management
            </div>
            <Link href={`/brand/campaigns/${campaignId}/edit`} className="block">
              <button className="w-full text-left px-2 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Campaign
              </button>
            </Link>
            
            {isDraft && (
              <button 
                onClick={() => updateCampaignStatus('active')}
                disabled={updating}
                className="w-full text-left px-2 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Activate
              </button>
            )}
            
            {isActive && (
              <button 
                onClick={() => updateCampaignStatus('paused')}
                disabled={updating}
                className="w-full text-left px-2 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
            )}
            
            {isPaused && (
              <button 
                onClick={() => updateCampaignStatus('active')}
                disabled={updating}
                className="w-full text-left px-2 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Resume
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 left-20 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area - Positioned to account for secondary sidebar */}
      <div className="ml-64 min-h-screen overflow-auto px-6 pb-6">

        {/* Campaign Overview Section */}
        {activeSection === 'campaign-overview' && (
          <CampaignOverview
            campaign={campaign}
            campaignId={campaignId}
            sectionData={sectionData}
            setSectionData={setSectionData}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            savingSection={savingSection}
            saveSection={saveSection}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            setActiveSection={setActiveSection}
            overviewValidation={overviewValidation}
            completionCount={completionCount}
          />
        )}

        {/* Budget & Timeline Section */}
        {activeSection === 'budget-timeline' && (
          <BudgetTimeline
            campaign={campaign}
            campaignId={campaignId}
            sectionData={sectionData}
            setSectionData={setSectionData}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            savingSection={savingSection}
            saveSection={saveSection}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            setActiveSection={setActiveSection}
            budgetValidation={budgetValidation}
          />
        )}

        {/* Content Requirements Section */}
        {activeSection === 'content-requirements' && (
          <ContentRequirements
            campaign={campaign}
            campaignId={campaignId}
            sectionData={sectionData}
            setSectionData={setSectionData}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            savingSection={savingSection}
            saveSection={saveSection}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            setActiveSection={setActiveSection}
            contentValidation={contentValidation}
          />
        )}

        {/* Audience Targeting Section */}
        {activeSection === 'audience-targeting' && (
          <AudienceTargeting
            campaign={campaign}
            campaignId={campaignId}
            sectionData={sectionData}
            setSectionData={setSectionData}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            savingSection={savingSection}
            saveSection={saveSection}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            setActiveSection={setActiveSection}
            audienceValidation={audienceValidation}
          />
        )}



        {/* Submissions Section */}
        {activeSection === 'submissions' && (
          <Submissions
            campaign={campaign}
            campaignId={campaignId}
            sectionData={sectionData}
            setSectionData={setSectionData}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            savingSection={savingSection}
            saveSection={saveSection}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            setActiveSection={setActiveSection}
            submissions={submissions}
          />
        )}

        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <Analytics
            campaign={campaign}
            campaignId={campaignId}
            sectionData={sectionData}
            setSectionData={setSectionData}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            savingSection={savingSection}
            saveSection={saveSection}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            setActiveSection={setActiveSection}
          />
        )}

        {/* Communication & Assets Section */}
        {activeSection === 'communication-assets' && (
          <CommunicationAssets
            campaign={campaign}
            campaignId={campaignId}
            sectionData={sectionData}
            setSectionData={setSectionData}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            savingSection={savingSection}
            saveSection={saveSection}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            setActiveSection={setActiveSection}
          />
        )}

        {/* End of main content sections */}
      </div>
    </>
  );
}
