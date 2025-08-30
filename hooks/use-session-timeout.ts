"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';

interface SessionTimeoutConfig {
  timeoutMinutes?: number; // Default: 30 minutes
  warningMinutes?: number; // Default: 5 minutes before expiry
  checkInterval?: number; // Default: 1 minute
}

export const useSessionTimeout = (config: SessionTimeoutConfig = {}) => {
  console.log('useSessionTimeout: Starting hook initialization');
  
  const {
    timeoutMinutes = 30,
    warningMinutes = 5,
    checkInterval = 60000, // 1 minute in milliseconds
  } = config;

  console.log('useSessionTimeout: Config loaded:', { timeoutMinutes, warningMinutes, checkInterval });

  // Hooks must be called at the top level - no try-catch around hook calls
  console.log('useSessionTimeout: About to call useAuth');
  const authData = useAuth();
  console.log('useSessionTimeout: Auth data loaded successfully:', authData);

  // Safely destructure auth data with fallbacks
  const user = authData?.user || null;
  const logout = authData?.logout || (() => Promise.resolve());
  
  console.log('useSessionTimeout: User and logout extracted:', { user: !!user, logout: typeof logout });
  
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const lastActivityRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  console.log('useSessionTimeout: State initialized');

  // Reset session timer on user activity - simplified for React 19 compatibility
  const resetSessionTimer = useCallback(() => {
    console.log('useSessionTimeout: resetSessionTimer called');
    if (user) {
      lastActivityRef.current = Date.now();
      sessionStartRef.current = Date.now();
      setTimeRemaining(null);
      
      // Clear existing timers
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      
      // Set new timers
      const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
      const timeoutTime = timeoutMinutes * 60 * 1000;
      
      // Show warning modal
      warningRef.current = setTimeout(() => {
        if (user) {
          setShowWarningModal(true);
          setTimeRemaining(warningMinutes * 60);
        }
      }, warningTime);
      
      // Show timeout modal
      timeoutRef.current = setTimeout(() => {
        if (user) {
          setShowTimeoutModal(true);
          setShowWarningModal(false);
        }
      }, timeoutTime);
    }
  }, [user, timeoutMinutes, warningMinutes]);

  // Handle user activity events
  const handleUserActivity = useCallback(() => {
    if (user) {
      resetSessionTimer();
    }
  }, [user, resetSessionTimer]);

  // Logout and redirect to login
  const handleSessionExpired = useCallback(async () => {
    console.log('useSessionTimeout: handleSessionExpired called');
    try {
      if (logout && typeof logout === 'function') {
        await logout();
      }
      setShowTimeoutModal(false);
      setShowWarningModal(false);
      
      // For now, just log the redirect instead of actually redirecting
      console.log('useSessionTimeout: Would redirect to /signin?message=session_expired');
      
    } catch (error) {
      console.error('Error during logout:', error);
      setShowTimeoutModal(false);
      setShowWarningModal(false);
    }
  }, [logout]);

  // Extend session
  const extendSession = useCallback(() => {
    if (user) {
      resetSessionTimer();
      setShowWarningModal(false);
      setShowTimeoutModal(false);
    }
  }, [user, resetSessionTimer]);

  // Close modals
  const closeTimeoutModal = useCallback(() => {
    setShowTimeoutModal(false);
    setShowWarningModal(false);
  }, []);

  console.log('useSessionTimeout: Callbacks defined');

  // Set up activity listeners
  useEffect(() => {
    console.log('useSessionTimeout: Setting up activity listeners');
    if (!user) {
      // Clear timers if no user
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      setShowTimeoutModal(false);
      setShowWarningModal(false);
      return;
    }

    // Initialize session timer
    resetSessionTimer();

    // Activity event listeners
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'visibilitychange'
    ];

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Periodic check for session expiry
    const intervalId = setInterval(() => {
      if (user) {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;
        const sessionDuration = now - sessionStartRef.current;
        
        // Check if session should expire
        if (timeSinceLastActivity > timeoutMinutes * 60 * 1000) {
          handleSessionExpired();
        } else if (sessionDuration > (timeoutMinutes - warningMinutes) * 60 * 1000) {
          // Show warning if approaching expiry
          const remaining = Math.max(0, timeoutMinutes * 60 - timeSinceLastActivity / 1000);
          setTimeRemaining(Math.floor(remaining));
        }
      }
    }, checkInterval);

    return () => {
      // Cleanup event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      
      // Cleanup timers
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      
      // Cleanup interval
      clearInterval(intervalId);
    };
  }, [user, timeoutMinutes, warningMinutes, checkInterval, handleUserActivity, resetSessionTimer, handleSessionExpired]);

  // Update countdown for warning modal
  useEffect(() => {
    if (showWarningModal && timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev !== null ? Math.max(0, prev - 1) : null);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (showWarningModal && timeRemaining === 0) {
      // Auto-logout when warning countdown reaches 0
      handleSessionExpired();
    }
  }, [showWarningModal, timeRemaining, handleSessionExpired]);

  console.log('useSessionTimeout: Hook initialization complete, returning data');

  return {
    showTimeoutModal,
    showWarningModal,
    timeRemaining,
    extendSession,
    closeTimeoutModal,
    handleSessionExpired,
  };
};

