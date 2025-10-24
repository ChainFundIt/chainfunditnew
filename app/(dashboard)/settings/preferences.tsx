'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, Calendar, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Settings {
  id: string;
  emailNotificationsEnabled: boolean;
  notificationEmail: string;
  notifyOnCharityDonation: boolean;
  notifyOnCampaignDonation: boolean;
  notifyOnPayoutRequest: boolean;
  notifyOnLargeDonation: boolean;
  largeDonationThreshold: string;
  pushNotificationsEnabled: boolean;
  dailySummaryEnabled: boolean;
  weeklySummaryEnabled: boolean;
  summaryTime: string;
}

export default function Preferences() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setError(null);
      const response = await fetch('/api/settings/preferences');
      
      if (!response.ok) {
        throw new Error('Failed to load preferences');
      }
      
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      const errorMessage = 'Failed to load your notification preferences. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save preferences');
      }

      const data = await response.json();
      setSettings(data.settings);
      toast.success('Your notification preferences have been saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-red-100 p-3 mb-4">
                  <Bell className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Preferences</h3>
                <p className="text-red-700 mb-4 max-w-md">
                  {error}
                </p>
                <Button onClick={fetchSettings} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Preferences</h1>
          <p className="text-gray-600">Control how and when you receive notifications about your campaigns</p>
        </div>

        <div className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Manage email notifications for your campaigns and donations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive emails about your campaign activity and updates
                  </p>
                </div>
                <Switch
                  checked={settings?.emailNotificationsEnabled}
                  onCheckedChange={(checked) => updateSetting('emailNotificationsEnabled', checked)}
                />
              </div>

              {settings?.emailNotificationsEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Notification Email</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    placeholder="johndoe@gmail.com"
                    value={settings?.notificationEmail || ''}
                    onChange={(e) => updateSetting('notificationEmail', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Leave blank to use your default email
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donation Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Donation Alerts
              </CardTitle>
              <CardDescription>
                Choose which donation activities trigger notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Campaign Donations</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when someone donates to your campaign
                  </p>
                </div>
                <Switch
                  checked={settings?.notifyOnCampaignDonation}
                  onCheckedChange={(checked) => updateSetting('notifyOnCampaignDonation', checked)}
                  disabled={!settings?.emailNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Large Donations</Label>
                  <p className="text-sm text-gray-500">
                    Get special alerts when your campaign receives large donations
                  </p>
                </div>
                <Switch
                  checked={settings?.notifyOnLargeDonation}
                  onCheckedChange={(checked) => updateSetting('notifyOnLargeDonation', checked)}
                  disabled={!settings?.emailNotificationsEnabled}
                />
              </div>

              {settings?.notifyOnLargeDonation && settings?.emailNotificationsEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-yellow-400">
                  <Label htmlFor="threshold">Large Donation Threshold (USD)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="1000"
                    value={settings?.largeDonationThreshold || '1000'}
                    onChange={(e) => updateSetting('largeDonationThreshold', e.target.value)}
                    min="1"
                  />
                  <p className="text-xs text-gray-500">
                    You'll get special alerts for donations above this amount
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payout Updates</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when your campaign payouts are ready
                  </p>
                </div>
                <Switch
                  checked={settings?.notifyOnPayoutRequest}
                  onCheckedChange={(checked) => updateSetting('notifyOnPayoutRequest', checked)}
                  disabled={!settings?.emailNotificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Summary Reports
              </CardTitle>
              <CardDescription>
                Get periodic summaries of your campaign performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Summary</Label>
                  <p className="text-sm text-gray-500">
                    Get a daily report of your campaign donations and activity
                  </p>
                </div>
                <Switch
                  checked={settings?.dailySummaryEnabled}
                  onCheckedChange={(checked) => updateSetting('dailySummaryEnabled', checked)}
                  disabled={!settings?.emailNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Summary</Label>
                  <p className="text-sm text-gray-500">
                    Get a weekly overview of your campaign performance
                  </p>
                </div>
                <Switch
                  checked={settings?.weeklySummaryEnabled}
                  onCheckedChange={(checked) => updateSetting('weeklySummaryEnabled', checked)}
                  disabled={!settings?.emailNotificationsEnabled}
                />
              </div>

              {(settings?.dailySummaryEnabled || settings?.weeklySummaryEnabled) && settings?.emailNotificationsEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-blue-400">
                  <Label htmlFor="summaryTime">Preferred Delivery Time</Label>
                  <Input
                    id="summaryTime"
                    type="time"
                    value={settings?.summaryTime || '09:00'}
                    onChange={(e) => updateSetting('summaryTime', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Choose when you'd like to receive your summary reports
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Get browser notifications for important events (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive browser notifications
                  </p>
                </div>
                <Switch
                  checked={settings?.pushNotificationsEnabled}
                  onCheckedChange={(checked) => updateSetting('pushNotificationsEnabled', checked)}
                  disabled={true}
                />
              </div>
              <p className="text-xs text-gray-400 mt-4">
                📌 Push notifications coming soon! You'll be able to receive real-time browser alerts.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={fetchSettings}
              disabled={saving}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-32"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">How Your Notifications Work</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Campaign Donations:</strong> Get instant alerts when someone supports your campaign</li>
                    <li>• <strong>Large Donation Alerts:</strong> Special notifications for major contributions to your campaign</li>
                    <li>• <strong>Payout Updates:</strong> Know when your campaign funds are ready to withdraw</li>
                    <li>• <strong>Summary Reports:</strong> Periodic overviews of your campaign's performance</li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-3">
                    💡 Tip: Keep notifications enabled to stay connected with your supporters!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

