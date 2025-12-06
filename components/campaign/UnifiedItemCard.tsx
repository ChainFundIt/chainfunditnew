"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Share2, Eye, Calendar, User, Target, Shield, Globe, Stethoscope, GraduationCap, Home, TreePine, Music, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { R2Image } from '@/components/ui/r2-image';
import { EmojiFallbackImage } from '@/components/ui/emoji-fallback-image';
import { itemNeedsEmojiFallback } from '@/lib/utils/unified-items';
import { UnifiedItem } from '@/lib/types/unified-item';
import { GeolocationData } from '@/lib/utils/geolocation';

// Category icon mapping
const categoryIcons: Record<string, any> = {
  "Health": Stethoscope,
  "Children": User,
  "Children & Youth": User,
  "Education": GraduationCap,
  "Community": Home,
  "Environment": TreePine,
  "Arts": Music,
  "Housing": Home,
  "Housing & Shelter": Home,
  "Global": Globe,
  "Disaster Relief": Shield,
  "Hunger & Poverty": Heart,
  "Employment & Training": BookOpen,
  "Medical": Stethoscope,
  "Family": User,
  "Welfare": Heart,
  "Creative": Music,
  "Emergency": Shield,
  "Business": BookOpen,
  "Charity": Heart,
  "Memorial": Heart,
  "Religion": Heart,
  "Sports": Target,
  "Uncategorized": Globe,
};

interface UnifiedItemCardProps {
  item: UnifiedItem;
  viewMode: 'grid' | 'list';
  geolocation?: GeolocationData | null;
}

export function UnifiedItemCard({ item, viewMode, geolocation }: UnifiedItemCardProps) {
  const isCampaign = item.type === 'campaign';
  const isCharity = item.type === 'charity';
  const [isFavourited, setIsFavourited] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  
  const progressPercentage = isCampaign && item.goalAmount 
    ? Math.min(100, Math.round((item.currentAmount || 0) / item.goalAmount) * 100)
    : 0;

  // Check favourite status on mount
  useEffect(() => {
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
        console.error('Error checking favourite status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkFavouriteStatus();
  }, [item.id, item.type]);

  const handleToggleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;

    setIsToggling(true);
    try {
      const response = await fetch('/api/favourites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('Error toggling favourite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getItemUrl = () => {
    if (isCampaign) {
      return `/campaign/${item.slug}`;
    }
    return `/virtual-giving-mall/${item.slug}`;
  };

  const needsFallback = itemNeedsEmojiFallback(item);

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/3 h-[400px] relative">
            {needsFallback ? (
              <EmojiFallbackImage
                category={item.category}
                title={item.title}
                className="w-full h-full object-cover"
                fill
              />
            ) : (
              <R2Image
                src={item.coverImage || item.image || ''}
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
                  <span className="text-sm text-gray-600">by {item.creatorName}</span>
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
  const CategoryIcon = categoryIcons[item.category || 'Uncategorized'] || Heart;
  const imageUrl = item.coverImage || item.image || '';
  
  // Campaign cards - simple design
  if (isCampaign) {
    return (
      <div className="bg-white h-fit rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Image */}
        <div className="relative">
          {needsFallback ? (
            <EmojiFallbackImage
              category={item.category}
              title={item.title}
              className="w-full h-48 group-hover:scale-105 transition-transform duration-300"
              width={400}
              height={192}
            />
          ) : (
            <R2Image
              src={imageUrl}
              alt={item.title}
              width={400}
              height={300}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute top-3 left-3">
            <Badge className="bg-[#104901] text-white">Campaign</Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 bg-white/80 hover:bg-white ${isFavourited ? 'text-red-500' : ''}`}
              onClick={handleToggleFavourite}
              disabled={isToggling || isChecking}
            >
              <Heart className={`h-4 w-4 ${isFavourited ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <Link href={getItemUrl()}>
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-[#104901] transition-colors">
                {item.title}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {item.description}
            </p>
          </div>

          {/* Creator */}
          {item.creatorName && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-3 w-3 text-gray-500" />
              </div>
              <span className="text-sm text-gray-600">by {item.creatorName}</span>
            </div>
          )}

          {/* Progress */}
          {item.goalAmount && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{formatCurrency(item.currentAmount || 0, item.currency || 'USD')} raised</span>
                <span>{formatCurrency(item.goalAmount, item.currency || 'USD')}</span>
              </div>
            </div>
          )}

          {/* Category and Date */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span>{item.category || 'Uncategorized'}</span>
            <span>{formatDate(item.createdAt)}</span>
          </div>

          {/* Action Button */}
          <Link href={getItemUrl()} className="block">
            <Button className="w-full bg-[#104901] text-white">
              View Campaign
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Charity cards - matching campaign card design
  return (
    <div className="bg-white h-fit rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <div className="relative">
        {needsFallback ? (
          <EmojiFallbackImage
            category={item.category}
            title={item.title}
            className="w-full h-48 group-hover:scale-105 transition-transform duration-300"
            width={400}
            height={192}
          />
        ) : (
          <R2Image
            src={imageUrl}
            alt={item.title}
            width={400}
            height={300}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {item.isVerified && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-600 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 w-8 p-0 bg-white/80 hover:bg-white ${isFavourited ? 'text-red-500' : ''}`}
            onClick={handleToggleFavourite}
            disabled={isToggling || isChecking}
          >
            <Heart className={`h-4 w-4 ${isFavourited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <Link href={getItemUrl()}>
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-[#104901] transition-colors">
              {item.title}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {item.description}
          </p>
        </div>

        {/* Category and Date */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{item.category || 'Uncategorized'}</span>
          <span>{formatDate(item.createdAt)}</span>
        </div>

        {/* Action Button */}
        <Link href={getItemUrl()} className="block">
          <Button className="w-full bg-[#104901] text-white">
            Donate Now
          </Button>
        </Link>
      </div>
    </div>
  );
}

