"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Share2,
  Eye,
  Calendar,
  User,
  Target,
  Shield,
  Globe,
  Stethoscope,
  GraduationCap,
  Home,
  TreePine,
  Music,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { R2Image } from "@/components/ui/r2-image";
import { EmojiFallbackImage } from "@/components/ui/emoji-fallback-image";
import { itemNeedsEmojiFallback } from "@/lib/utils/unified-items";
import { UnifiedItem } from "@/lib/types/unified-item";
import { GeolocationData } from "@/lib/utils/geolocation";
import { useAuth } from "@/hooks/use-auth";
import { needsEmojiFallback } from "@/lib/utils/campaign-emojis";

// Category icon mapping
const categoryIcons: Record<string, any> = {
  Health: Stethoscope,
  Children: User,
  "Children & Youth": User,
  Education: GraduationCap,
  Community: Home,
  Environment: TreePine,
  Arts: Music,
  Housing: Home,
  "Housing & Shelter": Home,
  Global: Globe,
  "Disaster Relief": Shield,
  "Hunger & Poverty": Heart,
  "Employment & Training": BookOpen,
  Medical: Stethoscope,
  Family: User,
  Welfare: Heart,
  Creative: Music,
  Emergency: Shield,
  Business: BookOpen,
  Charity: Heart,
  Memorial: Heart,
  Religion: Heart,
  Sports: Target,
  Uncategorized: Globe,
};

interface UnifiedItemCardProps {
  item: UnifiedItem;
  viewMode: "grid" | "list";
  geolocation?: GeolocationData | null;
}

