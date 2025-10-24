'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, Calendar, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AdminSettings {
  id: string;
  emailNotificationsEnabled: boolean;
  notificationEmail: string;
  notifyOnCharityDonation: boolean;
  notifyOnCampaignDonation: boolean;
  notifyOnPayoutRequest: boolean;
  notifyOnLargeDonation: boolean;
  notifyOnAccountChangeRequest: boolean;
  largeDonationThreshold: string;
  pushNotificationsEnabled: boolean;
  dailySummaryEnabled: boolean;
  weeklySummaryEnabled: boolean;
  summaryTime: string;
}

export default function AdminNotificationSettings() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/notifications');
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof AdminSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Settings</h1>
          <p className="text-gray-600">Manage how you receive notifications about charity donations and platform activities</p>
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
                Receive email alerts when important events occur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive emails for donation alerts and updates
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
                    placeholder="admin@example.com"
                    value={settings?.notificationEmail || ''}
                    onChange={(e) => updateSetting('notificationEmail', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Leave blank to use your default admin email
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
                Get notified when donations are received
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Charity Donations</Label>
                  <p className="text-sm text-gray-500">
                    Get notified for every charity donation
                  </p>
                </div>
                <Switch
                  checked={settings?.notifyOnCharityDonation}
                  onCheckedChange={(checked) => updateSetting('notifyOnCharityDonation', checked)}
                  disabled={!settings?.emailNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Campaign Donations</Label>
                  <p className="text-sm text-gray-500">
                    Get notified for campaign donations
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
                    Get special alerts for large donations
                  </p>
                </div>
                <Switch
                  checked={settings?.notifyOnLargeDonation}
                  onCheckedChange={(checked) => updateSetting('notifyOnLargeDonation', checked)}
                  disabled={!settings?.emailNotificationsEnabled}
                />
              </div>

              {settings?.notifyOnLargeDonation && (
                <div className="space-y-2 pl-4 border-l-2 border-yellow-400">
                  <Label htmlFor="threshold">Large Donation Threshold (USD)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="1000"
                    value={settings?.largeDonationThreshold || '1000'}
                    onChange={(e) => updateSetting('largeDonationThreshold', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Donations above this amount will trigger special alerts
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payout Requests</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when payouts need approval
                  </p>
                </div>
                <Switch
                  checked={settings?.notifyOnPayoutRequest}
                  onCheckedChange={(checked) => updateSetting('notifyOnPayoutRequest', checked)}
                  disabled={!settings?.emailNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Account Change Requests</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when users request to change their bank account
                  </p>
                </div>
                <Switch
                  checked={settings?.notifyOnAccountChangeRequest}
                  onCheckedChange={(checked) => updateSetting('notifyOnAccountChangeRequest', checked)}
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
                Receive periodic summaries of platform activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Summary</Label>
                  <p className="text-sm text-gray-500">
                    Get a daily report of all donations
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
                    Get a weekly report of platform metrics
                  </p>
                </div>
                <Switch
                  checked={settings?.weeklySummaryEnabled}
                  onCheckedChange={(checked) => updateSetting('weeklySummaryEnabled', checked)}
                  disabled={!settings?.emailNotificationsEnabled}
                />
              </div>

              {(settings?.dailySummaryEnabled || settings?.weeklySummaryEnabled) && (
                <div className="space-y-2">
                  <Label htmlFor="summaryTime">Summary Send Time</Label>
                  <Input
                    id="summaryTime"
                    type="time"
                    value={settings?.summaryTime || '09:00'}
                    onChange={(e) => updateSetting('summaryTime', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Time when summaries will be sent (24-hour format)
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
                  <h3 className="font-semibold text-blue-900 mb-1">How Notifications Work</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Email Notifications:</strong> Sent immediately when donations are received</li>
                    <li>• <strong>Large Donation Alerts:</strong> Special notifications for donations above threshold</li>
                    <li>• <strong>Summary Reports:</strong> Periodic digest emails with platform metrics</li>
                    <li>• <strong>In-App Notifications:</strong> Always enabled for all admin users</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

