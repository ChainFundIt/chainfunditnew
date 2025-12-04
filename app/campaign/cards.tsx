"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CardDetailsDrawer from "@/components/homepage/CardDetailsDrawer";
import CampaignCreatorAvatar from "@/components/ui/campaign-creator-avatar";
import { EmojiFallbackImage } from "@/components/ui/emoji-fallback-image";
import { R2Image } from "@/components/ui/r2-image";
import { needsEmojiFallback } from "@/lib/utils/campaign-emojis";
import { getTimeRemaining } from "@/lib/utils/campaign-status";



const Cards = ({ 
  campaignId, 
  campaignReason 
}: { 
  campaignId: string;
  campaignReason: string | null;
}) => {
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [relatedCampaigns, setRelatedCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const fetchRelatedCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        // First, try to fetch campaigns with the same reason/category
        let url = `/api/campaigns?limit=6&excludeId=${campaignId}`;
        if (campaignReason) {
          url += `&reason=${encodeURIComponent(campaignReason)}`;
        }
        
        let response = await fetch(url);
        let result = await response.json();
        
        if (!result.success || !result.data || result.data.length < 3) {
          const fallbackUrl = `/api/campaigns?limit=6&excludeId=${campaignId}&status=active`;
          response = await fetch(fallbackUrl);
          result = await response.json();
        }
        
        if (result.success && result.data && result.data.length > 0) {
          const filteredCampaigns = result.data
            .filter((campaign: any) => campaign.id !== campaignId)
            .slice(0, 5);
          
          const transformedCampaigns = filteredCampaigns.map((campaign: any) => {
            const getCurrencySymbol = (currency: string) => {
              switch (currency.toUpperCase()) {
                case 'USD': return '$';
                case 'CAD': return 'C$';
                case 'EUR': return '€';
                case 'GBP': return '£';
                case 'NGN': return '₦';
                case 'JPY': return '¥';
                case 'AUD': return 'A$';
                case 'CHF': return 'CHF';
                case 'CNY': return '¥';
                case 'INR': return '₹';
                default: return currency;
              }
            };
            
            const currencySymbol = getCurrencySymbol(campaign.currency);
            
            const getImageUrl = () => {
              if (campaign.galleryImages && campaign.galleryImages.length > 0) {
                const firstImage = campaign.galleryImages[0];
                if (firstImage && firstImage !== 'undefined') {
                  return firstImage;
                }
              }
              
              if (campaign.coverImageUrl && campaign.coverImageUrl !== 'undefined') {
                return campaign.coverImageUrl;
              }
              
              return "/images/card-img1.png";
            };
            
            return {
              id: campaign.id,
              slug: campaign.slug, 
              title: campaign.title,
              description: campaign.description,
              raised: `${currencySymbol}${campaign.currentAmount.toLocaleString()} raised`,
              image: getImageUrl(),
              coverImageUrl: campaign.coverImageUrl,
              reason: campaign.reason || 'Uncategorized', 
              extra: `Goal: ${currencySymbol}${campaign.goalAmount.toLocaleString()}. ${Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}% funded!`,
              date: new Date(campaign.createdAt).toLocaleDateString(),
              timeLeft: getTimeRemaining({
                id: campaign.id,
                createdAt: campaign.createdAt,
                duration: campaign.duration || 'Not applicable',
                currentAmount: campaign.currentAmount,
                goalAmount: campaign.goalAmount,
                status: campaign.status,
                isActive: campaign.isActive,
              } as any),
              avatar: campaign.creatorAvatar,
              creator: campaign.creatorName,
              createdFor: campaign.fundraisingFor,
              percentage: `${Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}%`,
              total: `${currencySymbol}${campaign.goalAmount.toLocaleString()} total`,
              donors: campaign.stats?.uniqueDonors || 0,
            };
          });
          setRelatedCampaigns(transformedCampaigns);
        } else {
          setRelatedCampaigns([]);
        }
      } catch (err) {
        console.error('Error fetching related campaigns:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch related campaigns');
        setRelatedCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchRelatedCampaigns();
    }
  }, [campaignId, campaignReason]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  const handleCardClick = (card: any) => {
    if (card.slug) {
      window.location.href = `/campaign/${card.slug}`;
    } else {
      setSelectedCard(card);
      setIsDrawerOpen(true);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-2xl md:text-3xl text-black">
            Related campaigns
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#104901] mx-auto mb-2"></div>
            <p className="text-sm text-[#757575]">Loading related campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-2xl md:text-3xl text-black">
            Related campaigns
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-sm text-[#757575] mb-2">Couldn&apos;t load related campaigns</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-[#104901] text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (relatedCampaigns.length === 0) {
    return (
      <div className="w-full px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-2xl md:text-3xl text-black">
            Related campaigns
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-sm text-[#757575]">No related campaigns found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-2xl md:text-3xl text-black">
          Related campaigns
        </h2>
        <div className="flex gap-2">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 bg-white border border-[#D9D9D9] rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 bg-white border border-[#D9D9D9] rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
      >
        {relatedCampaigns.map((card: any) => (
          <div
            key={card.id}
            className="min-w-[300px] md:min-w-[400px] bg-white border border-[#D9D9D9] rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(card)}
          >
            <div className="relative">
              {needsEmojiFallback(card.coverImageUrl || card.image) ? (
                <EmojiFallbackImage
                  category={card.reason}
                  title={card.title}
                  className="w-full h-48"
                  width={400}
                  height={192}
                />
              ) : (
                <R2Image
                  src={card.image}
                  alt={card.title}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-[#104901] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {card.percentage}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-black mb-2 line-clamp-2">
                {card.title}
              </h3>
              <p className="text-sm text-[#757575] mb-3 line-clamp-2">
                {card.description}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <CampaignCreatorAvatar
                  creatorName={card.creator}
                  creatorAvatar={card.avatar}
                  size={24}
                />
                <span className="text-sm text-[#757575]">
                  by {card.creator}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-black">
                  {card.raised}
                </span>
                <span className="text-sm text-[#757575]">
                  {card.donors} donors
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CardDetailsDrawer
        card={selectedCard}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        currentIndex={0}
        totalCards={relatedCampaigns.length}
        onPrevious={() => {}}
        onNext={() => {}}
      />
    </div>
  );
};

export default Cards;