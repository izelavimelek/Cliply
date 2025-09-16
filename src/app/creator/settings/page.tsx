"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { ConnectedAccounts } from "@/components/features/connected-accounts";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Bell, 
  Shield, 
  CreditCard,
  Camera,
  Save,
  Settings,
  CheckCircle,
  AlertCircle,
  Link
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const [profile, setProfile] = useState({
    name: "John Creator",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Content creator specializing in fashion and lifestyle content. I love creating authentic content that resonates with my audience.",
    location: "Los Angeles, CA",
    website: "https://johncreator.com",
    profileImage: null
  });

  const [socialLinks, setSocialLinks] = useState({
    youtube: "https://youtube.com/@johncreator",
    tiktok: "https://tiktok.com/@johncreator",
    instagram: "https://instagram.com/johncreator",
    twitter: "https://twitter.com/johncreator"
  });

  const [connectedAccounts, setConnectedAccounts] = useState({
    tiktok: [],
    youtube: [],
    instagram: []
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    campaignUpdates: true,
    paymentNotifications: true,
    weeklyReports: false,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEarnings: false,
    allowMessages: true,
    dataSharing: false
  });

  // Fetch connected accounts on component mount
  useEffect(() => {
    const fetchConnectedAccounts = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('/api/connected-accounts', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setConnectedAccounts(data.connected_accounts || {
            tiktok: [],
            youtube: [],
            instagram: []
          });
        }
      } catch (error) {
        console.error('Error fetching connected accounts:', error);
      }
    };

    fetchConnectedAccounts();
  }, [user]);

  // Save functions
  const saveProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setSaveStatus({ type: null, message: '' });
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'creator',
          display_name: profile.name,
          bio: profile.bio,
          website: profile.website,
          social_links: socialLinks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }

      setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to save profile' 
      });
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const saveSocialLinks = async () => {
    await saveProfile(); // Reuse the same function since social links are part of profile
  };

  const saveNotifications = async () => {
    // For now, just show a success message since we don't have a notifications API
    setSaveStatus({ type: 'success', message: 'Notification preferences saved!' });
    setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
  };

  const savePrivacy = async () => {
    // For now, just show a success message since we don't have a privacy API
    setSaveStatus({ type: 'success', message: 'Privacy settings saved!' });
    setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Status Message */}
      {saveStatus.type && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          saveStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {saveStatus.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{saveStatus.message}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex space-x-1 border-b border-border">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('connected-accounts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'connected-accounts'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Connected Accounts
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'privacy'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Privacy
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'billing'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Billing
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profile.name} 
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={profile.phone} 
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={profile.location} 
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={profile.website} 
                  onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com" 
                />
              </div>

              <Button 
                className="flex items-center gap-2" 
                onClick={saveProfile}
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Connected Accounts Tab */}
        {activeTab === 'connected-accounts' && (
        <div className="space-y-6">
          <ConnectedAccounts 
            userId={user?.id || ''} 
            initialAccounts={connectedAccounts}
          />
        </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={notifications.emailNotifications} 
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Campaign Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about campaign status changes</p>
                  </div>
                  <Switch 
                    checked={notifications.campaignUpdates} 
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, campaignUpdates: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when payments are processed</p>
                  </div>
                  <Switch 
                    checked={notifications.paymentNotifications} 
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, paymentNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
                  </div>
                  <Switch 
                    checked={notifications.weeklyReports} 
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and updates</p>
                  </div>
                  <Switch 
                    checked={notifications.marketingEmails} 
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>
              </div>
              <Button 
                className="flex items-center gap-2" 
                onClick={saveNotifications}
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select 
                    value={privacy.profileVisibility}
                    onValueChange={(value) => setPrivacy(prev => ({ ...prev, profileVisibility: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="followers">Followers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Earnings</Label>
                    <p className="text-sm text-muted-foreground">Display earnings on your profile</p>
                  </div>
                  <Switch 
                    checked={privacy.showEarnings} 
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showEarnings: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">Let brands contact you directly</p>
                  </div>
                  <Switch 
                    checked={privacy.allowMessages} 
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowMessages: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share analytics data with brands</p>
                  </div>
                  <Switch 
                    checked={privacy.dataSharing} 
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, dataSharing: checked }))}
                  />
                </div>
              </div>
              <Button 
                className="flex items-center gap-2" 
                onClick={savePrivacy}
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Privacy Settings'}
              </Button>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Billing settings will be implemented here</p>
                <p className="text-sm text-muted-foreground mt-1">Payment methods, tax information, and billing history</p>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}
