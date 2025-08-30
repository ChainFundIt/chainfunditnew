"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, AlertTriangle, Shield, User } from 'lucide-react';
import { useSessionTimeout } from '@/hooks/use-session-timeout';

export default function TestSessionPage() {
  const [customTimeout, setCustomTimeout] = useState(2); // 2 minutes for testing
  const [customWarning, setCustomWarning] = useState(1); // 1 minute warning
  
  const {
    showTimeoutModal,
    showWarningModal,
    timeRemaining,
    extendSession,
    closeTimeoutModal,
    handleSessionExpired,
  } = useSessionTimeout({
    timeoutMinutes: customTimeout,
    warningMinutes: customWarning,
    checkInterval: 10000, // Check every 10 seconds for testing
  });

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const simulateActivity = () => {
    // Simulate user activity by dispatching a mouse event
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
  };

  const forceSessionExpiry = () => {
    handleSessionExpired();
  };

  return (
    <div className="min-h-screen bg-[#E5ECDE] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#104901] mb-2">
            Session Timeout Test Page
          </h1>
          <p className="text-lg text-[#5F8555]">
            Test the session timeout functionality with configurable settings
          </p>
        </div>

        {/* Configuration Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Timeout Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#104901]" />
                Timeout Configuration
              </CardTitle>
              <CardDescription>
                Adjust session timeout settings for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timeout">Session Timeout (minutes)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1"
                  max="60"
                  value={customTimeout}
                  onChange={(e) => setCustomTimeout(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="warning">Warning Time (minutes)</Label>
                <Input
                  id="warning"
                  type="number"
                  min="1"
                  max={customTimeout - 1}
                  value={customWarning}
                  onChange={(e) => setCustomWarning(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p><strong>Current Settings:</strong></p>
                <p>• Session expires after {customTimeout} minutes of inactivity</p>
                <p>• Warning shows {customWarning} minutes before expiry</p>
                <p>• Check interval: 10 seconds (for testing)</p>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#104901]" />
                Current Status
              </CardTitle>
              <CardDescription>
                Real-time session status information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Warning Modal:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    showWarningModal ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {showWarningModal ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Timeout Modal:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    showTimeoutModal ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {showTimeoutModal ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time Remaining:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {timeRemaining ? formatTime(timeRemaining) : 'N/A'}
                  </span>
                </div>
              </div>
              
              {timeRemaining && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Session will expire in {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#104901]" />
              Test Actions
            </CardTitle>
            <CardDescription>
              Simulate user activity and test session behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                onClick={simulateActivity}
                className="bg-[#104901] hover:bg-[#0d3d01] text-white"
              >
                Simulate User Activity
              </Button>
              
              <Button
                onClick={extendSession}
                variant="outline"
                className="border-[#104901] text-[#104901] hover:bg-[#104901] hover:text-white"
                disabled={!showWarningModal && !showTimeoutModal}
              >
                Extend Session
              </Button>
              
              <Button
                onClick={forceSessionExpiry}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                Force Session Expiry
              </Button>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <p><strong>How to test:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Set a short timeout (e.g., 2 minutes) and warning (1 minute)</li>
                <li>Wait for the warning modal to appear</li>
                <li>Test the "Extend Session" button</li>
                <li>Wait for the timeout modal to appear</li>
                <li>Test the auto-redirect functionality</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
            <CardDescription>
              Step-by-step guide to test session timeout functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#104901] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-[#104901]">Configure Timeout</h4>
                  <p className="text-sm text-gray-600">
                    Set a short timeout (2-3 minutes) and warning time (1 minute) for quick testing.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#104901] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-[#104901]">Wait for Warning</h4>
                  <p className="text-sm text-gray-600">
                    After the warning time, a modal will appear showing time remaining. You can extend the session or let it expire.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#104901] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-[#104901]">Test Timeout</h4>
                  <p className="text-sm text-gray-600">
                    If no action is taken, the session will expire and show the timeout modal with auto-redirect to login.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#104901] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-[#104901]">Simulate Activity</h4>
                  <p className="text-sm text-gray-600">
                    Use the "Simulate User Activity" button to reset the session timer and test the activity detection.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

