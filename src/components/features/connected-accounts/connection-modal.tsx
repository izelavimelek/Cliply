"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TikTokAccount, YouTubeAccount, InstagramAccount } from '@/lib/mongodb/schemas';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

type Platform = 'tiktok' | 'youtube' | 'instagram';

interface ConnectionModalProps {
  isOpen: boolean;
  platform: Platform | null;
  userId: string;
  onClose: () => void;
  onSuccess: (platform: Platform, accountData: any) => void;
}

interface ConnectionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

export function ConnectionModal({ isOpen, platform, userId, onClose, onSuccess }: ConnectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<ConnectionStep[]>([]);

  const platformConfig = {
    tiktok: {
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-black text-white',
      oauthUrl: '/api/connected-accounts/tiktok/oauth',
      requirements: [
        'TikTok account with public profile',
        'Account must be active and in good standing',
        'Must be 13+ years old (TikTok requirement)'
      ]
    },
    youtube: {
      name: 'YouTube',
      icon: '📺',
      color: 'bg-red-600 text-white',
      oauthUrl: '/api/connected-accounts/youtube/oauth',
      requirements: [
        'YouTube channel with public videos',
        'Account must be active and in good standing',
        'Must be 13+ years old (YouTube requirement)'
      ]
    },
    instagram: {
      name: 'Instagram',
      icon: '📷',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      oauthUrl: '/api/connected-accounts/instagram/oauth',
      requirements: [
        'Instagram account (personal, creator, or business)',
        'Account must be active and in good standing',
        'Must be 13+ years old (Instagram requirement)'
      ]
    }
  };

  useEffect(() => {
    if (platform && isOpen) {
      setSteps([
        {
          id: 'redirect',
          title: 'Redirecting to OAuth',
          description: `Redirecting you to ${platformConfig[platform].name} to authorize access`,
          status: 'pending'
        },
        {
          id: 'authorize',
          title: 'Authorize Access',
          description: 'Please authorize our app to access your account data',
          status: 'pending'
        },
        {
          id: 'fetch_data',
          title: 'Fetching Account Data',
          description: 'Retrieving your profile information and follower count',
          status: 'pending'
        },
        {
          id: 'complete',
          title: 'Connection Complete',
          description: 'Your account has been successfully connected',
          status: 'pending'
        }
      ]);
      setCurrentStep(0);
      setError(null);
    }
  }, [platform, isOpen]);

  const handleConnect = async () => {
    if (!platform) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Step 1: Get OAuth URL
      setSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'in_progress' } : step
      ));
      setCurrentStep(0);

      // Get OAuth URL from our API
      const oauthResponse = await fetch(`/api/connected-accounts/${platform}?user_id=${userId}`);
      
      if (!oauthResponse.ok) {
        const errorData = await oauthResponse.json();
        throw new Error(errorData.message || 'Failed to get OAuth URL');
      }

      const oauthData = await oauthResponse.json();
      const { oauth_url, state } = oauthData;

      setSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStep(1);

      // Step 2: Redirect to OAuth
      setSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'in_progress' } : step
      ));

      // Store state for verification
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_platform', platform);

      // Redirect to TikTok OAuth
      window.location.href = oauth_url;

    } catch (err) {
      console.error('OAuth initiation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate OAuth flow');
      setSteps(prev => prev.map(step => 
        step.status === 'in_progress' ? { ...step, status: 'error' } : step
      ));
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    if (!isConnecting) {
      onClose();
    }
  };

  if (!platform) return null;

  const config = platformConfig[platform];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            Connect {config.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requirements */}
          <div className="space-y-3">
            <h4 className="font-medium">Requirements</h4>
            <ul className="space-y-2">
              {config.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>

          {/* Connection Steps */}
          {steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Connection Process</h4>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step.status === 'completed' 
                        ? 'bg-green-600 text-white' 
                        : step.status === 'in_progress'
                        ? 'bg-blue-600 text-white'
                        : step.status === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : step.status === 'in_progress' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : step.status === 'error' ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        step.status === 'completed' ? 'text-green-600' : 
                        step.status === 'in_progress' ? 'text-blue-600' :
                        step.status === 'error' ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className={`flex-1 ${config.color}`}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect {config.name}
                </>
              )}
            </Button>
            <Button
              onClick={handleClose}
              disabled={isConnecting}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
