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
  const campaignUrl = `${baseUrl}/campaign/${slug}`;

  // Use the route-specific Open Graph image so crawlers consistently
  // pick up the campaign cover instead of the site-wide fallback.
  const ogImageUrl = `${baseUrl}/campaign/${slug}/opengraph-image`;
  const twitterImageUrl = `${baseUrl}/campaign/${slug}/twitter-image`;

  const description =
    campaignData.subtitle ||
    (campaignData.description
      ? campaignData.description.substring(0, 160).replace(/\n/g, " ").trim()
      : "Support this campaign on Chainfundit");

  return {
    title: `${campaignData.title} | Chainfundit`,
    description: description,
    openGraph: {
      title: campaignData.title,
      description: description,
      url: campaignUrl,
      siteName: "Chainfundit",
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          type: "image/png",
          width: 1200,
          height: 630,
          alt: campaignData.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: campaignData.title,
      description: description,
      images: [twitterImageUrl],
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
