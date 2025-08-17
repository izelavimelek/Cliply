"use client";

import { useState, useEffect } from 'react';

// User interface for client-side
export interface User {
  id: string;
  email: string;
  role?: 'creator' | 'brand' | 'admin';
  is_admin?: boolean;
}

// Client-side auth hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      throw new Error(error.message || 'Sign in failed');
    }

    const { user, token } = await response.json();
    localStorage.setItem('auth_token', token);
    setUser(user);
    return user;
  };

  const signUp = async (email: string, password: string, role?: 'creator' | 'brand') => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign up failed');
    }

    const { user, token } = await response.json();
    localStorage.setItem('auth_token', token);
    setUser(user);
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

  return { user, loading, signIn, signUp, signOut };
}
