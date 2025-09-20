"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [role, setRole] = useState<"creator" | "brand">("creator");
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let user;
      if (isSignUp) {
        user = await signUp(email, password, name, role, brandName);
      } else {
        user = await signIn(email, password);
      }
      
      // Redirect based on the actual user's role from the server
      if (user.role === "creator") {
        router.push("/creator");
      } else if (user.role === "brand") {
        router.push("/brand");
      } else if (user.role === "admin") {
        router.push("/admin");
      } else {
        // Fallback to creator dashboard if no role is set
        router.push("/creator");
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      // Load Google Identity Services
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize Google Identity Services
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: async (response: any) => {
            try {
              const user = await signInWithGoogle(response.credential);
              
              // Redirect based on the actual user's role from the server
              if (user.role === "creator") {
                router.push("/creator");
              } else if (user.role === "brand") {
                router.push("/brand");
              } else if (user.role === "admin") {
                router.push("/admin");
              } else {
                // Fallback to creator dashboard if no role is set
                router.push("/creator");
              }
            } catch (error) {
              console.error("Google sign-in error:", error);
            } finally {
              setLoading(false);
            }
          }
        });

        // Trigger the Google sign-in popup
        window.google.accounts.id.prompt();
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setLoading(false);
    }
  };


  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/auth-background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      {/* Cliply logo in top-left */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">C</span>
          </div>
          <span className="text-white text-xl font-semibold">cliply</span>
        </div>
      </div>

      {/* Main auth modal */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? "Create your account" : "Log in to your account"}
            </h1>
          </div>

          {/* Tabs */}
          <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(value) => setIsSignUp(value === "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                Log In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <a href="#" className="text-sm text-purple-600 hover:text-purple-500">Forgot your password?</a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-700">Remember me on this device</Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log in"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{loading ? "Signing in..." : "Log in with Google"}</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">I am a...</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "creator" | "brand")}
                    className="w-full h-12 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="creator">Content Creator</option>
                    <option value="brand">Brand/Marketing Agency</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                {role === "brand" && (
                  <div className="space-y-2">
                    <Label htmlFor="brand-name" className="text-sm font-medium text-gray-700">Brand Name</Label>
                    <Input
                      id="brand-name"
                      type="text"
                      placeholder="Enter your brand name"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      required
                      className="h-12 rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-purple-600 hover:text-purple-500 font-medium"
                  >
                    Log in
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 text-sm text-white/80">
        © Cliply • Privacy & terms
      </div>
    </div>
  );
}
