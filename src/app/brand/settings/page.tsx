"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Bell,
  Shield,
  Camera,
  Save,
  Upload,
  DollarSign,
  Users,
  Settings,
  Check
} from "lucide-react";

interface BrandProfile {
  name: string;
  description: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  logo: string;
  coverImage: string;
  companySize: string;
  socialMedia: {
    instagram: string;
    twitter: string;
    facebook: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
  };
}

interface PaymentSettings {
  paymentMethod: string;
  bankAccountNumber: string;
  routingNumber: string;
  paypalEmail: string;
  stripeAccountId: string;
  taxId: string;
  billingAddress: string;
  invoiceEmail: string;
  paymentTerms: string;
  currency: string;
  autoPayouts: boolean;
  minimumPayout: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  campaignApplications: boolean;
  paymentNotifications: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  marketingEmails: boolean;
  systemUpdates: boolean;
}


export default function BrandSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [brandCreated, setBrandCreated] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Utility function to check if a field has content
  const hasContent = (value: string | undefined) => {
    return value && value.trim() !== '';
  };

  // Check if Basic Information section is complete (all required fields filled)
  const isBasicInfoComplete = () => {
    return hasContent(brandProfile.name) && 
           hasContent(brandProfile.industry) && 
           hasContent(brandProfile.description);
  };

  // Check if Contact Information section is complete (email is required)
  const isContactInfoComplete = () => {
    return hasContent(brandProfile.email);
  };

  // Check if Social Media section is complete (at least one social media field filled)
  const isSocialMediaComplete = () => {
    return hasContent(brandProfile.socialMedia.instagram) ||
           hasContent(brandProfile.socialMedia.twitter) ||
           hasContent(brandProfile.socialMedia.facebook) ||
           hasContent(brandProfile.socialMedia.linkedin) ||
           hasContent(brandProfile.socialMedia.youtube) ||
           hasContent(brandProfile.socialMedia.tiktok);
  };

  // Auto-save function
  const autoSave = async () => {
    // Auto-save regardless of completion status - this allows clearing fields too
    // But only if we have some data to save
    if (!brandProfile.name && !brandProfile.industry && !brandProfile.description && !brandProfile.email) {
      return;
    }

    // Prevent multiple simultaneous auto-saves
    if (autoSaving) {
      console.log('Auto-save already in progress, skipping...');
      return;
    }

    try {
      setAutoSaving(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) return;

      // Check if brand exists
      const checkResponse = await fetch('/api/brands/my-brand', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const isUpdate = checkResponse.ok;
      const method = isUpdate ? 'PUT' : 'POST';
      const endpoint = isUpdate ? '/api/brands/my-brand' : '/api/brands';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isUpdate ? {
          profile: {
            ...brandProfile,
            // Ensure empty strings are sent for cleared fields
            name: brandProfile.name || "",
            description: brandProfile.description || "",
            industry: brandProfile.industry || "",
            website: brandProfile.website || "",
            email: brandProfile.email || "",
            phone: brandProfile.phone || "",
            address: brandProfile.address || "",
            city: brandProfile.city || "",
            state: brandProfile.state || "",
            country: brandProfile.country || "",
            zipCode: brandProfile.zipCode || "",
            companySize: brandProfile.companySize || "",
            socialMedia: {
              instagram: brandProfile.socialMedia.instagram || "",
              twitter: brandProfile.socialMedia.twitter || "",
              facebook: brandProfile.socialMedia.facebook || "",
              linkedin: brandProfile.socialMedia.linkedin || "",
              youtube: brandProfile.socialMedia.youtube || "",
              tiktok: brandProfile.socialMedia.tiktok || ""
            }
          },
          payment: paymentSettings,
          notifications
        } : {
          name: brandProfile.name || "",
          description: brandProfile.description || "",
          industry: brandProfile.industry || "",
          website: brandProfile.website || ""
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        console.log(`Brand ${isUpdate ? 'updated' : 'created'} automatically`);
        console.log('Saved data:', isUpdate ? {
          profile: brandProfile,
          payment: paymentSettings,
          notifications
        } : {
          name: brandProfile.name,
          description: brandProfile.description,
          industry: brandProfile.industry,
          website: brandProfile.website
        });
        
        // Don't reload immediately - let the user see their changes
        // The data will be reloaded when they navigate away and back
        
        // If this was a creation, show success message (no redirect)
        if (!isUpdate) {
          setBrandCreated(true);
        }
      } else {
        console.error('Auto-save failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Debounced auto-save
  const triggerAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // For required fields, save immediately (no delay)
    const hasRequiredFieldContent = 
      brandProfile.name.trim() !== '' || 
      brandProfile.industry.trim() !== '' || 
      brandProfile.description.trim() !== '' || 
      brandProfile.email.trim() !== '';
    
    const delay = hasRequiredFieldContent ? 0 : 500; // Immediate for required fields, 500ms for others
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      console.log('Triggering auto-save with current data:', brandProfile);
      autoSave();
    }, delay);
  };

  // Logo upload functions
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Logo file size must be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    
    try {
      // Convert file to base64 for logo field
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;
        
        // Update brand profile with new logo
        setBrandProfile(prev => ({ ...prev, logo: base64Image }));
        setLogoFile(null);
        setLogoPreview(null);
      };
      reader.readAsDataURL(logoFile);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    }
  };

  const [brandProfile, setBrandProfile] = useState<BrandProfile>({
    name: "",
    description: "",
    industry: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    logo: "",
    coverImage: "",
    companySize: "",
    socialMedia: {
      instagram: "",
      twitter: "",
      facebook: "",
      linkedin: "",
      youtube: "",
      tiktok: ""
    }
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    paymentMethod: "stripe",
    bankAccountNumber: "",
    routingNumber: "",
    paypalEmail: "",
    stripeAccountId: "",
    taxId: "",
    billingAddress: "",
    invoiceEmail: "billing@mybrand.com",
    paymentTerms: "net30",
    currency: "USD",
    autoPayouts: true,
    minimumPayout: "100"
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    campaignApplications: true,
    paymentNotifications: true,
    weeklyReports: true,
    monthlyReports: false,
    marketingEmails: false,
    systemUpdates: true
  });


  // Auto-save when form data changes
  useEffect(() => {
    if (loading || isLoadingData) return; // Don't auto-save while loading initial data
    
    // For required fields, use immediate auto-save
    const requiredFieldsChanged = 
      brandProfile.name !== '' || 
      brandProfile.industry !== '' || 
      brandProfile.description !== '' || 
      brandProfile.email !== '';
    
    if (requiredFieldsChanged) {
      // Clear any pending auto-save and trigger immediately
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSave();
    } else {
      // For other fields, use debounced auto-save
      triggerAutoSave();
    }
  }, [brandProfile, paymentSettings, notifications]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Load brand settings on component mount
  useEffect(() => {
    const loadBrandSettings = async () => {
      try {
        setLoading(true);
        setIsLoadingData(true);
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch('/api/brands/my-brand', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const brandData = await response.json();
          console.log('Loaded brand data:', brandData);
          
          // Load brand profile data including contact information
          setBrandProfile({
            name: brandData.name || "",
            description: brandData.description || "",
            industry: brandData.industry || "",
            website: brandData.website || "",
            email: brandData.email || "",
            phone: brandData.phone || "",
            address: brandData.address || "",
            city: brandData.city || "",
            state: brandData.state || "",
            country: brandData.country || "",
            zipCode: brandData.zipCode || "",
            logo: brandData.logo || "",
            coverImage: brandData.coverImage || "",
            companySize: brandData.companySize || "",
            socialMedia: {
              instagram: brandData.socialMedia?.instagram || "",
              twitter: brandData.socialMedia?.twitter || "",
              facebook: brandData.socialMedia?.facebook || "",
              linkedin: brandData.socialMedia?.linkedin || "",
              youtube: brandData.socialMedia?.youtube || "",
              tiktok: brandData.socialMedia?.tiktok || ""
            }
          });
          
          // Load payment settings if available
          if (brandData.paymentSettings) {
            setPaymentSettings(prev => ({ ...prev, ...brandData.paymentSettings }));
          }
          
          // Load notification settings if available
          if (brandData.notificationSettings) {
            setNotifications(prev => ({ ...prev, ...brandData.notificationSettings }));
          }
        } else if (response.status === 404) {
          // No brand found - this is expected for new users
          console.log('No brand found for user - showing empty form for setup');
          // Keep the default empty state - this is the setup form
        } else {
          console.error('Failed to load brand settings:', response.status, response.statusText);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response data:', errorData);
        }
      } catch (error) {
        console.error('Error loading brand settings:', error);
      } finally {
        setLoading(false);
        setIsLoadingData(false);
      }
    };

    if (user) {
      loadBrandSettings();
    }
  }, [user]);

  const saveBrandSettings = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!brandProfile.name.trim()) {
        alert('Brand name is required');
        return;
      }
      
      if (!brandProfile.industry.trim()) {
        alert('Industry is required');
        return;
      }
      
      if (!brandProfile.description.trim()) {
        alert('Brand description is required');
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      
      // First check if brand exists
      const checkResponse = await fetch('/api/brands/my-brand', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const isUpdate = checkResponse.ok;
      const method = isUpdate ? 'PUT' : 'POST';
      const endpoint = isUpdate ? '/api/brands/my-brand' : '/api/brands';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isUpdate ? {
          profile: {
            ...brandProfile,
            // Ensure empty strings are sent for cleared fields
            name: brandProfile.name || "",
            description: brandProfile.description || "",
            industry: brandProfile.industry || "",
            website: brandProfile.website || "",
            email: brandProfile.email || "",
            phone: brandProfile.phone || "",
            address: brandProfile.address || "",
            city: brandProfile.city || "",
            state: brandProfile.state || "",
            country: brandProfile.country || "",
            zipCode: brandProfile.zipCode || "",
            companySize: brandProfile.companySize || "",
            socialMedia: {
              instagram: brandProfile.socialMedia.instagram || "",
              twitter: brandProfile.socialMedia.twitter || "",
              facebook: brandProfile.socialMedia.facebook || "",
              linkedin: brandProfile.socialMedia.linkedin || "",
              youtube: brandProfile.socialMedia.youtube || "",
              tiktok: brandProfile.socialMedia.tiktok || ""
            }
          },
          payment: paymentSettings,
          notifications
        } : {
          name: brandProfile.name || "",
          description: brandProfile.description || "",
          industry: brandProfile.industry || "",
          website: brandProfile.website || ""
        }),
      });

      if (response.ok) {
        // Show success message
        console.log(`Brand ${isUpdate ? 'updated' : 'created'} successfully`);
        // Redirect to dashboard after successful creation
        if (!isUpdate) {
          window.location.href = '/brand';
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error saving brand:', errorData);
        alert(`Failed to ${isUpdate ? 'update' : 'create'} brand: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving brand settings:', error);
      alert('Error saving brand settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading brand settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brand Setup</h1>
          <div className="text-muted-foreground mt-1">
            {brandCreated ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                Brand profile created successfully! You can continue filling out additional details.
              </div>
            ) : autoSaving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Auto-saving...
              </div>
            ) : lastSaved ? (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            ) : (
              <span>Fill out the required fields below to create your brand profile</span>
            )}
          </div>
        </div>
        {brandCreated ? (
          <Button 
            onClick={() => window.location.href = '/brand'}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Continue to Dashboard
          </Button>
        ) : (!isBasicInfoComplete() || !isContactInfoComplete()) && (
          <div className="text-sm text-muted-foreground text-right">
            <div className="space-y-1">
              <p>Complete required fields to auto-save</p>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${((hasContent(brandProfile.name) ? 1 : 0) + 
                              (hasContent(brandProfile.industry) ? 1 : 0) + 
                              (hasContent(brandProfile.description) ? 1 : 0) +
                              (hasContent(brandProfile.email) ? 1 : 0)) / 4 * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs">
                  {((hasContent(brandProfile.name) ? 1 : 0) + 
                    (hasContent(brandProfile.industry) ? 1 : 0) + 
                    (hasContent(brandProfile.description) ? 1 : 0) +
                    (hasContent(brandProfile.email) ? 1 : 0))}/4
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

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
            Brand Profile
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payment'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Payment & Billing
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
        </div>

        {/* Brand Profile Tab */}
        {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
                {isBasicInfoComplete() && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Brand Logo */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center overflow-hidden">
                  {logoPreview || brandProfile.logo ? (
                    <img 
                      src={logoPreview || brandProfile.logo} 
                      alt="Brand Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                  {logoFile && (
                    <Button 
                      size="sm" 
                      className="ml-2"
                      onClick={uploadLogo}
                    >
                      Save Logo
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="brandName" className="flex items-center gap-2">
                  Brand Name *
                  {hasContent(brandProfile.name) && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </Label>
                <Input 
                  id="brandName" 
                  value={brandProfile.name} 
                  onChange={(e) => setBrandProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your brand name"
                  className="h-10"
                />
              </div>
                <div className="space-y-2">
                  <Label htmlFor="industry" className="flex items-center gap-2">
                    Industry *
                    {hasContent(brandProfile.industry) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </Label>
                  <Select 
                    value={brandProfile.industry} 
                    onValueChange={(value) => setBrandProfile(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="fashion">Fashion & Beauty</SelectItem>
                      <SelectItem value="food">Food & Beverage</SelectItem>
                      <SelectItem value="fitness">Health & Fitness</SelectItem>
                      <SelectItem value="travel">Travel & Tourism</SelectItem>
                      <SelectItem value="gaming">Gaming & Entertainment</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="finance">Finance & Business</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select 
                    value={brandProfile.companySize} 
                    onValueChange={(value) => setBrandProfile(prev => ({ ...prev, companySize: value }))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    type="url"
                    value={brandProfile.website} 
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourbrand.com"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  Brand Description *
                  {hasContent(brandProfile.description) && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </Label>
                <Textarea 
                  id="description" 
                  value={brandProfile.description} 
                  onChange={(e) => setBrandProfile(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe your brand, mission, and what makes you unique..."
                  className=""
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
                {isContactInfoComplete() && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    Email Address *
                    {hasContent(brandProfile.email) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={brandProfile.email} 
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Please enter your email address"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={brandProfile.phone} 
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Please enter your phone number"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input 
                    id="address" 
                    value={brandProfile.address} 
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Please enter your street address"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    value={brandProfile.city} 
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Please enter your city"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input 
                    id="state" 
                    value={brandProfile.state} 
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Please enter your state/province"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input 
                    id="zipCode" 
                    value={brandProfile.zipCode} 
                    onChange={(e) => setBrandProfile(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="Please enter your ZIP/postal code"
                    className="h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media
                {isSocialMediaComplete() && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input 
                    id="instagram" 
                    value={brandProfile.socialMedia.instagram} 
                    onChange={(e) => setBrandProfile(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                    }))}
                    placeholder="Please enter your Instagram URL"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input 
                    id="twitter" 
                    value={brandProfile.socialMedia.twitter} 
                    onChange={(e) => setBrandProfile(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                    }))}
                    placeholder="Please enter your Twitter/X URL"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input 
                    id="facebook" 
                    value={brandProfile.socialMedia.facebook} 
                    onChange={(e) => setBrandProfile(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                    }))}
                    placeholder="Please enter your Facebook URL"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input 
                    id="linkedin" 
                    value={brandProfile.socialMedia.linkedin} 
                    onChange={(e) => setBrandProfile(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                    }))}
                    placeholder="Please enter your LinkedIn URL"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input 
                    id="youtube" 
                    value={brandProfile.socialMedia.youtube} 
                    onChange={(e) => setBrandProfile(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, youtube: e.target.value }
                    }))}
                    placeholder="Please enter your YouTube URL"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input 
                    id="tiktok" 
                    value={brandProfile.socialMedia.tiktok} 
                    onChange={(e) => setBrandProfile(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, tiktok: e.target.value }
                    }))}
                    placeholder="Please enter your TikTok URL"
                    className="h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Payment & Billing Tab */}
        {activeTab === 'payment' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Preferred Payment Method</Label>
                <Select 
                  value={paymentSettings.paymentMethod} 
                  onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentSettings.paymentMethod === 'stripe' && (
                <div className="space-y-2">
                  <Label htmlFor="stripeAccountId">Stripe Account ID</Label>
                  <Input 
                    id="stripeAccountId" 
                    value={paymentSettings.stripeAccountId} 
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeAccountId: e.target.value }))}
                    placeholder="acct_xxxxxxxxxxxxxxxx"
                  />
                </div>
              )}

              {paymentSettings.paymentMethod === 'paypal' && (
                <div className="space-y-2">
                  <Label htmlFor="paypalEmail">PayPal Email</Label>
                  <Input 
                    id="paypalEmail" 
                    type="email"
                    value={paymentSettings.paypalEmail} 
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalEmail: e.target.value }))}
                    placeholder="payments@yourbrand.com"
                  />
                </div>
              )}

              {(paymentSettings.paymentMethod === 'bank' || paymentSettings.paymentMethod === 'wire') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input 
                      id="bankAccountNumber" 
                      value={paymentSettings.bankAccountNumber} 
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                      placeholder="Account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input 
                      id="routingNumber" 
                      value={paymentSettings.routingNumber} 
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, routingNumber: e.target.value }))}
                      placeholder="Routing number"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={paymentSettings.currency} 
                    onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumPayout">Minimum Payout Amount</Label>
                  <Input 
                    id="minimumPayout" 
                    type="number"
                    value={paymentSettings.minimumPayout} 
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, minimumPayout: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="autoPayouts" 
                  checked={paymentSettings.autoPayouts}
                  onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, autoPayouts: checked }))}
                />
                <Label htmlFor="autoPayouts">Enable automatic payouts</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input 
                    id="taxId" 
                    value={paymentSettings.taxId} 
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, taxId: e.target.value }))}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceEmail">Invoice Email</Label>
                  <Input 
                    id="invoiceEmail" 
                    type="email"
                    value={paymentSettings.invoiceEmail} 
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, invoiceEmail: e.target.value }))}
                    placeholder="billing@yourbrand.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select 
                    value={paymentSettings.paymentTerms} 
                    onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, paymentTerms: value }))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="immediate">Due Immediately</SelectItem>
                      <SelectItem value="net15">Net 15 Days</SelectItem>
                      <SelectItem value="net30">Net 30 Days</SelectItem>
                      <SelectItem value="net60">Net 60 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Textarea 
                  id="billingAddress" 
                  value={paymentSettings.billingAddress} 
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, billingAddress: e.target.value }))}
                  rows={3}
                  placeholder="Enter complete billing address..."
                />
              </div>
            </CardContent>
          </Card>
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
                    <Label>Campaign Applications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when creators apply to campaigns</p>
                  </div>
                  <Switch 
                    checked={notifications.campaignApplications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, campaignApplications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about payment processing</p>
                  </div>
                  <Switch 
                    checked={notifications.paymentNotifications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, paymentNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly campaign performance reports</p>
                  </div>
                  <Switch 
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Monthly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive monthly analytics summaries</p>
                  </div>
                  <Switch 
                    checked={notifications.monthlyReports}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, monthlyReports: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and platform updates</p>
                  </div>
                  <Switch 
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about platform maintenance and updates</p>
                  </div>
                  <Switch 
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, systemUpdates: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}
