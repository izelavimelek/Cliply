"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  MessageCircle,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  FileText
} from "lucide-react";

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
  campaign_title?: string;
  brand_name?: string;
  platform?: string;
}

interface SubmissionStats {
  pending: number;
  approved: number;
  rejected: number;
}

export default function SubmissionsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [submissions, setSubmissions] = useState<{
    pending: Submission[];
    approved: Submission[];
    rejected: Submission[];
  }>({
    pending: [],
    approved: [],
    rejected: []
  });
  
  const [stats, setStats] = useState<SubmissionStats>({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch submissions from API
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/submissions?role=creator', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.statusText}`);
      }

      const data = await response.json();
      const allSubmissions: Submission[] = data.items || [];

      // Group submissions by status
      const groupedSubmissions = {
        pending: allSubmissions.filter(sub => sub.status === 'pending'),
        approved: allSubmissions.filter(sub => sub.status === 'approved'),
        rejected: allSubmissions.filter(sub => sub.status === 'rejected')
      };

      setSubmissions(groupedSubmissions);

      // Calculate stats
      const newStats = {
        pending: groupedSubmissions.pending.length,
        approved: groupedSubmissions.approved.length,
        rejected: groupedSubmissions.rejected.length
      };

      setStats(newStats);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  // Load submissions on component mount
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Handle viewing submission details
  const handleViewSubmission = (submission: Submission) => {
    if (submission.post_url) {
      window.open(submission.post_url, '_blank');
    } else if (submission.media_urls && submission.media_urls.length > 0) {
      // Check if it's a blob URL (temporary) or a real URL
      const mediaUrl = submission.media_urls[0];
      if (mediaUrl.startsWith('blob:')) {
        // For blob URLs, show a more user-friendly message
        const userConfirmed = window.confirm(
          'This file was uploaded as a temporary file. Blob URLs expire when the page is refreshed.\n\n' +
          'Would you like to try downloading it? (Note: This may not work if the page has been refreshed since upload)'
        );
        
        if (userConfirmed) {
          try {
            // First, try to fetch the blob to see if it's still valid
            fetch(mediaUrl)
              .then(response => {
                if (response.ok) {
                  // If successful, create download link
                  const link = document.createElement('a');
                  link.href = mediaUrl;
                  link.download = `submission-${submission._id}-media`;
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  throw new Error('Blob URL is no longer valid');
                }
              })
              .catch(error => {
                console.error('Error accessing blob URL:', error);
                alert('This file is no longer available. Blob URLs expire when the page is refreshed or the browser session ends.');
              });
          } catch (error) {
            console.error('Error creating download link:', error);
            alert('This file is no longer available. Blob URLs expire when the page is refreshed or the browser session ends.');
          }
        }
      } else {
        // For real URLs, open normally
        window.open(mediaUrl, '_blank');
      }
    }
  };

  // Handle refreshing submissions
  const handleRefresh = () => {
    fetchSubmissions();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  // Get status badge style for approved submissions
  const getStatusBadgeStyle = (status: string) => {
    if (status === 'approved') {
      return 'bg-green-500 text-white hover:bg-green-600';
    }
    return '';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Check if submission has viewable content
  const hasViewableContent = (submission: Submission) => {
    return submission.post_url || (submission.media_urls && submission.media_urls.length > 0);
  };

  // Get view button icon based on content type
  const getViewButtonIcon = (submission: Submission) => {
    if (submission.post_url) {
      return <ExternalLink className="h-4 w-4" />;
    } else if (submission.media_urls && submission.media_urls.length > 0) {
      return <FileText className="h-4 w-4" />;
    }
    return <ExternalLink className="h-4 w-4" />;
  };

  // Get view button title/tooltip based on content type
  const getViewButtonTitle = (submission: Submission) => {
    if (submission.post_url) {
      return 'View post';
    } else if (submission.media_urls && submission.media_urls.length > 0) {
      const mediaUrl = submission.media_urls[0];
      if (mediaUrl.startsWith('blob:')) {
        return 'Download file (temporary - may not work if page was refreshed)';
      } else {
        return 'View/download file';
      }
    }
    return 'View content';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Submissions</h1>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => setActiveTab('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">All</p>
                <p className="text-2xl font-bold">{stats.pending + stats.approved + stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => setActiveTab('pending')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => setActiveTab('approved')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => setActiveTab('rejected')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-1 border-b border-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'approved'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'rejected'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* All Tab Content */}
        {activeTab === 'all' && (
        <div className="space-y-2">
          {submissions.pending.length === 0 && submissions.approved.length === 0 && submissions.rejected.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Submissions</h3>
                <p className="text-muted-foreground mb-4">You don't have any submissions yet.</p>
                <Button variant="outline" onClick={() => window.location.href = '/creator/discover'}>
                  <Target className="h-4 w-4 mr-2" />
                  Browse Campaigns
                </Button>
              </CardContent>
            </Card>
          ) : (
            [...submissions.pending, ...submissions.approved, ...submissions.rejected].map((submission) => (
              <div key={submission._id} className="flex items-center justify-between px-6 py-4 border-b hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{submission.campaign_title || 'Unknown Campaign'}</h3>
                    {submission.brand_name && (
                      <Badge variant="outline" className="text-xs">{submission.brand_name}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Submitted: {formatDate(submission.created_at)}</span>
                    </div>
                    {submission.platform && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{submission.platform}</span>
                      </div>
                    )}
                    {submission.earnings && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${submission.earnings.toFixed(2)}</span>
                      </div>
                    )}
                    {submission.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{submission.views.toLocaleString()} views</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getStatusBadgeVariant(submission.status)}
                    className={getStatusBadgeStyle(submission.status)}
                  >
                    <div className="flex items-center gap-1">
                      {submission.status === 'approved' && <CheckCircle className="h-3 w-3 text-white" />}
                      {submission.status === 'rejected' && <XCircle className="h-3 w-3 text-white" />}
                      {submission.status === 'pending' && <Clock className="h-3 w-3 text-yellow-500" />}
                      {submission.status === 'pending' ? 'Pending Review' : 
                       submission.status === 'approved' ? 'Approved' : 'Rejected'}
                    </div>
                  </Badge>
                  {hasViewableContent(submission) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewSubmission(submission)}
                      title={getViewButtonTitle(submission)}
                    >
                      {getViewButtonIcon(submission)}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        )}

        {/* Pending Tab Content */}
        {activeTab === 'pending' && (
        <div className="space-y-2">
          {submissions.pending.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Submissions</h3>
                <p className="text-muted-foreground mb-4">You don't have any submissions pending review at the moment.</p>
                <Button variant="outline" onClick={() => window.location.href = '/creator/discover'}>
                  <Target className="h-4 w-4 mr-2" />
                  Browse Campaigns
                </Button>
              </CardContent>
            </Card>
          ) : (
            submissions.pending.map((submission) => (
              <div key={submission._id} className="flex items-center justify-between px-6 py-4 border-b hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{submission.campaign_title || 'Unknown Campaign'}</h3>
                    {submission.brand_name && (
                      <Badge variant="outline" className="text-xs">{submission.brand_name}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Submitted: {formatDate(submission.created_at)}</span>
                    </div>
                    {submission.platform && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{submission.platform}</span>
                      </div>
                    )}
                    {submission.earnings && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${submission.earnings.toFixed(2)}</span>
                      </div>
                    )}
                    {submission.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{submission.views.toLocaleString()} views</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Pending Review</Badge>
                  {hasViewableContent(submission) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewSubmission(submission)}
                      title={getViewButtonTitle(submission)}
                    >
                      {getViewButtonIcon(submission)}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        )}

        {/* Approved Tab Content */}
        {activeTab === 'approved' && (
        <div className="space-y-2">
          {submissions.approved.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Approved Submissions</h3>
                <p className="text-muted-foreground mb-4">You don't have any approved submissions yet.</p>
                <Button variant="outline" onClick={() => window.location.href = '/creator/discover'}>
                  <Target className="h-4 w-4 mr-2" />
                  Browse Campaigns
                </Button>
              </CardContent>
            </Card>
          ) : (
            submissions.approved.map((submission) => (
              <div key={submission._id} className="flex items-center justify-between px-6 py-4 border-b hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{submission.campaign_title || 'Unknown Campaign'}</h3>
                    {submission.brand_name && (
                      <Badge variant="outline" className="text-xs">{submission.brand_name}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Approved: {submission.verified_at ? formatDate(submission.verified_at) : 'Recently'}</span>
                    </div>
                    {submission.platform && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{submission.platform}</span>
                      </div>
                    )}
                    {submission.earnings && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${submission.earnings.toFixed(2)}</span>
                      </div>
                    )}
                    {submission.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{submission.views.toLocaleString()} views</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="default"
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-white" />
                      Approved
                    </div>
                  </Badge>
                  {hasViewableContent(submission) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewSubmission(submission)}
                      title={getViewButtonTitle(submission)}
                    >
                      {getViewButtonIcon(submission)}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        )}

        {/* Rejected Tab Content */}
        {activeTab === 'rejected' && (
        <div className="space-y-2">
          {submissions.rejected.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rejected Submissions</h3>
                <p className="text-muted-foreground mb-4">Great! You don't have any rejected submissions.</p>
                <Button variant="outline" onClick={() => window.location.href = '/creator/discover'}>
                  <Target className="h-4 w-4 mr-2" />
                  Browse Campaigns
                </Button>
              </CardContent>
            </Card>
          ) : (
            submissions.rejected.map((submission) => (
              <div key={submission._id} className="flex items-center justify-between px-6 py-4 border-b hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{submission.campaign_title || 'Unknown Campaign'}</h3>
                    {submission.brand_name && (
                      <Badge variant="outline" className="text-xs">{submission.brand_name}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Rejected: {submission.updated_at ? formatDate(submission.updated_at) : 'Recently'}</span>
                    </div>
                    {submission.platform && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{submission.platform}</span>
                      </div>
                    )}
                    {submission.earnings && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${submission.earnings.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  {submission.feedback && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Feedback:</p>
                          <p className="text-sm text-red-700">{submission.feedback}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Rejected</Badge>
                  {hasViewableContent(submission) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewSubmission(submission)}
                      title={getViewButtonTitle(submission)}
                    >
                      {getViewButtonIcon(submission)}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </div>
    </div>
  );
}
