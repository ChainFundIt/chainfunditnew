'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorRecoveryProps {
  userEmail: string;
  userRole: 'admin' | 'super_admin';
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorRecovery({ userEmail, userRole, onSuccess, onCancel }: TwoFactorRecoveryProps) {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRecovery = async () => {
    if (!email.trim() || !confirmEmail.trim()) {
      setError('Please enter and confirm your email address');
      return;
    }

    if (email !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    if (email !== userEmail) {
      setError('Email does not match your account email');
      return;
    }

    if (userRole !== 'super_admin') {
      setError('Recovery is only available for super admins. Please contact support.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/2fa/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          confirmEmail: confirmEmail.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('2FA has been disabled. Please set it up again.');
        onSuccess();
      } else {
        setError(data.error || 'Recovery failed');
      }
    } catch (err) {
      console.error('Recovery error:', err);
      setError('Failed to recover account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Recover 2FA Access
        </CardTitle>
        <CardDescription>
          Emergency recovery for lost authenticator access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This will disable 2FA on your account. 
            {userRole === 'super_admin' 
              ? ' As a super admin, you can recover access by confirming your email.'
              : ' Recovery is only available for super admins. Please contact support.'}
          </AlertDescription>
        </Alert>

        {userRole === 'super_admin' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Your Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={userEmail}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmEmail">Confirm Email Address</Label>
              <Input
                id="confirmEmail"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Re-enter your email"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Type your email address twice to confirm
              </p>
            </div>

            <Button
              onClick={handleRecovery}
              disabled={isLoading || !email.trim() || !confirmEmail.trim()}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? 'Recovering...' : 'Disable 2FA & Recover Access'}
            </Button>
          </>
        ) : (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Recovery is only available for super admins. Please contact your system administrator 
              or use a backup code if you have one.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center">
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}