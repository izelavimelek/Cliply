"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export default function SetupBrandPage() {
  const [loading, setLoading] = useState(false);
  const [brandData, setBrandData] = useState({
    name: "",
    description: "",
    industry: "",
    website: "",
  });
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(brandData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create brand');
      }

      // Redirect to brand dashboard
      router.push('/brand');
    } catch (error) {
      console.error('Error creating brand:', error);
      alert(error instanceof Error ? error.message : 'Error creating brand');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to set up your brand.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Up Your Brand</CardTitle>
          <CardDescription>
            Create your brand profile to get started with campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                value={brandData.name}
                onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
                placeholder="Enter your brand name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={brandData.description}
                onChange={(e) => setBrandData({ ...brandData, description: e.target.value })}
                placeholder="Describe your brand"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={brandData.industry}
                onChange={(e) => setBrandData({ ...brandData, industry: e.target.value })}
                placeholder="e.g., Technology, Fashion, Food"
              />
            </div>
            
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={brandData.website}
                onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
                placeholder="https://yourbrand.com"
                type="url"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Brand"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
