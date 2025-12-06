import Navbar from '../Navbar'
import Main from "../Main";
import React from "react";
import Cards from '../cards';
import Footer from '@/components/layout/Footer';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug === 'undefined') {
    return {
      title: 'Campaign Not Found',
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
      title: 'Campaign Not Found',
    };
  }

  const campaignData = campaign[0];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chainfundit.com';
  const logoUrl = `/images/logo.svg`;
  
  // Get the campaign URL
  const campaignUrl = `${baseUrl}/campaign/${slug}`;
  
  // Get cover image URL - ensure it's absolute
  let coverImageUrl = campaignData.coverImageUrl;
  if (coverImageUrl && !coverImageUrl.startsWith('http')) {
    // If it's a relative URL, make it absolute
    coverImageUrl = coverImageUrl.startsWith('/') 
      ? `${baseUrl}${coverImageUrl}`
      : `${baseUrl}/${coverImageUrl}`;
  }

  // Prepare images array - use cover image if available, otherwise fallback to logo
  const images = coverImageUrl 
    ? [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: campaignData.title,
        }
      ]
    : [
        {
          url: logoUrl,
          width: 512,
          height: 512,
          alt: 'Chainfundit Logo',
        }
      ];

  // Prepare description - use subtitle or truncate description
  const description = campaignData.subtitle || 
    (campaignData.description 
      ? campaignData.description.substring(0, 160).replace(/\n/g, ' ').trim()
      : 'Support this campaign on Chainfundit');

  // Format goal amount for display
  const goalAmount = parseFloat(campaignData.goalAmount || '0');
  const currency = campaignData.currency || 'USD';
  const currentAmount = parseFloat(campaignData.currentAmount || '0');
  const progress = goalAmount > 0 ? Math.round((currentAmount / goalAmount) * 100) : 0;

  return {
    title: `${campaignData.title} | Chainfundit`,
    description: description,
    openGraph: {
      title: campaignData.title,
      description: description,
      url: campaignUrl,
      siteName: 'Chainfundit',
      images: images,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: coverImageUrl ? 'summary_large_image' : 'summary',
      title: campaignData.title,
      description: description,
      images: coverImageUrl ? [coverImageUrl] : [logoUrl],
    },
    alternates: {
      canonical: campaignUrl,
    },
  };
}

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  // Handle undefined slug
  if (!slug || slug === 'undefined') {
    notFound();
  }

  // Find campaign by slug only
  const campaign = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.slug, slug))
    .limit(1);

  if (!campaign.length) {
    notFound();
  }

  const campaignData = campaign[0];

  // Note: Private campaigns are filtered out from public listings,
  // but can be accessed via direct link (when shared by creator)
  // So we allow access here - the visibility check is handled in listings

  return (
    <div className='h-full'>
      <Navbar />
      <Main campaignSlug={slug} />
      <Cards 
        campaignId={campaignData.id} 
        campaignReason={campaignData.reason || null}
      />
      <Footer />
    </div>
  );
};

export default page;

