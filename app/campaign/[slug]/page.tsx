import Main from "../Main";
import React from "react";
import Cards from "../cards";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

const INVALID_COVER_IMAGE_TOKENS = new Set([
  "",
  "undefined",
  "null",
  "about:blank",
  "n/a",
  "na",
]);

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug === "undefined") {
    return {
      title: "Campaign Not Found",
    };
  }

  // Fetch campaign data for metadata
  const campaign = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.slug, slug))
    .limit(1);

  if (!campaign.length) {
    return {
      title: "Campaign Not Found",
    };
  }

  const campaignData = campaign[0];
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com").replace(
    /\/$/,
    "",
  );
  const fallbackOgImageUrl = `${baseUrl}/opengraph-image`;

  const campaignUrl = `${baseUrl}/campaign/${slug}`;

  // Use a generated per-campaign OG image that overlays the cover + company logo.
  // This avoids relying on social crawlers to fetch R2/CDN URLs directly.
  const campaignOgImageUrl = `${baseUrl}/campaign/${slug}/opengraph-image`;

  const r2BaseUrl =
    process.env.R2_PUBLIC_ACCESS_KEY ||
    // Fallback used elsewhere in the codebase (`components/ui/r2-image.tsx`)
    "https://pub-bc49c704eeac4df0a625097110e79d09.r2.dev";

  const normalizeCoverImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    let u = url.trim();
    if (!u) return null;

    const normalized = u.toLowerCase();
    if (INVALID_COVER_IMAGE_TOKENS.has(normalized)) {
      return null;
    }

    // Fix common broken uploads: "undefined/<file>" should be served from R2 base URL.
    if (u.startsWith("undefined/")) {
      u = `${r2BaseUrl.replace(/\/$/, "")}/${u.replace(/^undefined\//, "")}`;
    }

    // If it's a relative URL, make it absolute.
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      u = u.startsWith("/") ? `${baseUrl}${u}` : `${baseUrl}/${u}`;
    }

    return u;
  };

  const toProxiedOgImage = (absoluteUrl: string | null): string | null => {
    if (!absoluteUrl) return null;
    // Avoid double-proxying.
    if (absoluteUrl.includes("/api/images?url=")) return absoluteUrl;

    // Proxy external images through our domain so social crawlers can reliably fetch them.
    // (Some crawlers struggle with redirects/CDNs/CORS; the proxy returns a clean 200 image.)
    if (!absoluteUrl.startsWith(baseUrl)) {
      return `${baseUrl}/api/images?url=${encodeURIComponent(absoluteUrl)}`;
    }

    // Still proxy known R2/public-bucket URLs, even if baseUrl differs.
    if (absoluteUrl.includes("r2.dev") || absoluteUrl.includes("pub-")) {
      return `${baseUrl}/api/images?url=${encodeURIComponent(absoluteUrl)}`;
    }

    return absoluteUrl;
  };

  const normalizedCoverImageUrl = normalizeCoverImageUrl(campaignData.coverImageUrl);
  const proxiedCoverImageUrl = toProxiedOgImage(normalizedCoverImageUrl);

  // Put cover first (when available) but keep deterministic fallbacks for crawlers that can't fetch it.
  const images = [
    ...(proxiedCoverImageUrl
      ? [
          {
            url: proxiedCoverImageUrl,
            width: 1200,
            height: 630,
            alt: campaignData.title,
          },
        ]
      : []),
    {
      url: campaignOgImageUrl,
      width: 1200,
      height: 630,
      alt: campaignData.title,
    },
    {
      url: fallbackOgImageUrl,
      width: 1200,
      height: 630,
      alt: "Chainfundit — Raise funds, support dreams",
    },
  ];

  const description =
    campaignData.subtitle ||
    (campaignData.description
      ? campaignData.description.substring(0, 160).replace(/\n/g, " ").trim()
      : "Support this campaign on Chainfundit");

  // Format goal amount for display
  const goalAmount = parseFloat(campaignData.goalAmount || "0");
  const currency = campaignData.currency || "USD";
  const currentAmount = parseFloat(campaignData.currentAmount || "0");
  const progress =
    goalAmount > 0 ? Math.round((currentAmount / goalAmount) * 100) : 0;

  return {
    title: `${campaignData.title} | Chainfundit`,
    description: description,
    openGraph: {
      title: campaignData.title,
      description: description,
      url: campaignUrl,
      siteName: "Chainfundit",
      images: images,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: campaignData.title,
      description: description,
      images: [`${baseUrl}/campaign/${slug}/twitter-image`],
    },
    alternates: {
      canonical: campaignUrl,
    },
  };
}

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") {
    notFound();
  }

  const campaign = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.slug, slug))
    .limit(1);

  if (!campaign.length) {
    notFound();
  }

  const campaignData = campaign[0];

  return (
    <div className="h-full">
      <Navbar />
      <Main campaignSlug={slug} />
      <div className="py-12 flex justify-center">
        <div className="w-full md:max-w-[80rem] ">
          <Cards
            campaignId={campaignData.id}
            campaignReason={campaignData.reason || null}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
