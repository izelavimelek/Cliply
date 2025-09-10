"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  totalEarned: number;
}

export default function SubmissionsPage() {
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
    rejected: 0,
    totalEarned: 0
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
        rejected: groupedSubmissions.rejected.length,
        totalEarned: allSubmissions.reduce((total, sub) => total + (sub.earnings || 0), 0)
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
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Submissions</h1>
          <p className="text-muted-foreground mt-1">Track your campaign submissions and earnings</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Earned</p>
                <p className="text-2xl font-bold">${stats.totalEarned.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
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
              <Card key={submission._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{submission.campaign_title || 'Unknown Campaign'}</h3>
                        {submission.brand_name && (
                          <Badge variant="outline">{submission.brand_name}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                      </div>
                      {submission.views && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{submission.views.toLocaleString()} views</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Pending Review</Badge>
                      {submission.post_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
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
              <Card key={submission._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{submission.campaign_title || 'Unknown Campaign'}</h3>
                        {submission.brand_name && (
                          <Badge variant="outline">{submission.brand_name}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                      </div>
                      {submission.views && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{submission.views.toLocaleString()} views</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Approved</Badge>
                      {submission.post_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
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
              <Card key={submission._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{submission.campaign_title || 'Unknown Campaign'}</h3>
                        {submission.brand_name && (
                          <Badge variant="outline">{submission.brand_name}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                      {submission.post_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
