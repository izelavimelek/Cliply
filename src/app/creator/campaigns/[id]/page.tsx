"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  Users,
  Target,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  Link,
  Image,
  Video,
  Send,
  Star,
  TrendingUp,
  Eye,
  MessageSquare,
  Award,
  Globe,
  Zap,
  Shield,
  Palette,
  Mic,
  Camera,
  Edit3,
  Plus,
  X
} from "lucide-react";
import { FaYoutube, FaTiktok, FaInstagram, FaTwitter } from "react-icons/fa";
import { AnnouncementView } from "@/components/features/campaigns/announcement-view";

// Type definitions
interface Campaign {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  total_budget?: number;
  budget_spent?: number;
  rate_type?: 'fixed' | 'per_thousand';
  rate_per_thousand?: number;
  brand_name?: string;
  brand_id?: string;
  platforms?: string[];
  platform?: string;
  views?: number;
  status?: string;
  requirements?: string;
  deadline?: string;
  target_audience?: string;
  content_guidelines?: string;
  deliverables?: string[];
  // Enhanced campaign details
  objective?: string;
  deliverable_quantity?: {
    clips?: number;
    long_videos?: number;
    images?: number;
  };
  required_elements?: {
    logo_placement?: boolean;
    logo_instructions?: string;
    brand_mention?: boolean;
    brand_phrase?: string;
    call_to_action?: boolean;
    cta_type?: string;
    cta_text?: string;
    hashtags?: string[];
    additional_requirements?: string;
  };
  prohibited_content?: {
    competitor_brands?: boolean;
    profanity?: boolean;
    political?: boolean;
    custom?: string[];
  };
  tone_style?: string;
  music_guidelines?: string;
  example_references?: string[];
  target_geography?: string[];
  target_languages?: string[];
  target_age_range?: {
    min: number;
    max: number;
  };
  target_gender?: string;
  audience_interests?: string[];
  usage_rights?: string;
  exclusivity?: {
    enabled: boolean;
    category_exclusive?: boolean;
  };
  shared_files?: {
    logos?: string[];
    brand_kit?: string[];
    example_content?: string[];
  };
}

interface Submission {
  _id: string;
  campaign_id: string;
  creator_id: string;
  post_url: string;
  media_urls?: string[];
  status: 'pending' | 'approved' | 'rejected';
  views?: number;
  earnings?: number;
  feedback?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

type PlatformType = 'instagram' | 'tiktok' | 'youtube' | 'twitter';

export default function CampaignDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  
  // Check if user came from sidebar (joined campaigns) or discover page
  const [cameFromSidebar, setCameFromSidebar] = useState(false);
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<{
    has_applied: boolean;
    status: string | null;
    applied_at?: string;
  } | null>(null);
  const [joining, setJoining] = useState(false);
  
