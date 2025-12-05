"use client";

import React from 'react';
import Link from 'next/link';
import { Heart, Share2, Eye, Calendar, User, Target, Shield, Globe, Stethoscope, GraduationCap, Home, TreePine, Music, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  
  const progressPercentage = isCampaign && item.goalAmount 
    ? Math.min(100, Math.round((item.currentAmount || 0) / item.goalAmount) * 100)
    : 0;

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
                <Button className="bg-[#104901] hover:bg-[#0d3a01] text-white">
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
  
  // Campaign cards - old design with description and raised amount
  if (isCampaign) {
    return (
      <div className="group relative overflow-hidden rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white">
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
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-[#104901] text-white">Campaign</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Link href={getItemUrl()}>
            <h3 className="font-semibold text-lg text-black mb-2 line-clamp-2 group-hover:text-[#104901] transition-colors">
              {item.title}
            </h3>
          </Link>
          <p className="text-sm text-[#757575] mb-3 line-clamp-2">
            {item.description}
          </p>

          {item.creatorName && (
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-[#757575]">by {item.creatorName}</span>
            </div>
          )}

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-lg text-black">
                {formatCurrency(item.currentAmount || 0, item.currency || 'USD')} raised
              </span>
              <span className="text-sm text-[#757575]">
                {item.stats?.uniqueDonors || 0} donors
              </span>
            </div>
            {item.goalAmount && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-[#104901] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-[#757575]">
                  {progressPercentage}% of {formatCurrency(item.goalAmount, item.currency || 'USD')}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1 text-xs text-[#757575]">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <Link href={getItemUrl()}>
              <Button size="sm" className="bg-[#104901] hover:bg-[#0d3a01] text-white text-xs">
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Charity cards - new virtual giving mall design
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white rounded-2xl">
      <CardContent className="p-0">
        {/* Logo Section with Gradient Overlay */}
        <div
          className="relative h-48 flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50"
          style={{
            backgroundImage: imageUrl && !needsFallback
              ? `linear-gradient(135deg, rgba(16, 73, 1, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%), url(${imageUrl})` 
              : 'linear-gradient(135deg, rgba(16, 73, 1, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
            backgroundSize: imageUrl && !needsFallback ? 'cover' : 'auto',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Animated gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 via-green-500/0 to-blue-500/0 group-hover:from-green-600/10 group-hover:via-green-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
          
          {/* Image or Fallback */}
          {needsFallback ? (
            <div className="text-center p-4 relative z-10">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-blue-600 p-4 rounded-full">
                  <CategoryIcon className="h-12 w-12 text-white" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-600 mt-3 max-w-[120px] mx-auto line-clamp-2">
                {item.title}
              </p>
            </div>
          ) : imageUrl ? (
            <R2Image
              src={imageUrl}
              alt={item.title}
              width={400}
              height={192}
              className="w-full h-full object-cover"
            />
          ) : null}
          
          {/* Verified Badge */}
          {item.isVerified && (
            <div className="absolute top-3 right-3 z-20">
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">Verified</span>
              </Badge>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3 z-20">
            <Badge className="bg-white/95 backdrop-blur-md text-gray-700 border border-gray-200 shadow-md px-3 py-1.5 flex items-center gap-1.5 hover:bg-white transition-colors">
              <CategoryIcon className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-medium">
                {item.category || 'Uncategorized'}
              </span>
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 bg-white">
          <div className="mb-5">
            <Link href={getItemUrl()}>
              <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300 line-clamp-2 min-h-[3rem]">
                {item.title}
              </h3>
            </Link>
            
            {/* Decorative divider */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-0.5 bg-gradient-to-r from-green-500 to-transparent flex-1"></div>
              <Heart className="h-4 w-4 text-red-400 fill-red-400" />
              <div className="h-0.5 bg-gradient-to-l from-green-500 to-transparent flex-1"></div>
            </div>
          </div>

          {/* Donate Button with enhanced design */}
          <Button
            asChild
            className="w-full bg-gradient-to-r from-green-600 to-[#104901] hover:text-white text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] shadow-md group/button"
          >
            <Link href={getItemUrl()} className="flex items-center justify-center gap-2">
              <span>Donate Now</span>
              <Heart className="h-4 w-4 group-hover/button:scale-110 transition-transform duration-300" />
            </Link>
          </Button>
        </div>

        {/* Bottom accent border */}
        <div className="h-1 bg-gradient-to-r from-green-500 via-green-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </CardContent>
    </Card>
  );
}

