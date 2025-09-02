"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle
} from "lucide-react";
import { FaYoutube, FaTiktok, FaInstagram, FaTwitter } from "react-icons/fa";

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

  // Detect if user came from sidebar or discover page
  useEffect(() => {
    // Check URL parameters to see if user came from sidebar
    const urlParams = new URLSearchParams(window.location.search);
    const fromSidebar = urlParams.get('from') === 'sidebar';
    console.log('Campaign detail page - URL params:', window.location.search);
    console.log('Campaign detail page - fromSidebar:', fromSidebar);
    setCameFromSidebar(fromSidebar);
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

        if (applicationResponse.ok) {
          const applicationData = await applicationResponse.json();
          setApplicationStatus(applicationData);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {!cameFromSidebar && (
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            {applicationStatus?.has_applied && applicationStatus.status === 'approved' && (
              <Badge variant="default" className="bg-blue-600 text-white">
                ✓ Joined
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">by {brandName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Campaign Overview
                </div>
                {applicationStatus?.has_applied && applicationStatus.status === 'approved' && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    ✓ Joined
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {campaign.description || 'No description available'}
              </p>
              
              {campaign.requirements && (
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <p className="text-sm text-muted-foreground">{campaign.requirements}</p>
                </div>
              )}
              
              {campaign.content_guidelines && (
                <div>
                  <h4 className="font-semibold mb-2">Content Guidelines</h4>
                  <p className="text-sm text-muted-foreground">{campaign.content_guidelines}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deliverables */}
          {campaign.deliverables && campaign.deliverables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {campaign.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          {applicationStatus?.has_applied && applicationStatus.status === 'approved' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">You've Joined</p>
                    <p className="text-sm text-green-600">Ready to submit content</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rate</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {paymentRate}
                </Badge>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget Progress</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${progressPercentage > 0 ? 'bg-orange-500' : 'bg-gray-300'}`}
                    style={{ width: `${Math.max(progressPercentage, 2)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${paidOut.toLocaleString()} of ${totalBudget.toLocaleString()} paid out
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Campaign Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Category</span>
                <Badge variant="outline">{campaign.category || 'Campaign'}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Platforms</span>
                <div className="flex items-center gap-1">
                  {platforms.map((platform: string | undefined) => {
                    if (!platform) return null;
                    const platformIcons: Record<PlatformType, React.ReactElement> = {
                      'instagram': <FaInstagram className="w-4 h-4 text-pink-600" />,
                      'tiktok': <FaTiktok className="w-4 h-4 text-black dark:text-white" />,
                      'youtube': <FaYoutube className="w-4 h-4 text-red-600" />,
                      'twitter': <FaTwitter className="w-4 h-4 text-blue-500" />
                    };
                    const platformKey = platform.toLowerCase() as PlatformType;
                    return (
                      <span key={platform} title={platform}>
                        {platformIcons[platformKey] || <span className="w-4 h-4 bg-gray-400 rounded"></span>}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Views</span>
                <span className="text-sm">{campaign.views || 0}</span>
              </div>
              
              {campaign.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Deadline</span>
                  <span className="text-sm">{new Date(campaign.deadline).toLocaleDateString()}</span>
                </div>
              )}
              
              {campaign.target_audience && (
                <div>
                  <span className="text-sm font-medium">Target Audience</span>
                  <p className="text-xs text-muted-foreground mt-1">{campaign.target_audience}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          {applicationStatus?.has_applied && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Campaign Joined</p>
                    <p className="text-sm text-green-600">
                      You've successfully joined this campaign and can now submit content.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          {applicationStatus?.has_applied ? (
            <div className="space-y-2">
              {applicationStatus.status === 'pending' && (
                <Button className="w-full" size="lg" disabled>
                  Application Pending
                </Button>
              )}
              {applicationStatus.status === 'rejected' && (
                <Button className="w-full" size="lg" disabled>
                  Application Rejected
                </Button>
              )}
              {applicationStatus.status === 'approved' && (
                <Button className="w-full" size="lg">
                  Submit Content
                </Button>
              )}
            </div>
          ) : (
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleJoinCampaign}
              disabled={joining}
            >
              {joining ? 'Joining...' : 'Join Campaign'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
