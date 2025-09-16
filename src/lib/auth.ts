"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

// User interface for client-side
export interface User {
  id: string;
  email: string;
  role?: 'creator' | 'brand' | 'admin';
  is_admin?: boolean;
  theme_preference?: 'light' | 'dark' | 'system';
  display_name?: string | null;
}

// Client-side auth hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token with server
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          // Restore user's theme preference
          if (data.user.theme_preference) {
            setTheme(data.user.theme_preference);
          }
        } else {
          localStorage.removeItem('auth_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const getDefaultRoute = (role?: string) => {
    switch (role) {
      case 'brand':
        return '/brand';
      case 'creator':
        return '/creator';
      case 'admin':
        return '/admin';
      default:
        return '/auth';
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Log in failed');
    }

    const { user, token } = await response.json();
    localStorage.setItem('auth_token', token);
    setUser(user);
    // Restore user's theme preference on login
    if (user.theme_preference) {
      setTheme(user.theme_preference);
    }
    return user;
  };

  const signUp = async (email: string, password: string, name?: string, role?: 'creator' | 'brand', brandName?: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, role, brandName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign up failed');
    }

    const { user, token } = await response.json();
    localStorage.setItem('auth_token', token);
    setUser(user);
    // Restore user's theme preference on signup (defaults to light)
    if (user.theme_preference) {
      setTheme(user.theme_preference);
    }
    return user;
  };

  const signInWithGoogle = async (credential: string) => {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Google sign-in failed');
    }

    const { user, token } = await response.json();
    localStorage.setItem('auth_token', token);
    setUser(user);
    // Restore user's theme preference on login
    if (user.theme_preference) {
      setTheme(user.theme_preference);
    }
    return user;
  };

  const signOut = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Call server to invalidate token
      fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(console.error);
      
      localStorage.removeItem('auth_token');
    }
    setUser(null);
  };

  return { user, loading, signIn, signUp, signInWithGoogle, signOut };
}
