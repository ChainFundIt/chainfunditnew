"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CookieIcon } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COOKIE_CONSENT_KEY = "chainfundit_cookie_consent";
const COOKIE_CONSENT_EXPIRY_DAYS = 365;

type CookieConsentData = {
  version?: number;
  accepted?: boolean; // legacy + mirrors analytics preference
  timestamp?: string;
  preferences?: {
    analytics?: boolean;
  };
};

function readConsentData(): CookieConsentData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CookieConsentData;
  } catch {
    return null;
  }
}

function getAnalyticsPreference(consent: CookieConsentData | null): boolean | null {
  if (!consent) return null;
  if (typeof consent.preferences?.analytics === "boolean") return consent.preferences.analytics;
  if (typeof consent.accepted === "boolean") return consent.accepted;
  return null;
}

function persistConsent(analytics: boolean) {
  const consentData: CookieConsentData = {
    version: 1,
    accepted: analytics,
    timestamp: new Date().toISOString(),
    preferences: { analytics },
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
}

function applyAnalyticsConsent(analytics: boolean) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
  });

  if (analytics) {
    // Initialize tracking now that consent is granted
    window.gtag("config", "G-7VNFF33E8Z", {
      page_path: window.location.pathname,
    });
  }
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has already given consent
    const consent = readConsentData();
    const analyticsPref = getAnalyticsPreference(consent);
    if (typeof analyticsPref === "boolean") setAnalyticsEnabled(analyticsPref);

    if (!consent) {
      // Small delay to ensure smooth page load
      setTimeout(() => {
        setShowBanner(true);
      }, 500);
    }
  }, []);

  const handleAccept = () => {
    persistConsent(true);
    setShowBanner(false);

    applyAnalyticsConsent(true);
  };

  const handleReject = () => {
    persistConsent(false);
    setShowBanner(false);

    applyAnalyticsConsent(false);
  };

  const handleSavePreferences = () => {
    persistConsent(analyticsEnabled);
    applyAnalyticsConsent(analyticsEnabled);
    setPreferencesOpen(false);
    setShowBanner(false);
  };

  if (!mounted || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow-lg border-2 border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                <CookieIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  We Use Cookies
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We use cookies to enhance your browsing experience, analyze
                  site traffic, and personalize content. By clicking "Accept
                  All", you consent to our use of cookies.{" "}
                  <Link
                    href="/privacy-policy#cookies"
                    className="text-[#104901] hover:underline font-medium"
                    onClick={() => setShowBanner(false)}
                  >
                    Learn more
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={handleReject}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                Reject
              </Button>
              <Button
                onClick={() => setPreferencesOpen(true)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                Manage Preferences
              </Button>
              <Button
                onClick={handleAccept}
                variant="default"
                size="sm"
                className="w-full sm:w-auto"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Choose which cookies you want to allow. Necessary cookies are always on.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-md border p-3">
              <div className="space-y-1">
                <Label>Necessary</Label>
                <p className="text-sm text-muted-foreground">
                  Required for the website to function.
                </p>
              </div>
              <Switch checked disabled aria-label="Necessary cookies enabled" />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-md border p-3">
              <div className="space-y-1">
                <Label htmlFor="analytics-cookies">Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Helps us understand site usage and improve the product.
                </p>
              </div>
              <Switch
                id="analytics-cookies"
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
                aria-label="Toggle analytics cookies"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setPreferencesOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPreferencesOpen(false);
                handleReject();
              }}
            >
              Reject All
            </Button>
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to check if user has consented to cookies
export function hasCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  const consentData = readConsentData();
  const analytics = getAnalyticsPreference(consentData);
  return analytics === true;
}

