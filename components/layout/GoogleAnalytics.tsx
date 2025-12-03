"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function hasCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  const consent = localStorage.getItem("chainfundit_cookie_consent");
  if (!consent) return false;
  try {
    const consentData = JSON.parse(consent);
    return consentData.accepted === true;
  } catch {
    return false;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag && hasCookieConsent()) {
      window.gtag("config", "G-7VNFF33E8Z", {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}

