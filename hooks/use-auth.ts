"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
  fullName: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current user from auth token
  const getCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use the same endpoint as the user profile system
      const response = await fetch('/api/user/profile', {
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.user) {
          setUser(userData.user);
          console.log('User authenticated:', userData.user);
        } else {
          setUser(null);
          console.log('Failed to get user data');
        }
      } else {
        setUser(null);
        console.log('Auth token invalid or expired');
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // This would typically call the Better Auth login endpoint
      console.log("Sign in:", { email, password });
      // After successful login, refresh user data
      await getCurrentUser();
    } catch (error) {
      console.error('Error in login:', error);
    }
  }, [getCurrentUser]);

  const logout = useCallback(async () => {
    try {
      // Clear user state
      setUser(null);
      console.log('User logged out');
      
      // Redirect to signin page
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error during logout:', error);
      setUser(null);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      // This would typically call the Better Auth signup endpoint
      console.log("Signup:", { email, password, fullName });
      // After successful signup, refresh user data
      await getCurrentUser();
    } catch (error) {
      console.error('Error in signup:', error);
    }
  }, [getCurrentUser]);

  return {
    user,
    loading,
    login,
    logout,
    signup,
    refreshUser: getCurrentUser,
  };
} 