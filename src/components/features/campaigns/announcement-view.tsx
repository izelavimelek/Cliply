"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Pin, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Announcement } from "./types";

interface AnnouncementViewProps {
  campaignId: string;
  creatorId: string;
}

export function AnnouncementView({ campaignId, creatorId }: AnnouncementViewProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAnnouncements();
  }, [campaignId, creatorId]);

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low':
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
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Campaign Announcements</h2>
      </div>

      {announcements.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
          <p className="text-muted-foreground">
            The brand hasn't shared any announcements for this campaign yet.
          </p>
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
              <Card key={announcement.id} className={`p-4 hover:shadow-md transition-shadow ${announcement.is_pinned ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''}`}>
                <div className="flex items-start gap-3">
                  {/* Avatar/Icon */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{announcement.brand_name || 'Brand'}</span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">{formatDate(announcement.created_at)}</span>
                      {announcement.is_pinned && (
                        <>
                          <span className="text-muted-foreground text-sm">·</span>
                          <Pin className="h-3 w-3 text-blue-500" />
                        </>
                      )}
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(announcement.priority)}
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
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
