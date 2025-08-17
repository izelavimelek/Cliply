"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type Role = "creator" | "brand";
type Step = "role" | "profile" | "brand" | "complete";

export default function OnboardingPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<Step>("role");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    bio: "",
    website: "",
    socialLinks: {
      instagram: "",
      youtube: "",
      tiktok: "",
    },
  });
  const [brandData, setBrandData] = useState({
    name: "",
    description: "",
    industry: "",
    website: "",
  });
  const router = useRouter();
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep("profile");
  };

  const handleProfileSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update profile with role and data
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          display_name: profileData.displayName,
          bio: profileData.bio,
          website: profileData.website,
          social_links: profileData.socialLinks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      if (role === "brand") {
        setStep("brand");
      } else {
        setStep("complete");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create brand
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: brandData.name,
          description: brandData.description,
          industry: brandData.industry,
          website: brandData.website,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create brand');
      }

      setStep("complete");
    } catch (error) {
      console.error("Error creating brand:", error);
      alert("Error creating brand. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (role === "creator") {
      router.push("/creator");
    } else {
      router.push("/brand");
    }
  };

  if (step === "role") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="mx-auto max-w-4xl px-6">
                  <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Cliply!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Let's get you set up. First, tell us how you'll be using Cliply.
          </p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 hover:border-blue-300"
              onClick={() => handleRoleSelect("creator")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">Creator</CardTitle>
                <CardDescription>
                  I create content and want to earn from brand partnerships
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Discover brand campaigns</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Earn from your content</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Track performance analytics</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Grow your audience</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 hover:border-blue-300"
              onClick={() => handleRoleSelect("brand")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Brand</CardTitle>
                <CardDescription>
                  I represent a brand and want to work with creators
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Create marketing campaigns</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Discover authentic creators</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Track campaign performance</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Scale your reach</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (step === "profile") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {role === "creator" ? "Tell us about yourself as a creator" : "Tell us about your brand"}
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                This information helps brands and creators discover you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  placeholder={role === "creator" ? "Your creator name" : "Brand name"}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder={role === "creator" ? "Tell us about your content and audience" : "Tell us about your brand and mission"}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Website (optional)</label>
                <Input
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              {role === "creator" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Social Media Links (optional)</label>
                  <Input
                    value={profileData.socialLinks.instagram}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      socialLinks: { ...profileData.socialLinks, instagram: e.target.value }
                    })}
                    placeholder="Instagram username"
                  />
                  <Input
                    value={profileData.socialLinks.youtube}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      socialLinks: { ...profileData.socialLinks, youtube: e.target.value }
                    })}
                    placeholder="YouTube channel"
                  />
                  <Input
                    value={profileData.socialLinks.tiktok}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      socialLinks: { ...profileData.socialLinks, tiktok: e.target.value }
                    })}
                    placeholder="TikTok username"
                  />
                </div>
              )}

              <Button 
                onClick={handleProfileSubmit} 
                disabled={loading || !profileData.displayName}
                className="w-full"
              >
                {loading ? "Saving..." : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "brand") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tell Us About Your Brand
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              This helps creators understand your brand and campaigns
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Brand Information</CardTitle>
              <CardDescription>
                Create your brand profile to start building campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Brand Name</label>
                <Input
                  value={brandData.name}
                  onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
                  placeholder="Your brand name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={brandData.description}
                  onChange={(e) => setBrandData({ ...brandData, description: e.target.value })}
                  placeholder="What does your brand do? What's your mission?"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Industry</label>
                <Input
                  value={brandData.industry}
                  onChange={(e) => setBrandData({ ...brandData, industry: e.target.value })}
                  placeholder="e.g., Fashion, Tech, Food, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={brandData.website}
                  onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
                  placeholder="https://yourbrand.com"
                />
              </div>

              <Button 
                onClick={handleBrandSubmit} 
                disabled={loading || !brandData.name}
                className="w-full"
              >
                {loading ? "Creating Brand..." : "Create Brand"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Cliply!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Your {role === "creator" ? "creator" : "brand"} profile is all set up and ready to go.
            </p>
          </div>

          <Card className="shadow-xl mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="font-medium">Profile Created</span>
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                {role === "brand" && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="font-medium">Brand Profile</span>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="font-medium">Account Verified</span>
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleComplete} size="lg" className="w-full">
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
