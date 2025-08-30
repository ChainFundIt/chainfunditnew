"use client";

import React, { useEffect, useState } from 'react';
import { AlertTriangle, LogIn, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [countdown, setCountdown] = useState(30);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isOpen && countdown === 0) {
      // Auto-redirect to login after countdown
      onLogin();
    }
  }, [isOpen, countdown, onLogin]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(30);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Session Expired
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Your session has timed out for security reasons. Please log in again to continue.
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Auto-redirect in <span className="font-semibold text-amber-600">{countdown}s</span>
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onLogin}
            className="w-full bg-[#104901] hover:bg-[#0d3d01] text-white h-12 text-base font-medium"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Log In Now
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-10"
          >
            Stay on Page
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> For security, sessions automatically expire after 30 minutes of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;

