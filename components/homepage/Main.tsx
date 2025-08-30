"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { PiYoutubeLogoLight } from "react-icons/pi";
import CardDetailsDrawer from "@/components/homepage/CardDetailsDrawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationsList } from "@/components/homepage/notifications-list";
import BenefitsCarousel from "./BenefitsCarousel";
import { useCampaigns } from "@/hooks/use-campaigns";

type Props = {};

// Skeleton loading component for campaign cards
const CampaignCardSkeleton = () => (
  <div className="w-full md:w-1/3 p-2 animate-pulse">
    <div className="w-full h-40 md:h-60 bg-gray-200 rounded-lg"></div>
    <div className="h-5 bg-gray-200 rounded mt-3 w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded mt-2 w-full"></div>
    <div className="h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
    <div className="w-full bg-gray-200 h-2 mt-3 rounded"></div>
  </div>
);

// Optimized campaign card component
const CampaignCard = React.memo(({ card, idx, onClick }: { 
  card: any; 
  idx: number; 
  onClick: () => void; 
}) => (
  <div
    className="w-full md:w-80 lg:w-96 cursor-pointer"
    onClick={onClick}
  >
    {/* Main Card Container */}
    <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-[500px]">
      {/* Image Section */}
      <div className="relative overflow-hidden h-48">
        <Image
          src={card.image}
          alt={card.title}
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          priority={idx < 3}
          loading={idx < 3 ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        
        {/* Progress Badge Overlay */}
        <div className="absolute top-4 right-4">
          <div className="bg-[#104901] text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
            {card.percentage}
          </div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Content Section */}
      <div className="p-5 space-y-3 flex flex-col h-[calc(500px-192px)]">
        {/* Title */}
        <h3 className="font-source font-bold text-xl text-gray-900 line-clamp-2 group-hover:text-[#104901] transition-colors duration-300">
          {card.title}
        </h3>
        
        {/* Description */}
        <p className="font-source text-gray-600 line-clamp-2 text-sm leading-relaxed flex-1">
          {card.description.slice(0, 80)}...
        </p>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">Progress</span>
            <span className="font-semibold text-[#104901]">{card.percentage}</span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#104901] to-green-600 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{
                width: card.percentage || "0%"
              }}
            />
          </div>
        </div>
        
        {/* Amount and Donors */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-left">
            <p className="font-bold text-2xl text-[#104901]">
              {card.raised.split(' ')[0]}
            </p>
            <p className="text-xs text-gray-500">raised</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg text-gray-700">
              {card.donors}
            </p>
            <p className="text-xs text-gray-500">donors</p>
          </div>
        </div>
        
        {/* Creator Info */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-[#104901] to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {card.creator.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm">by {card.creator}</p>
            <p className="text-xs text-gray-500">{card.createdFor}</p>
          </div>
        </div>
      </div>
      
      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-[#104901] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  </div>
));

CampaignCard.displayName = 'CampaignCard';

const Main = (props: Props) => {
  
  const images = [
    "/images/main-3.png", // Image 1: multi-currency
    "/images/teamwork.png", // Image 2: two people lifting
    "/images/secure.png", // Image 3: secure payments
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openCard, setOpenCard] = useState<number | null>(null);
  
  // Fetch real campaigns from database with performance optimizations
  const { campaigns, loading: campaignsLoading, error: campaignsError } = useCampaigns();

  const handlePreviousCard = () => {
    if (openCard !== null && openCard > 0) {
      setOpenCard(openCard - 1);
    }
  };

  const handleNextCard = () => {
    if (openCard !== null && openCard < Math.min(campaigns.length, 3) - 1) {
      setOpenCard(openCard + 1);
    }
  };

  // Memoized campaign transformation to prevent unnecessary recalculations
  const cardDetails = React.useMemo(() => {
    // Only take the first 3 campaigns
    return campaigns.slice(0, 3).map((campaign) => {
      const currencySymbol = campaign.currency === 'NGN' ? '₦' : 
                            campaign.currency === 'USD' ? '$' : 
                            campaign.currency === 'EUR' ? '€' : 
                            campaign.currency === 'GBP' ? '£' : campaign.currency;
      
      const progressPercentage = Math.min(100, Math.round((campaign.currentAmount / campaign.goalAmount) * 100));
      
      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        raised: `${currencySymbol}${campaign.currentAmount.toLocaleString()} raised`,
        image: campaign.coverImageUrl || "/images/card-img1.png",
        extra: `Goal: ${currencySymbol}${campaign.goalAmount.toLocaleString()}. ${progressPercentage}% funded!`,
        date: new Date(campaign.createdAt).toLocaleDateString(),
        timeLeft: "Active", // You can calculate actual time left if needed
        avatar: campaign.creatorAvatar || "/images/avatar-7.png",
        creator: campaign.creatorName || "Unknown Creator",
        createdFor: campaign.fundraisingFor || "Charity",
        percentage: `${progressPercentage}%`,
        total: `${currencySymbol}${campaign.goalAmount.toLocaleString()} total`,
        donors: campaign.stats?.uniqueDonors || 0,
      };
    });
  }, [campaigns]);

  // Optimized image rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Increased to 5 seconds for better performance

    return () => clearInterval(interval);
  }, [images.length]);

  // Show loading state while campaigns are being fetched
  if (campaignsLoading) {
    return (
      <div className="min-h-screen bg-[#E5ECDE] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104901] mx-auto mb-4"></div>
          <p className="text-lg text-[#104901]">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  // Show error state if campaigns failed to load
  if (campaignsError) {
    return (
      <div className="min-h-screen bg-[#E5ECDE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Failed to load campaigns</p>
          <p className="text-sm text-gray-600">{campaignsError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-[#104901] text-white px-6 py-3 rounded-lg hover:bg-[#0d3a01] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no campaigns
  if (campaigns.length === 0 && !campaignsLoading) {
    return (
      <div className="min-h-screen bg-[#E5ECDE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#104901] mb-4">No campaigns available</p>
          <p className="text-sm text-gray-600">Check back later for new campaigns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6">
      {/* benefits */}
      <BenefitsCarousel />
      {/* campaign cards */}
      <div className="p-4 md:p-12 w-full h-fit flex flex-col gap-5 my-5 bg-[#F2F1E9]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
          <section className="flex flex-col gap-2 md:gap-3">
            <p className="font-source font-semibold text-2xl md:text-3xl text-black">
              Discover inspiring fundraisers close to you
            </p>
            <span className="font-source font-normal text-base text-black">
              Support campaigns you like, or create one for yourself
            </span>
          </section>

          <Select>
            <SelectTrigger className="w-full md:w-[250px] h-12 md:h-14 px-4 md:px-6 font-source font-normal text-base text-black border-2 border-[#0F4201] rounded-none">
              <SelectValue placeholder="Happening worldwide" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="live campaigns"
                className="capitalize cursor-pointer"
              >
                live campaigns anywhere (worldwide)
              </SelectItem>
              <SelectItem
                value="need momentum"
                className="capitalize cursor-pointer"
              >
                need momentum (campaigns between 0-10%)
              </SelectItem>
              <SelectItem
                value="close to target"
                className="capitalize cursor-pointer"
              >
                close to target (campaigns above 90%)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
          {cardDetails.length > 0 ? (
            <>
              {cardDetails.map((card, idx) => (
                <CampaignCard
                  key={card.id} // Use campaign ID instead of index for better React performance
                  card={card}
                  idx={idx}
                  onClick={() => setOpenCard(idx)}
                />
              ))}
              <CardDetailsDrawer
                open={openCard !== null}
                onOpenChange={(open) => !open && setOpenCard(null)}
                card={openCard !== null ? cardDetails[openCard] : null}
                currentIndex={openCard !== null ? openCard : 0}
                totalCards={Math.min(cardDetails.length, 3)}
                onPrevious={handlePreviousCard}
                onNext={handleNextCard}
              />
            </>
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-lg text-[#104901]">No campaigns available</p>
              <p className="text-sm text-gray-600">Check back later for new campaigns</p>
            </div>
          )}
        </div>
      </div>
      {/* features*/}
      <div className="px-4 md:px-12 py-6 md:py-10 mt-5">
        <h2 className="font-semibold text-2xl md:text-3xl text-black">
          All you need for a successful fundraiser
        </h2>
        <p className="font-normal text-base text-black">
          Modern, powerful tools to help your fundraisers reach their goals
          quick
        </p>
        <div className="flex flex-col md:flex-row gap-24 md:gap-5 w-full h-fit my-5">
          <section className="bg-[url('/images/main-1.png')] bg-cover bg-no-repeat w-full md:w-2/3 h-60 md:h-[500px]">
            <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0)_70%,#fff_100%)] h-full px-2 md:px-4 py-4 md:py-6 flex flex-col gap-2 md:gap-3">
              <div className="w-full md:w-[365px] h-fit p-2 md:p-4 rounded-xl bg-white flex items-start gap-2 md:gap-3 font-dm">
                <Image
                  src="/images/avatar-1.png"
                  alt="avatar"
                  width={40}
                  height={40}
                  className="md:w-[50px] md:h-[50px]"
                />
                <section className="flex flex-col gap-1">
                  <span className="font-normal text-base text-black">You</span>
                  <p className="font-semibold text-base text-black text-wrap">
                    Create a campaign to cover my tuition at Berkshire College.
                    Goal is $24,000.
                  </p>
                </section>
              </div>
              <div className="w-full md:w-[365px] h-fit p-2 md:p-4 rounded-xl bg-white flex items-start gap-2 md:gap-3 font-dm">
                <section className="flex flex-col gap-1">
                  <span className="font-normal text-base text-black">
                    Chainfundit
                  </span>
                  <p className="font-semibold text-base text-black text-wrap">
                    College sounds like fun. New campaign coming right up...
                  </p>
                </section>
                <Image
                  src="/images/logo.svg"
                  alt="avatar"
                  width={40}
                  height={40}
                  className="md:w-[50px] md:h-[50px]"
                />
              </div>

              <div className="flex flex-col gap-1 justify-end mt-4 mb-5 md:my-0 md:mt-auto">
                <p className="font-dm font-medium text-lg md:text-xl text-black">
                  AI-powered writing
                </p>
                <span className="font-source font-normal text-base text-black">
                  Create captivating campaign stories with the power of AI
                </span>
              </div>
            </section>
          </section>
          <section className="bg-[url('/images/main-2.png')] bg-cover bg-no-repeat w-full md:w-1/3 h-60 md:h-[500px]">
            <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0)_70%,#fff_100%)] h-full px-2 md:px-4 py-4 md:py-6 flex flex-col gap-2 md:gap-3">
              <div className="w-full md:w-[300px] h-fit p-2 md:p-4 rounded-xl bg-white flex items-start gap-2 md:gap-3 font-dm">
                <Image
                  src="/images/avatar-2.png"
                  alt="avatar"
                  width={40}
                  height={40}
                  className="md:w-[50px] md:h-[50px]"
                />
                <section className="flex flex-col gap-1">
                  <span className="font-normal text-base text-black">
                    Children’s Ground
                  </span>
                  <p className="font-semibold text-base text-black text-wrap">
                    Thanks to your support, our building plan has been approved.
                  </p>
                </section>
              </div>

              <div className="flex flex-col gap-1 justify-end mt-auto">
                <p className="font-dm font-medium text-lg md:text-xl text-black">
                  Campaign updates
                </p>
                <span className="font-source font-normal text-base text-black">
                  Inform donors of progress made on your projects
                </span>
              </div>
            </section>
          </section>
        </div>
      </div>
      <div className="px-4 md:px-12 flex flex-col md:flex-row gap-4 md:gap-5 w-full h-fit my-5">
        <section className="bg-[url('/images/video.png')] bg-cover bg-no-repeat w-full md:w-1/3 h-60 md:h-[650px]">
          <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0)_70%,#F2F1E9_100%)] h-full px-2 md:px-4 py-4 md:py-6 flex flex-col">
            <section className="flex items-center justify-center my-auto">
              <PiYoutubeLogoLight color="white" size={48} strokeWidth={0.1} className="md:w-[100px] md:h-[100px] w-[48px] h-[48px]" />
            </section>
            <div className="flex flex-col gap-1 justify-end ">
              <p className="font-dm font-medium text-lg md:text-xl text-black">
                Video explainers
              </p>
              <span className="font-source font-normal text-base text-black">
                Maximise engagement with campaign videos
              </span>
            </div>
          </section>
        </section>
        <section className="bg-[#F5F5F5] w-full md:w-2/3 h-60 md:h-[650px] ">
          <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0)_70%,#fff_100%)] h-full px-2 md:px-4 py-4 md:py-6 flex flex-col">
            <NotificationsList />

            <div className="flex flex-col gap-1 justify-end mt-auto">
              <p className="font-dm font-medium text-lg md:text-xl text-black">
                Instant notifications
              </p>
              <span className="font-source font-normal text-base text-black">
                Never miss out on any donation, get notifications on-the-go
              </span>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
};

export default Main;
