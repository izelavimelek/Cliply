"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TikTokAccount, YouTubeAccount, InstagramAccount } from '@/lib/mongodb/schemas';
import { CheckCircle, Users, ExternalLink } from 'lucide-react';

interface CreatorProfileProps {
  displayName?: string;
  bio?: string;
  website?: string;
  connectedAccounts?: {
    tiktok?: TikTokAccount[];
    youtube?: YouTubeAccount[];
    instagram?: InstagramAccount[];
  };
  showConnectedAccounts?: boolean;
}

export function CreatorProfile({ 
  displayName, 
  bio, 
  website, 
  connectedAccounts,
  showConnectedAccounts = true 
}: CreatorProfileProps) {
  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getTotalFollowers = () => {
    if (!connectedAccounts) return 0;
    
    const tiktokFollowers = connectedAccounts.tiktok?.reduce((sum, acc) => sum + (acc.follower_count || 0), 0) || 0;
    const youtubeSubscribers = connectedAccounts.youtube?.reduce((sum, acc) => sum + (acc.subscriber_count || 0), 0) || 0;
    const instagramFollowers = connectedAccounts.instagram?.reduce((sum, acc) => sum + (acc.follower_count || 0), 0) || 0;
    
    return tiktokFollowers + youtubeSubscribers + instagramFollowers;
  };

  const getConnectedPlatforms = () => {
    if (!connectedAccounts) return [];
    
    const platforms = [];
    if (connectedAccounts.tiktok && connectedAccounts.tiktok.length > 0) {
      platforms.push({ name: 'TikTok', icon: '🎵', color: 'bg-black', count: connectedAccounts.tiktok.length });
    }
    if (connectedAccounts.youtube && connectedAccounts.youtube.length > 0) {
      platforms.push({ name: 'YouTube', icon: '📺', color: 'bg-red-600', count: connectedAccounts.youtube.length });
    }
    if (connectedAccounts.instagram && connectedAccounts.instagram.length > 0) {
      platforms.push({ name: 'Instagram', icon: '📷', color: 'bg-gradient-to-r from-purple-500 to-pink-500', count: connectedAccounts.instagram.length });
    }
    
    return platforms;
  };

  const totalFollowers = getTotalFollowers();
  const connectedPlatforms = getConnectedPlatforms();

  return (
    <div className="space-y-6">
      {/* Basic Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Creator Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayName && (
            <div>
              <h3 className="text-xl font-semibold">{displayName}</h3>
            </div>
          )}
          
          {bio && (
            <div>
              <p className="text-muted-foreground">{bio}</p>
            </div>
          )}
          
          {website && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a 
                href={website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {website}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Accounts Summary */}
      {showConnectedAccounts && connectedAccounts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Connected Social Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectedPlatforms.length > 0 ? (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatFollowerCount(totalFollowers)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {connectedPlatforms.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Platforms Connected</div>
                  </div>
                </div>

                {/* Platform Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {connectedPlatforms.map((platform) => (
                    <div 
                      key={platform.name}
                      className={`${platform.color} text-white rounded-lg p-4 text-center`}
                    >
                      <div className="text-2xl mb-2">{platform.icon}</div>
                      <div className="font-semibold">{platform.name}</div>
                      <div className="text-sm opacity-90">
                        {platform.count} account{platform.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Account Details */}
                <div className="space-y-3">
                  {connectedAccounts.tiktok && connectedAccounts.tiktok.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <span className="text-lg">🎵</span>
                        TikTok Accounts
                      </h4>
                      <div className="space-y-2">
                        {connectedAccounts.tiktok.map((account, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">@{account.username}</span>
                              {account.verified && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatFollowerCount(account.follower_count || 0)} followers
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {connectedAccounts.youtube && connectedAccounts.youtube.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <span className="text-lg">📺</span>
                        YouTube Channels
                      </h4>
                      <div className="space-y-2">
                        {connectedAccounts.youtube.map((account, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{account.channel_name || 'Unknown Channel'}</span>
                              {account.verified && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatFollowerCount(account.subscriber_count || 0)} subscribers
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {connectedAccounts.instagram && connectedAccounts.instagram.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <span className="text-lg">📷</span>
                        Instagram Accounts
                      </h4>
                      <div className="space-y-2">
                        {connectedAccounts.instagram.map((account, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">@{account.username}</span>
                              {account.verified && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatFollowerCount(account.follower_count || 0)} followers
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Connected Accounts</h3>
                <p className="text-muted-foreground">
                  Connect your social media accounts to showcase your reach and get more campaign opportunities.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
