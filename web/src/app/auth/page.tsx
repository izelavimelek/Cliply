"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Building2, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"creator" | "brand" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!email.trim()) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    
    if (isSignUp && !selectedRole) {
      setError("Please select whether you're a creator or brand");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!selectedRole) {
          setError("Please select a role");
          return;
        }
        await signUp(email, password, selectedRole);
        router.push("/onboarding");
      } else {
        await signIn(email, password);
        router.push("/dashboard");
      }
    } catch (err: any) {
      // Better error handling with specific messages
      let errorMessage = "An error occurred. Please try again.";
      
      if (err.message) {
        // Handle specific error messages
        if (err.message.includes("Invalid credentials") || err.message.includes("Invalid email or password")) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (err.message.includes("User not found")) {
          errorMessage = "No account found with this email. Please sign up first.";
        } else if (err.message.includes("Email already exists")) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } else if (err.message.includes("Password too short")) {
          errorMessage = "Password must be at least 6 characters long.";
        } else if (err.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address.";
        } else if (err.message.includes("<!DOCTYPE")) {
          errorMessage = "Server error. Please try again in a moment.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: "creator" | "brand") => {
    setSelectedRole(role);
    setError(""); // Clear any previous errors
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            Cliply
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <Card className="shadow-lg border-border">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isSignUp 
                  ? "Join thousands of creators and brands" 
                  : "Sign in to your Cliply account"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Role Selection (Sign Up Only) */}
              {isSignUp && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">I am a...</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect("creator")}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedRole === "creator"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Users className={`w-6 h-6 ${
                          selectedRole === "creator" ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <span className="font-medium">Creator</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleRoleSelect("brand")}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedRole === "brand"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className={`w-6 h-6 ${
                          selectedRole === "brand" ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <span className="font-medium">Brand</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                                 <div className="space-y-2">
                   <Label htmlFor="email" className="text-sm font-medium text-foreground">
                     Email
                   </Label>
                   <Input
                     id="email"
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     placeholder="Enter your email"
                     className="border-border focus:border-primary focus:ring-primary"
                     onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit(e as any)}
                   />
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="password" className="text-sm font-medium text-foreground">
                     Password
                   </Label>
                   <Input
                     id="password"
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     placeholder="Enter your password"
                     className="border-border focus:border-primary focus:ring-primary"
                     onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit(e as any)}
                   />
                   {isSignUp && (
                     <p className="text-xs text-muted-foreground">
                       Must be at least 6 characters long
                     </p>
                   )}
                 </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-destructive rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive mb-1">Authentication Error</p>
                        <p className="text-sm text-destructive/80">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                  disabled={loading || (isSignUp && !selectedRole)}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isSignUp ? "Creating..." : "Signing In..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isSignUp ? "Create Account" : "Sign In"}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Toggle Sign Up/Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setSelectedRole(null);
                    setError("");
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isSignUp 
                    ? "Already have an account? Sign in" 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          {isSignUp && (
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Free to get started</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
