"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CookieIcon, X } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "chainfundit_cookie_consent";
const COOKIE_CONSENT_EXPIRY_DAYS = 365;

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to ensure smooth page load
      setTimeout(() => {
        setShowBanner(true);
      }, 500);
    }
  }, []);

  const handleAccept = () => {
    const consentData = {
      accepted: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
    
    // Enable Google Analytics if user accepts
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
      // Initialize tracking now that consent is granted
      window.gtag("config", "G-7VNFF33E8Z", {
        page_path: window.location.pathname,
      });
    }
  };

  const handleReject = () => {
    const consentData = {
      accepted: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
    
    // Disable Google Analytics if user rejects
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
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
    </div>
  );
}

// Helper function to check if user has consented to cookies
export function hasCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!consent) return false;
  try {
    const consentData = JSON.parse(consent);
    return consentData.accepted === true;
  } catch {
    return false;
  }
}

