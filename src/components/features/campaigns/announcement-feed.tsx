"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Pin, 
  PinOff, 
  Edit, 
  Trash2, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Announcement } from "./types";

interface AnnouncementFeedProps {
  campaignId: string;
  brandId: string;
  isDialogOpen?: boolean;
  setIsDialogOpen?: (open: boolean) => void;
}

export function AnnouncementFeed({ campaignId, brandId, isDialogOpen: externalIsDialogOpen, setIsDialogOpen: externalSetIsDialogOpen }: AnnouncementFeedProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [internalIsDialogOpen, setInternalIsDialogOpen] = useState(false);
  
  // Use external dialog state if provided, otherwise use internal state
  const isDialogOpen = externalIsDialogOpen !== undefined ? externalIsDialogOpen : internalIsDialogOpen;
  const setIsDialogOpen = externalSetIsDialogOpen || setInternalIsDialogOpen;
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [campaignId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/announcements?campaign_id=${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.content.trim()) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          content: formData.content,
          title: formData.title || undefined,
          priority: formData.priority,
        }),
      });

      if (response.ok) {
        await fetchAnnouncements();
        resetForm();
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement');
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement || !formData.content.trim()) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title || undefined,
          priority: formData.priority,
        }),
      });

      if (response.ok) {
        await fetchAnnouncements();
        setEditingAnnouncement(null);
        resetForm();
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('Failed to update announcement');
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_pinned: !announcement.is_pinned,
        }),
      });

      if (response.ok) {
        await fetchAnnouncements();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update announcement');
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchAnnouncements();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      priority: "MEDIUM"
    });
    setEditingAnnouncement(null);
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title || "",
      content: announcement.content,
      priority: announcement.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'HIGH':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'MEDIUM':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'LOW':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleExpanded = (announcementId: string) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  const isExpanded = (announcementId: string) => {
    return expandedAnnouncements.has(announcementId);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading announcements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl p-8">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl">
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title (Optional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter announcement title..."
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="What's happening with this campaign?"
                rows={6}
                className="resize-none min-h-[120px] max-h-[300px] overflow-y-auto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "LOW" | "MEDIUM" | "HIGH" | "URGENT") => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">LOW</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="URGENT">URGENT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10 px-6">
              Cancel
            </Button>
            <Button 
              onClick={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
              disabled={!formData.content.trim()}
              className="h-10 px-6"
            >
              {editingAnnouncement ? 'Update' : 'Create'} Announcement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {announcements.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
          <p className="text-muted-foreground mb-4">
            Start communicating with creators by creating your first announcement.
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Announcement
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const isExpandedState = isExpanded(announcement.id);
            const shouldTruncate = announcement.content.length > 200;
            const displayContent = isExpandedState || !shouldTruncate 
              ? announcement.content 
              : truncateText(announcement.content);

            return (
              <div key={announcement.id} className="flex gap-4">
                {/* Date/Time Column - Outside the card */}
                <div className="flex-shrink-0 w-24 text-right pt-4">
                  <div className="text-xs text-muted-foreground">
                    {new Date(announcement.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(announcement.created_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                </div>

                {/* Announcement Card */}
                <Card className={`flex-1 p-4 pl-6 pr-6 hover:shadow-md transition-shadow ${announcement.is_pinned ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''}`}>
                  <div className="flex items-start gap-3">
                    {/* Avatar/Icon */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{announcement.brand_name || 'Campaign Team'}</span>
                        {announcement.is_pinned && (
                          <>
                            <span className="text-muted-foreground text-sm">·</span>
                            <Pin className="h-3 w-3 text-blue-500" />
                          </>
                        )}
                        <div className="flex items-center gap-1">
                          <Badge className={`${getPriorityColor(announcement.priority)} text-xs`}>
                            {announcement.priority}
                          </Badge>
                        </div>
                      </div>

                    {/* Title */}
                    {announcement.title && (
                      <h3 className="font-semibold text-base mb-2">{announcement.title}</h3>
                    )}
                    
                    {/* Content */}
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {displayContent}
                    </div>

                    {/* Read More/Less Button */}
                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpanded(announcement.id)}
                        className="text-primary hover:text-primary/80 text-sm font-medium mt-1 flex items-center gap-1"
                      >
                        {isExpandedState ? (
                          <>
                            Show less
                            <ChevronUp className="h-3 w-3" />
                          </>
                        ) : (
                          <>
                            Show more
                            <ChevronDown className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    )}

                    {/* Edit indicator */}
                    {announcement.updated_at !== announcement.created_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        (edited)
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePin(announcement)}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      >
                        {announcement.is_pinned ? (
                          <PinOff className="h-4 w-4" />
                        ) : (
                          <Pin className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(announcement)}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement)}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
