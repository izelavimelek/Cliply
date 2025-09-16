"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TikTokAccount, YouTubeAccount, InstagramAccount } from '@/lib/mongodb/schemas';
import { Plus, RefreshCw, Trash2, CheckCircle, Users, Calendar } from 'lucide-react';

type Platform = 'tiktok' | 'youtube' | 'instagram';

interface PlatformCardProps {
  platform: Platform;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accounts: (TikTokAccount | YouTubeAccount | InstagramAccount)[];
  connectLabel: string;
  onConnect: () => void;
  onDisconnect: (accountIndex: number) => void;
  onRefresh: (accountIndex: number) => void;
  isLoading: boolean;
}

export function PlatformCard({
  platform,
  name,
  icon,
  color,
  accounts,
  connectLabel,
  onConnect,
  onDisconnect,
  onRefresh,
  isLoading
}: PlatformCardProps) {
  const isConnected = accounts.length > 0;
  const totalFollowers = accounts.reduce((sum, acc) => {
    if ('follower_count' in acc) {
      return sum + (acc.follower_count || 0);
    } else if ('subscriber_count' in acc) {
      return sum + (acc.subscriber_count || 0);
    }
    return sum;
  }, 0);

  const verifiedCount = accounts.filter(acc => acc.verified).length;

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const IconComponent = icon;

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
      isConnected 
        ? 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20' 
        : 'border-border hover:border-primary/30 bg-gradient-to-br from-muted/20 to-transparent'
    }`}>
      <CardContent className="p-6">
        {!isConnected ? (
          // Not Connected State - Clean, centered design
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">Connect your {name} account to start earning</p>
            </div>
            <Button 
              onClick={onConnect}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect {name}
            </Button>
          </div>
        ) : (
          // Connected State - Modern card design
          <div className="space-y-4">
            {/* Platform Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shadow-md`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {accounts.length} account{accounts.length > 1 ? 's' : ''} connected
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onConnect}
                disabled={isLoading}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatFollowerCount(totalFollowers)}
                </div>
                <div className="text-xs text-muted-foreground">Total Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {verifiedCount}
                </div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
            </div>

            {/* Account List */}
            <div className="space-y-2">
              {accounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {('username' in account ? account.username : account.channel_name || 'Unknown').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {'username' in account ? `@${account.username}` : account.channel_name || 'Unknown'}
                        </span>
                        {account.verified && (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFollowerCount(
                          'follower_count' in account 
                            ? account.follower_count || 0 
                            : account.subscriber_count || 0
                        )} followers
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRefresh(index)}
                      disabled={isLoading}
                      className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDisconnect(index)}
                      disabled={isLoading}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 opacity-60 hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

