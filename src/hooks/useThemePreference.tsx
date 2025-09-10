"use client";

import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export function useThemePreference() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  // Save theme preference when it changes
  useEffect(() => {
    if (theme && user) {
      const saveThemePreference = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (token) {
            await fetch('/api/profile/theme', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ theme_preference: theme }),
            });
          }
        } catch (error) {
          console.error('Failed to save theme preference:', error);
        }
      };

      // Debounce the save operation to avoid too many API calls
      const timeoutId = setTimeout(saveThemePreference, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [theme, user]);

  return { theme, setTheme };
}
