"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { needsBrandSetup } from "@/lib/brand-completion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  ExternalLink,
  Calendar,
  User,
  TrendingUp,
  MoreHorizontal,
  Download,
  Star,
  FileText
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  campaign?: {
    _id: string;
    title: string;
    status: string;
    imageUrl?: string;
  };
  creator?: {
    name: string;
    username: string;
    avatar?: string;
    followers?: number;
  };
}

export default function BrandSubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [brand, setBrand] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // Actions
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'feedback' | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSubmissions();
    }
  }, [authLoading, user]);

  useEffect(() => {
    applyFilters();
  }, [submissions, searchTerm, statusFilter, campaignFilter, sortBy]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Fetch brand data, campaigns, and submissions in parallel
      const [brandResponse, campaignsResponse, submissionsResponse] = await Promise.all([
        fetch('/api/brands/my-brand', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/campaigns?role=brand', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/submissions?role=brand', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      // Handle brand data
      if (brandResponse.ok) {
        const brandData = await brandResponse.json();
        setBrand(brandData);
      } else {
        setBrand(null);
      }

      if (!campaignsResponse.ok) {
        if (campaignsResponse.status === 404) {
          // No brand found - this is expected, not an error
          setSubmissions([]);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch campaigns');
      }

      const campaignsData = await campaignsResponse.json();

      if (!submissionsResponse.ok) {
        if (submissionsResponse.status === 404) {
          // No brand found - this is expected, not an error
          setSubmissions([]);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch submissions');
      }

      const submissionsData = await submissionsResponse.json();
      const allSubmissions = submissionsData.items || [];

      console.log('Debug - Submissions API response:', submissionsData);
      console.log('Debug - All submissions for brand:', allSubmissions.length);

      // Enrich submissions with campaign and creator data
      const enrichedSubmissions = allSubmissions.map((submission: any) => {
        // Handle creator ID
        const creatorIdSuffix = submission.creator_id.slice(-4);
        
        return {
          _id: submission._id,
          campaign_id: submission.campaign_id,
          creator_id: submission.creator_id,
          post_url: submission.post_url || '',
          media_urls: submission.media_urls || [],
          status: submission.status || 'pending',
          views: submission.views || 0,
          earnings: submission.earnings || 0,
          feedback: submission.feedback || '',
          verified_at: submission.verified_at,
          created_at: submission.created_at,
          updated_at: submission.updated_at,
          campaign: campaignsData.items.find((c: any) => c._id === submission.campaign_id),
          creator: {
            name: `Creator ${creatorIdSuffix}`,
            username: `@creator${creatorIdSuffix}`,
            followers: 1000, // Default follower count
          }
        };
      });

      setSubmissions(enrichedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError(error instanceof Error ? error.message : 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.creator?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Campaign filter
    if (campaignFilter !== "all") {
      filtered = filtered.filter(submission => submission.campaign_id === campaignFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "views":
          return (b.views || 0) - (a.views || 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredSubmissions(filtered);
  };

  const handleSubmissionAction = async (submission: Submission, action: 'approve' | 'reject' | 'feedback') => {
    setSelectedSubmission(submission);
    setActionType(action);
    setFeedbackText("");
    setActionDialogOpen(true);
  };

  const processSubmissionAction = async () => {
    if (!selectedSubmission || !actionType) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/submissions/${selectedSubmission._id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'pending',
          feedback: feedbackText || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update submission');
      }

      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub._id === selectedSubmission._id 
          ? { 
              ...sub, 
              status: actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'pending',
              feedback: feedbackText || sub.feedback,
              verified_at: actionType !== 'feedback' ? new Date().toISOString() : sub.verified_at
            }
          : sub
      ));

      setActionDialogOpen(false);
      setSelectedSubmission(null);
      setActionType(null);
      setFeedbackText("");
    } catch (error) {
      console.error('Error processing submission:', error);
      alert('Failed to process submission. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending_budget':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to view submissions.</div>;
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading submissions...</p>
        </div>
      </div>
    );
  }

  // Show brand setup prompt if brand is not set up or incomplete
  if (needsBrandSetup(brand)) {
    return (
      <div className="space-y-6 p-6">
        <Card className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Brand Setup Required</h2>
            <p className="text-muted-foreground mb-6">
              {brand ? 
                "Complete your brand profile to view submissions and manage your campaigns." :
                "Set up your brand profile to view submissions and manage your campaigns."
              }
            </p>
            <Button 
              onClick={() => router.push('/brand/settings')}
              className="bg-primary hover:bg-primary/90"
            >
              {brand ? "Complete Brand Setup" : "Set Up Brand"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-red-600">Error: {error}</div>
        <Button onClick={fetchSubmissions}>Retry</Button>
      </div>
    );
  }

  const uniqueCampaigns = Array.from(
    new Map(submissions.map(s => [s.campaign_id, s.campaign])).values()
  ).filter(Boolean);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Submissions</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              try {
                const response = await fetch('/api/debug/submissions');
                const data = await response.json();
                console.log('Debug data:', data);
                alert(`Submissions: ${data.submissionCount}, Campaigns: ${data.campaignCount}`);
              } catch (error) {
                console.error('Debug error:', error);
              }
            }}
          >
            Debug
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by campaign, creator, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Campaign Filter */}
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {uniqueCampaigns.map((campaign) => (
                <SelectItem key={campaign?._id} value={campaign?._id || ''}>
                  {campaign?.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="views">Most Views</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {submissions.filter(s => s.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {submissions.filter(s => s.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">
                    {submissions.reduce((sum, s) => sum + (s.views || 0), 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || campaignFilter !== "all"
                  ? "Try adjusting your filters to see more submissions"
                  : "Creators haven't submitted content for your campaigns yet"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredSubmissions.map((submission) => (
                <div key={submission._id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-6">
                    {/* Left side - Creator info and content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        {/* Creator Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {submission.creator?.name ? submission.creator.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Creator Name and Status */}
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{submission.creator?.name || 'Unknown Creator'}</h3>
                            <span className="text-muted-foreground text-sm">{submission.creator?.username || '@unknown'}</span>
                            <Badge variant="outline" className="text-xs">
                              {submission.creator?.followers?.toLocaleString() || '0'} followers
                            </Badge>
                          </div>

                          {/* Campaign Info */}
                          <div className="flex items-center gap-2 mb-3">
                            <Link 
                              href={`/brand/campaigns/${submission.campaign_id}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {submission.campaign?.title}
                            </Link>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getCampaignStatusColor(submission.campaign?.status || '')}`}
                            >
                              {submission.campaign?.status?.replace('_', ' ')}
                            </Badge>
                          </div>

                          {/* Submission Details */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(submission.created_at).toLocaleDateString()}
                            </div>
                            {submission.views && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {submission.views.toLocaleString()} views
                              </div>
                            )}
                            {submission.earnings && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                ${submission.earnings}
                              </div>
                            )}
                          </div>

                          {/* Post URL */}
                          {submission.post_url && (
                            <div className="flex items-center gap-2 mb-3">
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={submission.post_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline truncate"
                              >
                                {submission.post_url}
                              </a>
                            </div>
                          )}

                          {/* Media Files - Compact Preview */}
                          {submission.media_urls && submission.media_urls.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Media Files ({submission.media_urls.length}):</p>
                              <div className="flex gap-2">
                                {submission.media_urls.slice(0, 3).map((mediaUrl, index) => (
                                  <div key={index} className="relative group">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                                      {mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                        <img 
                                          src={mediaUrl} 
                                          alt={`Media ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : mediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <FileText className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <FileText className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                    <a 
                                      href={mediaUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100"
                                    >
                                      <ExternalLink className="w-3 h-3 text-white" />
                                    </a>
                                  </div>
                                ))}
                                {submission.media_urls.length > 3 && (
                                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">+{submission.media_urls.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Feedback */}
                          {submission.feedback && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-1">Feedback:</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">{submission.feedback}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex flex-col gap-2 w-48 flex-shrink-0">
                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getStatusColor(submission.status)} border`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {submission.status ? submission.status.charAt(0).toUpperCase() + submission.status.slice(1) : 'Unknown'}
                          </div>
                        </Badge>
                      </div>

                      {/* Quick Actions for Pending */}
                      {submission.status === 'pending' && (
                        <div className="flex gap-2 mb-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmissionAction(submission, 'approve')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSubmissionAction(submission, 'reject')}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {/* Secondary Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSubmissionAction(submission, 'feedback')}
                          className="flex-1"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {submission.feedback ? 'Edit' : 'Feedback'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1"
                        >
                          <a href={submission.post_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Submission'}
              {actionType === 'reject' && 'Reject Submission'}
              {actionType === 'feedback' && 'Add Feedback'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'This will approve the submission and mark it as verified.'}
              {actionType === 'reject' && 'This will reject the submission. You can provide feedback below.'}
              {actionType === 'feedback' && 'Add feedback to help the creator improve their submission.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Creator: {selectedSubmission.creator?.name}</p>
                <p className="text-sm text-muted-foreground">Campaign: {selectedSubmission.campaign?.title}</p>
                <a 
                  href={selectedSubmission.post_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View Post →
                </a>
              </div>

              {(actionType === 'reject' || actionType === 'feedback') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feedback (Optional)</label>
                  <Textarea
                    placeholder="Provide feedback to help the creator improve..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={processSubmissionAction}
              disabled={processing}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {processing ? 'Processing...' : 
                actionType === 'approve' ? 'Approve' :
                actionType === 'reject' ? 'Reject' : 'Save Feedback'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
