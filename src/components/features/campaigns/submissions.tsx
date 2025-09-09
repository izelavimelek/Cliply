"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  MessageCircle
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
  submissions
}: SubmissionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'feedback' | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [processing, setProcessing] = useState(false);

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

  const handleSubmissionAction = (submission: Submission, action: 'approve' | 'reject' | 'feedback') => {
    setSelectedSubmission(submission);
    setActionType(action);
    setFeedbackText("");
    setActionDialogOpen(true);
  };

  const processSubmissionAction = async () => {
    if (!selectedSubmission || !actionType) return;

    try {
      setProcessing(true);
      // Here you would typically make an API call to update the submission
      // For now, we'll just close the dialog
      setActionDialogOpen(false);
      setSelectedSubmission(null);
      setActionType(null);
      setFeedbackText("");
    } catch (error) {
      console.error('Error processing submission:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Creator Submissions
          </h2>
          <p className="text-muted-foreground mt-1">Review and manage submissions from creators</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {submissions.length} total submissions
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by creator name or post URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
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
        </CardContent>
      </Card>
      
      {/* Submissions List */}
      <Card>
        <CardContent className="p-0">
          {filteredSubmissions.length > 0 ? (
            <div className="divide-y">
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-6">
                    {/* Left side - Creator info and content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        {/* Creator Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {submission.creator_name ? submission.creator_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Creator Name and Status */}
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{submission.creator_name || 'Unknown Creator'}</h3>
                            <Badge className={`${getStatusColor(submission.status || 'pending')} border`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(submission.status || 'pending')}
                                {(submission.status || 'pending').charAt(0).toUpperCase() + (submission.status || 'pending').slice(1)}
                              </div>
                            </Badge>
                          </div>

                          {/* Submission Details */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {submission.created_at ? new Date(submission.created_at).toLocaleDateString() : 'Unknown date'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {(submission.views || 0).toLocaleString()} views
                            </div>
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
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex flex-col gap-2 w-48 flex-shrink-0">
                      {/* Quick Actions for Pending */}
                      {submission.status === 'pending' && (
                        <div className="flex gap-2 mb-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmissionAction(submission, 'approve')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSubmissionAction(submission, 'reject')}
                            className="flex-1"
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
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
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Feedback
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
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== "all" ? "No submissions found" : "No submissions yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters to see more submissions"
                  : "Creators will submit their content here once they discover your campaign."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
                <p className="text-sm font-medium">Creator: {selectedSubmission.creator_name}</p>
                <p className="text-sm text-muted-foreground">
                  Submitted: {selectedSubmission.created_at ? new Date(selectedSubmission.created_at).toLocaleDateString() : 'Unknown date'}
                </p>
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
