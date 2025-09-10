"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  isCollapsed?: boolean;
}

export function LogoutButton({ 
  variant = "ghost", 
  size = "default", 
  className,
  showText = true,
  isCollapsed = false
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const router = useRouter();
  const { setTheme, theme: currentTheme } = useTheme();

  const handleLogout = async () => {
    try {
      // Save current theme preference to user profile
      const token = localStorage.getItem('auth_token');
      if (token && currentTheme) {
        try {
          await fetch('/api/profile/theme', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ theme_preference: currentTheme }),
          });
        } catch (error) {
          console.error('Failed to save theme preference:', error);
        }
      }
      
      // Reset theme to light mode before logout
      setTheme("light");
      
      // Sign out user
      signOut();
      
      // Navigate to auth page
      router.push("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={isCollapsed ? "icon" : size}
      onClick={handleLogout}
      className={cn(
        "transition-all duration-200 hover:bg-destructive/10 hover:text-destructive",
        isCollapsed ? "h-7 w-7 p-0" : "",
        className
      )}
      title={isCollapsed ? "Logout" : undefined}
    >
      <LogOut className={cn(
        "transition-all duration-300",
        isCollapsed ? "h-3.5 w-3.5" : "h-4 w-4"
      )} />
      {showText && !isCollapsed && (
        <span className="ml-2 transition-all duration-300">Logout</span>
      )}
    </Button>
  );
}
