"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  ExternalLink,
  Calendar,
  TrendingUp,
  User,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  FileText
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CampaignSectionProps, Submission } from "./types";

interface SubmissionsProps extends Omit<CampaignSectionProps, 'activeSection'> {
  submissions: Submission[];
  onSubmissionsUpdate?: (updatedSubmissions: Submission[]) => void;
}

export function Submissions({
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
  submissions,
  onSubmissionsUpdate
}: SubmissionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [processing, setProcessing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{type: 'approve' | 'reject' | 'feedback', submission: Submission | null}>({type: 'approve', submission: null});
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 50;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter(submission => {
      const matchesSearch = !searchTerm || 
        (submission.creator_name && submission.creator_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (submission.post_url && submission.post_url.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
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

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);
  const startIndex = (currentPage - 1) * submissionsPerPage;
  const endIndex = startIndex + submissionsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  const handleSubmissionAction = (submission: Submission, action: 'approve' | 'reject' | 'feedback') => {
    if (action === 'approve' || action === 'reject') {
      setConfirmAction({type: action, submission});
      setConfirmDialogOpen(true);
    } else {
      // For feedback, we'll just show a console message for now since we removed the detailed dialog
      console.log('Feedback functionality will be implemented in a future update.');
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction.submission || !confirmAction.type) return;

    try {
      setProcessing(true);
      
      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Determine the new status based on action type
      let newStatus = 'pending';
      if (confirmAction.type === 'approve') {
        newStatus = 'approved';
      } else if (confirmAction.type === 'reject') {
        newStatus = 'rejected';
      }

      // Use the correct ID field
      const submissionId = (confirmAction.submission as any)._id || confirmAction.submission.id;
      
      const response = await fetch(`/api/submissions/${submissionId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${confirmAction.type} submission`);
      }

      // Update the submissions using the callback
      if (onSubmissionsUpdate) {
        const updatedSubmissions = submissions.map(sub => 
          sub.id === confirmAction.submission!.id 
            ? { ...sub, status: newStatus }
            : sub
        );
        onSubmissionsUpdate(updatedSubmissions);
      }

      // Close dialog and reset state
      setConfirmDialogOpen(false);
      setConfirmAction({type: 'approve', submission: null});
      
      // Success - no popup needed, the UI will update automatically
      
    } catch (error) {
      console.error(`Error ${confirmAction.type}ing submission:`, error);
      // Error handling - could add toast notification here instead of alert
    } finally {
      setProcessing(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Full Width Top Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 -mx-6 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Creator Submissions</h2>
                <p className="text-base text-muted-foreground mt-1">
                  Review and manage creator content submissions
                </p>
              </div>
            </div>
          </div>
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
                placeholder="Search by creator, content, or post URL..."
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
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {submissions.filter(s => s.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
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
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters to see more submissions"
                  : "Creators haven't submitted content for this campaign yet"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="px-6 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-6">
                <div className="w-48 min-w-0">
                  <div className="text-sm font-medium text-muted-foreground text-left">Creator</div>
                </div>
                <div className="w-64 min-w-0">
                  <div className="text-sm font-medium text-muted-foreground text-left">Content</div>
                </div>
                <div className="w-24">
                  <div className="text-sm font-medium text-muted-foreground text-left">Status</div>
                </div>
                <div className="w-20">
                  <div className="text-sm font-medium text-muted-foreground text-left">Views</div>
                </div>
                <div className="w-24">
                  <div className="text-sm font-medium text-muted-foreground text-left">Date</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground text-left">Actions</div>
                </div>
              </div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y">
              {paginatedSubmissions.map((submission, index) => (
                <div key={submission.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-6">
                    {/* Creator Info */}
                    <div className="w-48 min-w-0 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {submission.creator_name ? submission.creator_name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{submission.creator_name || 'Unknown Creator'}</div>
                        <div className="text-xs text-muted-foreground truncate">@{submission.creator_name?.toLowerCase().replace(/\s+/g, '') || 'unknown'}</div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="w-64 min-w-0">
                      {submission.post_url && (
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
                          className="text-sm text-primary hover:underline truncate block text-left"
                        >
                          {submission.post_url}
                        </a>
                      )}
                      {submission.media_urls && submission.media_urls.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{submission.media_urls.length} files</span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="w-24 flex justify-start">
                      <Badge className={`${getStatusColor(submission.status || 'pending')} border text-xs`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(submission.status || 'pending')}
                          {(submission.status || 'pending').charAt(0).toUpperCase() + (submission.status || 'pending').slice(1)}
                        </div>
                      </Badge>
                    </div>

                    {/* Views */}
                    <div className="w-20 text-sm text-muted-foreground text-left">
                      {(submission.views || 0).toLocaleString()}
                    </div>

                    {/* Date */}
                    <div className="w-24 text-sm text-muted-foreground text-left">
                      {submission.created_at ? new Date(submission.created_at).toLocaleDateString() : 'No Date'}
                    </div>

                    {/* Actions */}
                    <div className="flex-1 flex items-center justify-start gap-1">
                      {/* Quick Actions for Pending */}
                      {(submission.status === 'pending' || !submission.status || submission.status === 'Pending') && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSubmissionAction(submission, 'approve')}
                            className="bg-green-600 hover:bg-green-700 px-2 py-1 h-7"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSubmissionAction(submission, 'reject')}
                            className="px-2 py-1 h-7"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}

                      {/* Secondary Actions */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSubmissionAction(submission, 'feedback')}
                        className="px-2 py-1 h-7"
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="px-2 py-1 h-7"
                      >
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
                          onClick={(e) => {
                            if (!submission.post_url) {
                              e.preventDefault();
                              alert('No URL available for this submission');
                            }
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction.type === 'approve' ? 'Approve Submission' : 'Reject Submission'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmAction.type} this submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              disabled={processing}
              className={confirmAction.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {processing ? 'Processing...' : confirmAction.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
