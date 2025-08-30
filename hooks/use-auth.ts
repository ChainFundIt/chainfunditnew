"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
  fullName: string;
}

export function useAuth() {
  console.log('useAuth: Starting hook initialization');
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('useAuth: State initialized');

  useEffect(() => {
    console.log('useAuth: useEffect running');
    try {
      // TODO: Implement actual auth logic
      // This is a placeholder for the auth hook
      console.log('useAuth: Setting loading to false');
      setLoading(false);
    } catch (error) {
      console.error('useAuth: Error in useEffect:', error);
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    console.log('useAuth: login called');
    try {
      // TODO: Implement login logic
      console.log("Sign in:", { email, password });
    } catch (error) {
      console.error('useAuth: Error in login:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('useAuth: logout called');
    try {
      // TODO: Implement logout logic
      console.log('useAuth: Setting user to null');
      setUser(null);
      // Clear any stored tokens or session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('useAuth: Error during logout:', error);
      // Ensure user state is cleared even if logout fails
      setUser(null);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    console.log('useAuth: signup called');
    try {
      // TODO: Implement signup logic
      console.log("Signup:", { email, password, fullName });
    } catch (error) {
      console.error('useAuth: Error in signup:', error);
    }
  }, []);

  const result = {
    user,
    loading,
    login,
    logout,
    signup,
  };

  console.log('useAuth: Returning result:', result);
  return result;
} 