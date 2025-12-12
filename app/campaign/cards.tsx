"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CardDetailsDrawer from "@/components/homepage/CardDetailsDrawer";
import CampaignCreatorAvatar from "@/components/ui/campaign-creator-avatar";
import { EmojiFallbackImage } from "@/components/ui/emoji-fallback-image";
import { R2Image } from "@/components/ui/r2-image";
import { needsEmojiFallback } from "@/lib/utils/campaign-emojis";
import { Heart } from "lucide-react";
import { getTimeRemaining } from "@/lib/utils/campaign-status";
import { getRelatedItems } from "@/lib/utils/unified-items";
import { UnifiedItem } from "@/lib/types/unified-item";
import { normalizeCampaign, normalizeCharity } from "@/lib/utils/unified-items";
import { getCharityCategoriesForCampaignReason } from "@/lib/utils/category-mapping";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Component to show charity image with heart icon fallback on error
const CharityImageWithFallback = ({ 
  src, 
  alt, 
  title, 
  height,
  width,
  className
}: { 
  src: string | null | undefined; 
  alt: string; 
  title: string; 
  height: number; 
  width: number; 
  className: string;
}) => {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const HeartIconPlaceholder = () => (
    <div className="w-full h-48 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center relative">
      <div className="text-center p-4 relative z-10">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-30 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-green-500 to-blue-600 p-4 rounded-full">
            <Heart className="h-12 w-12 text-white" />
          </div>
        </div>
        <p className="text-xs font-semibold text-gray-600 mt-3 max-w-[120px] mx-auto line-clamp-2">
          {title}
        </p>
      </div>
    </div>
  );

  if (!src || imageError) {
    return <HeartIconPlaceholder />;
  }

  return (
    <div className="relative w-full h-48">
      <img
        src={src}
        alt={alt}
        height={height}
        width={width}
        className={className}
        onError={() => setImageError(true)}
        onLoad={() => setImageError(false)}
      />
      {imageError && <HeartIconPlaceholder />}
    </div>
  );
};

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
    const fetchRelatedItems = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get related charity categories if we have a campaign reason
        const relatedCharityCategories = campaignReason 
          ? getCharityCategoriesForCampaignReason(campaignReason)
          : [];

        // Fetch campaigns
        const campaignsResponse = await fetch(`/api/campaigns?limit=20&excludeId=${campaignId}`);
        const campaignsResult = await campaignsResponse.json();

        // Fetch charities - if we have related categories, fetch for each category
        // Otherwise fetch a larger set to ensure we have matches
        let charitiesResult: any = { charities: [] };
        
        if (relatedCharityCategories.length > 0) {
          // Fetch charities for each related category
          const charityPromises = relatedCharityCategories.map(category =>
            fetch(`/api/charities?limit=10&active=true&verified=true&category=${encodeURIComponent(category)}`)
              .then(res => res.json())
          );
          
          const charityResults = await Promise.all(charityPromises);
          // Combine all charities and remove duplicates
          const allCharities = charityResults.flatMap(result => result.charities || []);
          const uniqueCharities = Array.from(
            new Map(allCharities.map((c: any) => [c.id, c])).values()
          );
          charitiesResult = { charities: uniqueCharities };
        } else {
          // No specific categories, fetch a larger set
          const charitiesResponse = await fetch(`/api/charities?limit=50&active=true&verified=true`);
          charitiesResult = await charitiesResponse.json();
        }

        // Normalize both into unified items
        const allItems: UnifiedItem[] = [];
        
        if (campaignsResult.success && campaignsResult.data) {
          const normalizedCampaigns = campaignsResult.data
            .filter((c: any) => c.id !== campaignId)
            .map(normalizeCampaign);
          allItems.push(...normalizedCampaigns);
        }

        if (charitiesResult.charities) {
          const normalizedCharities = charitiesResult.charities.map(normalizeCharity);
          allItems.push(...normalizedCharities);
        }

        // Get related items based on category/reason
        const relatedItems = campaignReason 
          ? getRelatedItems(allItems, campaignReason, campaignId, 5)
          : allItems.slice(0, 5);

        if (relatedItems.length > 0) {
          // Transform to card format
          const transformedItems = relatedItems.map((item: UnifiedItem) => {
            const isCampaign = item.type === 'campaign';
            const isCharity = item.type === 'charity';

            const getValidCharityLogo = (logo?: string | null) => {
              if (!logo) return null;
              if (logo === "undefined") return null;
              if (logo.includes("logo.clearbit.com")) return null;
              return logo;
            };

            const safeDomainFromWebsite = (website?: string | null) => {
              if (!website) return null;
              try {
                const u = new URL(website);
                return u.hostname.replace(/^www\./, '');
              } catch {
                return null;
              }
            };

            const getFaviconFallbackUrl = (domain: string) => {
              // Prefer Google favicon service; it’s generally reliable.
              return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
            };
            
            const getCurrencySymbol = (currency: string) => {
              switch (currency?.toUpperCase()) {
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
                default: return currency || '$';
              }
            };

            const currencySymbol = isCampaign ? getCurrencySymbol(item.currency || 'USD') : '$';
            
            const getImageUrl = () => {
              // For charities, don't use fallback - return null if no image
              // This allows the component to show heart icon placeholder
              if (isCharity) {
                return item.coverImage || item.image || null;
              }
              // For campaigns, use fallback
              return item.coverImage || item.image || "/images/card-img1.png";
            };

            if (isCampaign) {
              return {
                id: item.id,
                slug: item.slug,
                type: 'campaign',
                title: item.title,
                description: item.description,
                raised: `${currencySymbol}${(item.currentAmount || 0).toLocaleString()} raised`,
                image: getImageUrl(),
                coverImageUrl: item.coverImage,
                reason: item.category,
                extra: item.goalAmount 
                  ? `Goal: ${currencySymbol}${item.goalAmount.toLocaleString()}. ${Math.round(((item.currentAmount || 0) / item.goalAmount) * 100)}% funded!`
                  : '',
                date: new Date(item.createdAt).toLocaleDateString(),
                timeLeft: getTimeRemaining({
                  id: item.id,
                  createdAt: item.createdAt,
                  duration: 'Not applicable',
                  currentAmount: item.currentAmount || 0,
                  goalAmount: item.goalAmount || 0,
                  status: item.status || 'active',
                  isActive: item.isActive ?? true,
                } as any),
                avatar: item.creatorAvatar,
                creator: item.creatorName || 'Unknown',
                createdFor: '',
                percentage: item.goalAmount 
                  ? `${Math.round(((item.currentAmount || 0) / item.goalAmount) * 100)}%`
                  : '0%',
                total: item.goalAmount 
                  ? `${currencySymbol}${item.goalAmount.toLocaleString()} total`
                  : '',
                donors: item.stats?.uniqueDonors || 0,
              };
            } else {
              // Charity
              const logo = getValidCharityLogo((item as any).logo);
              const domain = safeDomainFromWebsite((item as any).website);
              const favicon = domain ? getFaviconFallbackUrl(domain) : null;
              const charityCardImage = logo || favicon || getImageUrl();
              return {
                id: item.id,
                slug: item.slug,
                type: 'charity',
                title: item.title,
                description: item.description,
                raised: `${currencySymbol}${Number(item.totalReceived || 0).toLocaleString()} raised`,
                image: charityCardImage,
                coverImageUrl: charityCardImage,
                reason: item.category,
                extra: item.mission || '',
                date: new Date(item.createdAt).toLocaleDateString(),
                timeLeft: 'Ongoing',
                avatar: logo || (item as any).logo,
                creator: item.title,
                createdFor: '',
                percentage: '100%',
                total: `${currencySymbol}${Number(item.totalReceived || 0).toLocaleString()} total`,
                donors: 0,
                isVerified: item.isVerified,
              };
            }
          });
          setRelatedCampaigns(transformedItems);
        } else {
          setRelatedCampaigns([]);
        }
      } catch (err) {
        console.error('Error fetching related items:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch related items');
        setRelatedCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchRelatedItems();
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
    // Navigate based on type
    if (card.slug) {
      if (card.type === 'charity') {
        window.location.href = `/virtual-giving-mall/${card.slug}`;
      } else {
        window.location.href = `/campaign/${card.slug}`;
      }
    } else {
      // Fallback to drawer if slug is not available
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
              {card.type === 'charity' ? (
                // For charities, use heart icon fallback
                <CharityImageWithFallback
                  src={card.image}
                  alt={card.title}
                  title={card.title}
                  height={192}
                  width={400}
                  className="w-full h-48 object-cover"
                />
              ) : needsEmojiFallback(card.coverImageUrl || card.image) ? (
                // For campaigns, use emoji fallback if needed
                <EmojiFallbackImage
                  category={card.reason}
                  title={card.title}
                  className="w-full h-48"
                  width={400}
                  height={192}
                />
              ) : card.type === "charity" ? (
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-48 object-contain bg-white"
                />
              ) : (
                // For campaigns, use R2Image
                <R2Image
                  src={card.image}
                  alt={card.title}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {card.type === 'charity' && card.isVerified && (
                  <Badge className="bg-green-600 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {card.type === 'campaign' && (
                  <span className="bg-[#104901] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {card.percentage}
                  </span>
                )}
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
                {/* <CampaignCreatorAvatar
                  creatorName={card.creator}
                  creatorAvatar={card.avatar}
                  size={24}
                /> */}
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
