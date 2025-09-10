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
  Zap
} from "lucide-react";
import { Announcement } from "./types";

interface AnnouncementViewProps {
  campaignId: string;
  creatorId: string;
}

export function AnnouncementView({ campaignId, creatorId }: AnnouncementViewProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

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
      case 'normal':
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
      case 'normal':
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
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={`p-6 ${announcement.is_pinned ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {announcement.is_pinned && (
                    <Pin className="h-4 w-4 text-blue-500" />
                  )}
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(announcement.priority)}
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {announcement.priority}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {announcement.brand_name}
                </div>
              </div>

              {announcement.title && (
                <h3 className="text-lg font-semibold mb-2">{announcement.title}</h3>
              )}
              
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{announcement.content}</p>
              
              <div className="text-sm text-muted-foreground">
                {formatDate(announcement.created_at)}
                {announcement.updated_at !== announcement.created_at && (
                  <span className="ml-2">(edited)</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
