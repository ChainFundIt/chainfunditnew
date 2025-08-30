"use client";

import React, { useEffect } from 'react';
import { Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: () => void;
  timeRemaining: number | null;
}

const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  isOpen,
  onClose,
  onExtend,
  timeRemaining,
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Session Expiring Soon
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-4 leading-relaxed">
          Your session will expire in a few minutes due to inactivity. 
          Would you like to extend your session?
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="text-lg font-semibold text-amber-700">
            {timeRemaining !== null ? formatTime(timeRemaining) : '5:00'}
          </span>
          <span className="text-sm text-amber-600">remaining</span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onExtend}
            className="w-full bg-[#104901] hover:bg-[#0d3d01] text-white h-12 text-base font-medium"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Extend Session
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-10"
          >
            Continue Working
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Note:</strong> Your session will automatically expire if no action is taken.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;