  // Submission states
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState<'url' | 'media'>('url');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionMedia, setSubmissionMedia] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Detect if user came from sidebar or discover page
  useEffect(() => {
    // Check URL parameters to see if user came from sidebar
    const urlParams = new URLSearchParams(window.location.search);
    const fromSidebar = urlParams.get('from') === 'sidebar';
    console.log('Campaign detail page - URL params:', window.location.search);
    console.log('Campaign detail page - fromSidebar:', fromSidebar);
    setCameFromSidebar(fromSidebar);
    
    // Always minimize sidebar when viewing campaign details
    console.log('Campaign detail page - minimizing sidebar');
    window.dispatchEvent(new CustomEvent('sidebar-state-change', {
      detail: { collapsed: true }
    }));
  }, []);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch(`/api/campaigns/${campaignId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch campaign details');
        }

        const data = await response.json();
        setCampaign(data);

        // Check application status
        const applicationResponse = await fetch(`/api/campaigns/${campaignId}/apply`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        let applicationData = null;
        if (applicationResponse.ok) {
          applicationData = await applicationResponse.json();
          setApplicationStatus(applicationData);
        }

        // Fetch submissions if user has joined
        if (applicationData?.has_applied && applicationData?.status === 'approved') {
          const submissionsResponse = await fetch(`/api/submissions?campaignId=${campaignId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (submissionsResponse.ok) {
            const submissionsData = await submissionsResponse.json();
            setSubmissions(submissionsData.items || []);
          }
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (user && campaignId) {
      fetchCampaign();
    }
  }, [user, campaignId]);

  const handleJoinCampaign = async () => {
    if (!user || !campaignId) return;
    
    try {
      setJoining(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/campaigns/${campaignId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join campaign');
      }

      // Update application status
      setApplicationStatus({
        has_applied: true,
        status: 'approved',
        applied_at: new Date().toISOString()
      });

      // Trigger sidebar refresh
      console.log('Dispatching campaign-joined event');
      window.dispatchEvent(new CustomEvent('campaign-joined'));

    } catch (err) {
      console.error('Error joining campaign:', err);
      alert(err instanceof Error ? err.message : 'Failed to join campaign');
    } finally {
      setJoining(false);
    }
  };

  const handleSubmitContent = async () => {
    if (!user || !campaignId) return;
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const submissionData: any = {
        campaign_id: campaignId,
        post_url: submissionUrl,
      };

      // Handle media uploads if any
      if (submissionMedia.length > 0) {
        const mediaUrls: string[] = [];
        for (const file of submissionMedia) {
          // In a real app, you'd upload to a file storage service
          // For now, we'll just use a placeholder URL
          mediaUrls.push(URL.createObjectURL(file));
        }
        submissionData.media_urls = mediaUrls;
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit content');
      }

      const newSubmission = await response.json();
      setSubmissions(prev => [...prev, newSubmission]);
      setSubmissionDialogOpen(false);
      setSubmissionUrl('');
      setSubmissionMedia([]);
      setShowSuccessModal(true);

    } catch (err) {
      console.error('Error submitting content:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit content');
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSubmissionMedia(prev => [...prev, ...files]);
  };

  const removeMedia = (index: number) => {
    setSubmissionMedia(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {!cameFromSidebar && (
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {!cameFromSidebar && (
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading campaign: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate progress
  const totalBudget = campaign.total_budget || 0;
  const paidOut = campaign.budget_spent || 0;
  const progressPercentage = totalBudget > 0 ? (paidOut / totalBudget) * 100 : 0;
  
  // Get brand name
  const brandName = campaign.brand_name || campaign.brand_id || 'Unknown Brand';
  
  // Format payment rate
  const rateType = campaign.rate_type || 'fixed';
  const rate = campaign.rate_per_thousand || campaign.total_budget || 0;
  const paymentRate = rateType === 'per_thousand' ? `$${rate}/1K views` : `$${rate} fixed`;
  
  // Get platforms array
  const platforms = campaign.platforms || [campaign.platform].filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {!cameFromSidebar && (
            <Button variant="outline" onClick={() => router.back()} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                {campaign.title}
              </h1>
              {applicationStatus?.has_applied && applicationStatus.status === 'approved' && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Joined
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Globe className="w-4 h-4" />
              <span>by {brandName}</span>
              {campaign.category && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {campaign.category}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Campaign Overview - Hero Section */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Campaign Overview</h2>
                      <p className="text-slate-600 dark:text-slate-400">Everything you need to know</p>
                    </div>
                  </div>
                  {applicationStatus?.has_applied && applicationStatus.status === 'approved' && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                    {campaign.description || 'No description available'}
                  </p>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{paymentRate}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Rate</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'TBD'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Deadline</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {campaign.target_age_range ? `${campaign.target_age_range.min}-${campaign.target_age_range.max}` : 'All'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Age Range</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {campaign.views?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information Sections */}
            <div className="space-y-8">
              {/* Requirements Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Requirements & Deliverables
                  </CardTitle>
                  <p className="text-slate-600 dark:text-slate-400">What you need to create for this campaign</p>
                </CardHeader>
                  <CardContent className="space-y-4">
                    {campaign.deliverable_quantity && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {campaign.deliverable_quantity.clips && (
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Video className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold">Short Clips</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{campaign.deliverable_quantity.clips}</div>
                          </div>
                        )}
                        {campaign.deliverable_quantity.long_videos && (
                          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Camera className="w-5 h-5 text-purple-600" />
                              <span className="font-semibold">Long Videos</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">{campaign.deliverable_quantity.long_videos}</div>
                          </div>
                        )}
                        {campaign.deliverable_quantity.images && (
                          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Image className="w-5 h-5 text-green-600" />
                              <span className="font-semibold">Images</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">{campaign.deliverable_quantity.images}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {campaign.required_elements && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Required Elements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {campaign.required_elements.logo_placement && (
                            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Logo Placement Required</span>
                            </div>
                          )}
                          {campaign.required_elements.brand_mention && (
                            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Brand Mention Required</span>
                            </div>
                          )}
                          {campaign.required_elements.call_to_action && (
                            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Call to Action Required</span>
                            </div>
                          )}
                        </div>
                        {campaign.required_elements.hashtags && campaign.required_elements.hashtags.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Required Hashtags</h5>
                            <div className="flex flex-wrap gap-2">
                              {campaign.required_elements.hashtags.map((hashtag, index) => (
                                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  #{hashtag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {campaign.prohibited_content && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg text-red-600">Prohibited Content</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {campaign.prohibited_content.competitor_brands && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <X className="w-4 h-4 text-red-500" />
                              <span>No Competitor Brands</span>
                            </div>
                          )}
                          {campaign.prohibited_content.profanity && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <X className="w-4 h-4 text-red-500" />
                              <span>No Profanity</span>
                            </div>
                          )}
                          {campaign.prohibited_content.political && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <X className="w-4 h-4 text-red-500" />
                              <span>No Political Content</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Content Guidelines Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Content Guidelines & Brand Assets
                  </CardTitle>
                  <p className="text-slate-600 dark:text-slate-400">Style guidelines and brand resources for your content</p>
                </CardHeader>
                  <CardContent className="space-y-6">
                    {campaign.tone_style && (
                      <div>
                        <h4 className="font-semibold mb-2">Tone & Style</h4>
                        <Badge variant="outline" className="text-sm">
                          {campaign.tone_style}
                        </Badge>
                      </div>
                    )}

                    {campaign.music_guidelines && (
                      <div>
                        <h4 className="font-semibold mb-2">Music Guidelines</h4>
                        <p className="text-slate-600 dark:text-slate-400">{campaign.music_guidelines}</p>
                      </div>
                    )}

                    {campaign.example_references && campaign.example_references.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Example References</h4>
                        <div className="space-y-2">
                          {campaign.example_references.map((reference, index) => (
                            <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <a href={reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {reference}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {campaign.shared_files && (
                      <div>
                        <h4 className="font-semibold mb-2">Brand Assets</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {campaign.shared_files.logos && campaign.shared_files.logos.length > 0 && (
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Image className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold">Logos</span>
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {campaign.shared_files.logos.length} files available
                              </div>
                            </div>
                          )}
                          {campaign.shared_files.brand_kit && campaign.shared_files.brand_kit.length > 0 && (
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Palette className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold">Brand Kit</span>
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {campaign.shared_files.brand_kit.length} files available
                              </div>
                            </div>
                          )}
                          {campaign.shared_files.example_content && campaign.shared_files.example_content.length > 0 && (
                            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Video className="w-5 h-5 text-green-600" />
                                <span className="font-semibold">Examples</span>
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {campaign.shared_files.example_content.length} files available
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Target Audience Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    Target Audience
                  </CardTitle>
                  <p className="text-slate-600 dark:text-slate-400">Who this campaign is designed to reach</p>
                </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {campaign.target_age_range && (
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-orange-600" />
                            <span className="font-semibold">Age Range</span>
                          </div>
                          <div className="text-2xl font-bold text-orange-600">
                            {campaign.target_age_range.min} - {campaign.target_age_range.max} years
                          </div>
                        </div>
                      )}

                      {campaign.target_gender && (
                        <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-pink-600" />
                            <span className="font-semibold">Gender</span>
                          </div>
                          <div className="text-2xl font-bold text-pink-600 capitalize">
                            {campaign.target_gender}
                          </div>
                        </div>
                      )}
                    </div>

                    {campaign.target_geography && campaign.target_geography.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Target Geography</h4>
                        <div className="flex flex-wrap gap-2">
                          {campaign.target_geography.map((location, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {campaign.audience_interests && campaign.audience_interests.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Audience Interests</h4>
                        <div className="flex flex-wrap gap-2">
                          {campaign.audience_interests.map((interest, index) => (
                            <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Campaign Announcements Section - Only show if creator has joined */}
              {applicationStatus?.has_applied && applicationStatus.status === 'approved' && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <AnnouncementView 
                      campaignId={campaignId} 
                      creatorId={user?.id || ''} 
                    />
                  </CardContent>
                </Card>
              )}

              {/* My Submissions Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-500" />
                        My Submissions
                      </CardTitle>
                      <p className="text-slate-600 dark:text-slate-400">Track and manage your content submissions</p>
                    </div>
                    {applicationStatus?.has_applied && applicationStatus.status === 'approved' && (
                      <Button 
                        onClick={() => setSubmissionDialogOpen(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Content
                      </Button>
                    )}
                  </div>
                </CardHeader>
                  <CardContent>
                    {submissions.length === 0 ? (
                      <div className="text-center py-12">
                        <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          Submit your content to start earning from this campaign
                        </p>
                        {applicationStatus?.has_applied && applicationStatus.status === 'approved' && (
                          <Button 
                            onClick={() => setSubmissionDialogOpen(true)}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Submit Your First Content
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {submissions.map((submission) => (
                          <div key={submission._id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Link className="w-4 h-4 text-blue-500" />
                                <a 
                                  href={(() => {
                                    if (!submission.post_url) return '#';
                                    
                                    // If URL already has protocol, use as is
                                    if (submission.post_url.startsWith('http://') || submission.post_url.startsWith('https://')) {
                                      return submission.post_url;
                                    }
                                    
                                    // If URL starts with www., add https://
                                    if (submission.post_url.startsWith('www.')) {
                                      return `https://${submission.post_url}`;
                                    }
                                    
                                    // For other cases, add https://
                                    return `https://${submission.post_url}`;
                                  })()} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline font-medium"
                                >
                                  View Post
                                </a>
                              </div>
                              <Badge 
                                className={
                                  submission.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  submission.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }
                              >
                                {submission.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(submission.created_at).toLocaleDateString()}
                              </div>
                              {submission.views && (
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {submission.views.toLocaleString()} views
                                </div>
                              )}
                              {submission.earnings && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  ${submission.earnings}
                                </div>
                              )}
                            </div>
                            {submission.feedback && (
                              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <p className="text-sm font-medium mb-1">Feedback:</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            {applicationStatus?.has_applied && applicationStatus.status === 'approved' && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-full">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">Campaign Joined</p>
                      <p className="text-sm text-green-600 dark:text-green-400">Ready to submit content</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{paymentRate}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Per Submission</div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budget Progress</span>
                    <span>{progressPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${Math.max(progressPercentage, 2)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    ${paidOut.toLocaleString()} of ${totalBudget.toLocaleString()} paid out
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Platform Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform: string | undefined, index: number) => {
                    if (!platform) return null;
                    const platformIcons: Record<PlatformType, React.ReactElement> = {
                      'instagram': <FaInstagram className="w-6 h-6 text-pink-600" />,
                      'tiktok': <FaTiktok className="w-6 h-6 text-black dark:text-white" />,
                      'youtube': <FaYoutube className="w-6 h-6 text-red-600" />,
                      'twitter': <FaTwitter className="w-6 h-6 text-blue-500" />
                    };
                    const platformKey = platform.toLowerCase() as PlatformType;
                    return (
                      <div key={platform || `platform-${index}`} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        {platformIcons[platformKey] || <span className="w-6 h-6 bg-slate-400 rounded"></span>}
                        <span className="text-sm font-medium capitalize">{platform}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            {applicationStatus?.has_applied ? (
              <div className="space-y-2">
                {applicationStatus.status === 'pending' && (
                  <Button className="w-full" size="lg" disabled>
                    <Clock className="w-4 h-4 mr-2" />
                    Application Pending
                  </Button>
                )}
                {applicationStatus.status === 'rejected' && (
                  <Button className="w-full" size="lg" disabled>
                    <X className="w-4 h-4 mr-2" />
                    Application Rejected
                  </Button>
                )}
                {applicationStatus.status === 'approved' && (
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                    size="lg"
                    onClick={() => setSubmissionDialogOpen(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Content
                  </Button>
                )}
              </div>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                size="lg" 
                onClick={handleJoinCampaign}
                disabled={joining}
              >
                {joining ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Join Campaign
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submission Dialog */}
      <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Submit Content
            </DialogTitle>
            <DialogDescription>
              Submit your content for this campaign. You can provide a URL or upload media files.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Submission Type Selection */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={submissionType === 'url' ? 'default' : 'outline'}
                  onClick={() => setSubmissionType('url')}
                  className="flex-1"
                >
                  <Link className="w-4 h-4 mr-2" />
                  URL Submission
                </Button>
                <Button
                  variant={submissionType === 'media' ? 'default' : 'outline'}
                  onClick={() => setSubmissionType('media')}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Media Upload
                </Button>
              </div>

              {submissionType === 'url' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Post URL</label>
                  <Input
                    placeholder="https://instagram.com/p/..."
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Enter the URL of your published post
                  </p>
                </div>
              )}

              {submissionType === 'media' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Upload Media</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                      id="media-upload"
                    />
                    <label htmlFor="media-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Images and videos up to 100MB
                      </p>
                    </label>
                  </div>
                  
                  {submissionMedia.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      {submissionMedia.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMedia(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSubmissionDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitContent}
              disabled={submitting || (!submissionUrl && submissionMedia.length === 0)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {submitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Content
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal with Confetti */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-green-600">
                Content Submitted Successfully!
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
                Your content has been submitted for review. You'll be notified once the brand reviews it.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Awesome!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-red-600">
                Submission Failed
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
                {errorMessage}
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => setShowErrorModal(false)}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confetti Effect */}
      {showSuccessModal && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
