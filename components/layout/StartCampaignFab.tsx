"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

const CREATE_CAMPAIGN_HREF = "/dashboard/campaigns/create-campaign";
const COOKIE_CONSENT_KEY = "chainfundit_cookie_consent";

function shouldHideOnPath(pathname: string) {
  // Avoid duplicating CTAs or interfering with admin/dashboard UIs.
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/admin")) return true;

  // Avoid showing when user is already on create campaign.
  if (pathname === CREATE_CAMPAIGN_HREF) return true;

  return false;
}

export default function StartCampaignFab() {
  const pathname = usePathname() || "";
  const [hasCookieConsent, setHasCookieConsent] = React.useState<
    boolean | null
  >(null);

  React.useEffect(() => {
    try {
      setHasCookieConsent(!!localStorage.getItem(COOKIE_CONSENT_KEY));
    } catch {
      setHasCookieConsent(true);
    }
  }, []);

  if (shouldHideOnPath(pathname)) return null;

  return (
    <div
      className={[
        "md:hidden fixed inset-x-0 z-40 pointer-events-none",
        hasCookieConsent === false ? "bottom-24" : "bottom-0",
      ].join(" ")}
    >
      <div
        className="pointer-events-auto mx-auto w-full max-w-md px-4"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="pb-4">
          <Button
            asChild
            className="w-full h-16 text-lg rounded-full shadow-lg border border-white/30"
          >
            <Link href={CREATE_CAMPAIGN_HREF} aria-label="Start a campaign">
              <Plus className="h-4 w-4" />
              Start a campaign
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


