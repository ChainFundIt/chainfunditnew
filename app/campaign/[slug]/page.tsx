import Navbar from '../Navbar'
import Main from "../Main";
import React from "react";
import Cards from '../cards';
import Footer from '@/components/layout/Footer';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
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
      <Main campaignId={campaignData.id} />
      <Cards campaignId={campaignData.id} />
      <Footer />
    </div>
  );
};

export default page;

