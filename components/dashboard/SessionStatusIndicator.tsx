"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Shield, AlertTriangle } from 'lucide-react';
import { useSessionTimeout } from '@/hooks/use-session-timeout';

const SessionStatusIndicator: React.FC = () => {
  // Set this to false to disable session timeout entirely
  const SESSION_TIMEOUT_ENABLED = true;
  
  const { timeRemaining, showWarningModal } = useSessionTimeout({
    timeoutMinutes: 120, // 2 hours
    warningMinutes: 15, // 15 minutes warning
    enabled: SESSION_TIMEOUT_ENABLED,
  });
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    if (showWarningModal) return 'text-red-600';
    if (timeRemaining && timeRemaining < 300) return 'text-amber-600'; // Less than 5 minutes
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (showWarningModal) return <AlertTriangle className="w-4 h-4" />;
    if (timeRemaining && timeRemaining < 300) return <AlertTriangle className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (showWarningModal) return 'Session Expiring Soon!';
    if (timeRemaining && timeRemaining < 300) return 'Session Expiring Soon';
    return 'Session Active';
  };

  if (!timeRemaining && !showWarningModal) return null;

  return (
    <div className="relative">
      {/* Main Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:shadow-md ${
          showWarningModal 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-green-50 border-green-200 text-green-700'
        }`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {timeRemaining && (
          <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">
            {formatTime(timeRemaining)}
          </span>
        )}
        <Clock className="w-3 h-3" />
      </button>

      {/* Details Popup */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Session Status:</span>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            
            {timeRemaining && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Time Remaining:</span>
                <span className="text-sm font-mono font-medium text-gray-900">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed">
                💡 <strong>Tip:</strong> Move your mouse or click anywhere to extend your session. 
                Sessions automatically expire after 2 hours of inactivity.
                {!SESSION_TIMEOUT_ENABLED && (
                  <span className="text-green-600 font-medium"> Session timeout is currently disabled.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionStatusIndicator;

