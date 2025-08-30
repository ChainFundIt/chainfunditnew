"use client";

import React, { useState, useEffect } from 'react';
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import SessionWarningModal from '@/components/auth/SessionWarningModal';
import SessionTimeoutModal from '@/components/auth/SessionTimeoutModal';

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
  config?: {
    timeoutMinutes?: number;
    checkInterval?: number;
  };
}

const SessionTimeoutProvider: React.FC<SessionTimeoutProviderProps> = ({
  children,
  config = {},
}) => {
  const [isClient, setIsClient] = useState(false);

  // Only render on client side to prevent SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on server side
  if (!isClient) {
    return <>{children}</>;
  }

  console.log('SessionTimeoutProvider: Starting component initialization');
  console.log('SessionTimeoutProvider: Config received:', config);
  
  // Call the hook directly without try-catch to avoid potential issues
  const sessionTimeoutData = useSessionTimeout(config);
  
  console.log('SessionTimeoutProvider: useSessionTimeout called successfully:', sessionTimeoutData);

  // Destructure with safe defaults
  const {
    showTimeoutModal = false,
    showWarningModal = false,
    timeRemaining = null,
    extendSession = () => {},
    closeTimeoutModal = () => {},
    handleSessionExpired = () => {},
  } = sessionTimeoutData || {};

  console.log('SessionTimeoutProvider: Data destructured successfully:', {
    showTimeoutModal,
    showWarningModal,
    timeRemaining,
    extendSession: typeof extendSession,
    closeTimeoutModal: typeof closeTimeoutModal,
    handleSessionExpired: typeof handleSessionExpired,
  });

  const handleLogin = () => {
    console.log('SessionTimeoutProvider: handleLogin called');
    if (typeof handleSessionExpired === 'function') {
      console.log('SessionTimeoutProvider: Calling handleSessionExpired');
      handleSessionExpired();
    } else {
      console.warn('SessionTimeoutProvider: handleSessionExpired is not a function:', typeof handleSessionExpired);
    }
  };

  console.log('SessionTimeoutProvider: About to render with modals');

  return (
    <>
      {children}
      
      {/* Session Warning Modal */}
      <SessionWarningModal
        isOpen={showWarningModal}
        onClose={closeTimeoutModal}
        onExtend={extendSession}
        timeRemaining={timeRemaining}
      />
      
      {/* Session Timeout Modal */}
      <SessionTimeoutModal
        isOpen={showTimeoutModal}
        onClose={closeTimeoutModal}
        onLogin={handleLogin}
      />
    </>
  );
};

export default SessionTimeoutProvider;

