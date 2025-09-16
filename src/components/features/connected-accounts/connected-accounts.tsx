"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TikTokAccount, YouTubeAccount, InstagramAccount } from '@/lib/mongodb/schemas';
import { PlatformCard } from './platform-card';
import { ConnectionModal } from './connection-modal';
import { RefreshCw, Plus, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { TikTokIcon, YouTubeIcon, InstagramIcon } from './platform-icons';

interface ConnectedAccountsProps {
  userId: string;
  initialAccounts?: {
    tiktok?: TikTokAccount[];
    youtube?: YouTubeAccount[];
    instagram?: InstagramAccount[];
  };
}

type Platform = 'tiktok' | 'youtube' | 'instagram';

export function ConnectedAccounts({ userId, initialAccounts = {} }: ConnectedAccountsProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionModal, setConnectionModal] = useState<{
    isOpen: boolean;
    platform: Platform | null;
  }>({ isOpen: false, platform: null });

  // Calculate total connected accounts
  const totalConnected = (accounts.tiktok?.length || 0) + 
                        (accounts.youtube?.length || 0) + 
                        (accounts.instagram?.length || 0);

  // Calculate total followers across all platforms
  const totalFollowers = (accounts.tiktok?.reduce((sum, acc) => sum + (acc.follower_count || 0), 0) || 0) +
                        (accounts.youtube?.reduce((sum, acc) => sum + (acc.subscriber_count || 0), 0) || 0) +
                        (accounts.instagram?.reduce((sum, acc) => sum + (acc.follower_count || 0), 0) || 0);

  const handleConnect = (platform: Platform) => {
    setConnectionModal({ isOpen: true, platform });
  };

  const handleDisconnect = async (platform: Platform, accountIndex: number) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to disconnect account
      console.log(`Disconnecting ${platform} account at index ${accountIndex}`);
      
      // Optimistic update
      setAccounts(prev => ({
        ...prev,
        [platform]: prev[platform]?.filter((_, index) => index !== accountIndex) || []
      }));
    } catch (err) {
      setError('Failed to disconnect account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async (platform: Platform, accountIndex: number) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to refresh account data
      console.log(`Refreshing ${platform} account at index ${accountIndex}`);
      
      // Update last_synced timestamp
      setAccounts(prev => ({
        ...prev,
        [platform]: prev[platform]?.map((acc, index) => 
          index === accountIndex 
            ? { ...acc, last_synced: new Date() }
            : acc
        ) || []
      }));
    } catch (err) {
      setError('Failed to refresh account data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionSuccess = (platform: Platform, accountData: any) => {
    setAccounts(prev => ({
      ...prev,
      [platform]: [...(prev[platform] || []), accountData]
    }));
    setConnectionModal({ isOpen: false, platform: null });
  };

  const platformConfigs = [
    {
      platform: 'tiktok' as Platform,
      name: 'TikTok',
      icon: TikTokIcon,
      color: 'bg-black',
      accounts: accounts.tiktok || [],
      connectLabel: 'Connect TikTok'
    },
    {
      platform: 'youtube' as Platform,
      name: 'YouTube',
      icon: YouTubeIcon,
      color: 'bg-red-600',
      accounts: accounts.youtube || [],
      connectLabel: 'Connect YouTube'
    },
    {
      platform: 'instagram' as Platform,
      name: 'Instagram',
      icon: InstagramIcon,
      color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
      accounts: accounts.instagram || [],
      connectLabel: 'Connect Instagram'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalConnected}</div>
              <div className="text-sm text-muted-foreground">Connected Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {totalFollowers.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {platformConfigs.filter(p => p.accounts.length > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Platforms Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platformConfigs.map((config) => (
          <PlatformCard
            key={config.platform}
            platform={config.platform}
            name={config.name}
            icon={config.icon}
            color={config.color}
            accounts={config.accounts}
            connectLabel={config.connectLabel}
            onConnect={() => handleConnect(config.platform)}
            onDisconnect={(accountIndex) => handleDisconnect(config.platform, accountIndex)}
            onRefresh={(accountIndex) => handleRefresh(config.platform, accountIndex)}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={connectionModal.isOpen}
        platform={connectionModal.platform}
        userId={userId}
        onClose={() => setConnectionModal({ isOpen: false, platform: null })}
        onSuccess={handleConnectionSuccess}
      />
    </div>
  );
}