export function UnifiedItemCard({
  item,
  viewMode,
  geolocation,
}: UnifiedItemCardProps) {
  const isCampaign = item.type === "campaign";
  const isCharity = item.type === "charity";
  const [isFavourited, setIsFavourited] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const progressPercentage =
    isCampaign && item.goalAmount
      ? Math.min(
          100,
          Math.round((item.currentAmount || 0) / item.goalAmount) * 100
        )
      : 0;

  // Check favourite status on mount (only if user is authenticated)
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsChecking(false);
      return;
    }

    const checkFavouriteStatus = async () => {
      try {
        const response = await fetch(
          `/api/favourites/check?itemType=${item.type}&itemId=${item.id}`
        );
        const data = await response.json();
        if (data.success) {
          setIsFavourited(data.data.isFavourited);
        }
      } catch (error) {
        console.error("Error checking favourite status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkFavouriteStatus();
  }, [item.id, item.type, user, authLoading]);

  const handleToggleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return;

    // Check if user is authenticated
    if (!user) {
      // Store pending favorite action
      localStorage.setItem(
        "pending_favorite",
        JSON.stringify({
          itemType: item.type,
          itemId: item.id,
          itemTitle: item.title,
        })
      );

      // Redirect to signin with message
      const currentPath = window.location.pathname + window.location.search;
      const itemTypeLabel = item.type === "campaign" ? "campaign" : "charity";
      router.push(
        `/signin?redirect=${encodeURIComponent(currentPath)}&message=${encodeURIComponent(`Log in to add this ${itemTypeLabel} to your favorites`)}`
      );
      return;
    }

    setIsToggling(true);
    try {
      const response = await fetch("/api/favourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType: item.type,
          itemId: item.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsFavourited(data.data.isFavourited);
      }
    } catch (error) {
      console.error("Error toggling favourite:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getItemUrl = () => {
    if (isCampaign) {
      return `/campaign/${item.slug}`;
    }
    return `/virtual-giving-mall/${item.slug}`;
  };

  const getValidCharityLogo = (logo?: string | null) => {
    if (!logo) return null;
    if (logo === "undefined") return null;
    if (logo.includes("logo.clearbit.com")) return null;
    return logo;
  };

  const charityLogo = isCharity ? getValidCharityLogo((item as any).logo) : null;
  const charityCardImageSrc =
    (charityLogo ?? item.coverImage ?? item.image ?? "") || "";
  const needsFallback = isCharity
    ? needsEmojiFallback(charityCardImageSrc || undefined)
    : itemNeedsEmojiFallback(item);

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/3 h-[400px] relative">
            {isCharity && charityLogo ? (
              <img
                src={charityLogo}
                alt={item.title}
                className="w-full h-full object-contain bg-white"
              />
            ) : needsFallback ? (
              <EmojiFallbackImage
                category={item.category}
                title={item.title}
                className="w-full h-full object-cover"
                fill
              />
            ) : (
              <R2Image
                src={charityCardImageSrc}
                alt={item.title}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            )}
            {isCharity && item.isVerified && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-600 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            )}
            {isCampaign && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-[#104901] text-white">Campaign</Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="md:w-2/3 p-6 flex flex-col justify-between h-[400px]">
            <div>
              <div className="flex items-start justify-between mb-2">
                <Link href={getItemUrl()}>
                  <h3 className="text-2xl font-bold text-gray-900 hover:text-[#104901] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </Link>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {item.description}
              </p>

              {isCampaign && item.creatorName && (
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    by {item.creatorName}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(item.createdAt)}</span>
              </div>
              <Link href={getItemUrl()}>
                <Button className="bg-[#104901] text-white">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  const CategoryIcon = categoryIcons[item.category || "Uncategorized"] || Heart;
  const imageUrl = item.coverImage || item.image || "";

  // Campaign cards
  if (isCampaign) {
    return (
      <div className="group rounded-2xl overflow-hidden bg-white border border-[#E8E8E8] hover:border-[#104901] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col">
        {/* IMAGE SECTION */}
        <div className="relative w-full h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {needsFallback ? (
            <EmojiFallbackImage
              category={item.category}
              title={item.title}
              className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500"
              width={400}
              height={200}
            />
          ) : (
            <R2Image
              src={imageUrl}
              alt={item.title}
              width={400}
              height={200}
              className="w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="font-jakarta font-bold text-xs text-[#104901] uppercase tracking-wider">
              {item.category || "Campaign"}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 bg-white/80 hover:bg-white ${isFavourited ? "text-red-500" : ""}`}
              onClick={handleToggleFavourite}
              disabled={isToggling || isChecking}
            >
              <Heart
                className={`h-4 w-4 ${isFavourited ? "fill-current" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="p-5 md:p-6 flex flex-col gap-4 flex-grow">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-jakarta font-regular text-xs text-[#999999] uppercase tracking-wider">
                Organized by{" "}
                <b className="text-black">{item.category || "Campaign"}</b>
              </p>
              {item.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#104901] border border-[#104901]/20">
                  <Shield className="h-3 w-3" />
                </span>
              )}
            </div>
            <Link href={getItemUrl()}>
              <h3 className="font-jakarta font-bold text-lg text-black mb-2 hover:text-[#104901] transition-colors">
                {item.title.length > 50
                  ? `${item.title.slice(0, 50)}...`
                  : item.title}
              </h3>
            </Link>
            <p className="font-jakarta font-regular text-sm text-[#666666] line-clamp-2">
              {item.description}
            </p>
          </div>
          <div className="flex-grow" />
          <div className="border-t border-[#E8E8E8] pt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-jakarta font-bold text-[#1ABD73]">
                {formatCurrency(
                  item.currentAmount || 0,
                  item.currency || "USD"
                )}{" "}
                raised
              </span>
              <span className="font-jakarta font-regular text-[#999999] text-sm">
                {formatCurrency(item.goalAmount || 0, item.currency || "USD")}{" "}
                goal
              </span>
            </div>
            <div className="w-full bg-[#E8E8E8] h-2 rounded-full overflow-hidden mb-4">
              <div
                className="bg-[#1ABD73] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <Link href={getItemUrl()}>
              <button className="w-full py-2.5 px-4 bg-[#F5F5F4] text-black font-jakarta font-semibold text-sm rounded-lg hover:bg-[#59AD4A] hover:text-white transition-colors duration-300">
                View Campaign
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Charity cards
  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-[#E8E8E8] hover:border-[#104901] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col">
      {/* IMAGE SECTION */}
      <div className="relative w-full h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
        {charityLogo ? (
          <img
            src={charityLogo}
            alt={item.title}
            className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500"
          />
        ) : needsFallback ? (
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-full">
                <CategoryIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={charityCardImageSrc}
            alt={item.title}
            className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="font-jakarta font-bold text-xs text-[#104901] uppercase tracking-wider">
            {item.category || "Charity"}
          </span>
        </div>
        {item.isVerified && (
          <div className="absolute top-4 right-4 bg-[#59AD4A] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            <span className="font-jakarta font-bold text-xs">Verified</span>
          </div>
        )}
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5 md:p-6 flex flex-col gap-4 flex-grow">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="font-jakarta font-regular text-xs text-[#999999] uppercase tracking-wider">
              Charity{" "}
              <b className="text-black">{item.category || "Organization"}</b>
            </p>
          </div>
          <Link href={getItemUrl()}>
            <h3 className="font-jakarta font-bold text-lg text-black mb-2 hover:text-[#104901] transition-colors">
              {item.title.length > 50
                ? `${item.title.slice(0, 50)}...`
                : item.title}
            </h3>
          </Link>
          <p className="font-jakarta font-regular text-sm text-[#666666] line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="flex-grow" />
        <div className="border-t border-[#E8E8E8] pt-4">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              {/* <div className="h-0.5 bg-gradient-to-r from-[#59AD4A] to-transparent flex-1 w-8"></div> */}
              <Heart className="h-0 w-0 text-red-400 fill-red-400" />
              {/* <div className="h-0.5 bg-gradient-to-l from-[#59AD4A] to-transparent flex-1 w-8"></div> */}
            </div>
          </div>
          <Link href={getItemUrl()}>
            <button className="w-full py-2.5 px-4 bg-white text-black font-jakarta font-semibold text-sm rounded-lg hover:bg-[#59AD4A] hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 border border-gray-200">
              <Heart className="h-0 w-0" />
              Donate Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
