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

  // Use only short, deterministic image URLs in metadata. Long proxied URLs
  // (e.g. /api/images?url=...) get truncated by crawlers/meta (e.g. ~255 chars),
  // producing invalid URLs and broken thumbnails. So we only output generated routes.
  const images = [
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

  const twitterImages = [`${baseUrl}/campaign/${slug}/twitter-image`];

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
      images: twitterImages,
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
