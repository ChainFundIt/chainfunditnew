import Navbar from '../Navbar'
import Main from "../Main";
import React from "react";
import Cards from '../cards';
import Footer from '@/components/layout/Footer';

interface PageProps {
  params: Promise<{ id: string }>;
}

const page = async ({ params }: PageProps) => {
  const { id } = await params;
  
  console.log('Campaign page accessed with ID:', id);

  // For now, let's not fetch from the backend API to isolate the issue
  // We'll let the client-side components handle the data fetching
  const campaignData = null;

  return (
    <div className='h-full'>
      <Navbar />
      <Main campaignId={id} initialCampaignData={campaignData} />
      <Cards campaignId={id} />
      <Footer />
    </div>
  );
};

export default page;