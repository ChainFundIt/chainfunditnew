"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, Eye, Calendar, User, Target, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyWithConversion } from '@/lib/utils/currency';
import { GeolocationData } from '@/lib/utils/geolocation';
import { R2Image } from '@/components/ui/r2-image';
import { EmojiFallbackImage } from '@/components/ui/emoji-fallback-image';
import { needsEmojiFallback } from '@/lib/utils/campaign-emojis';

interface Campaign {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  reason: string;
  fundraisingFor: string;
  duration: string;
  videoUrl: string;
  coverImageUrl: string;
  galleryImages: string[];
  documents: string[];
  goalAmount: number;
  currency: string;
  minimumDonation: number;
  chainerCommissionRate: number;
  currentAmount: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  stats?: {
    totalDonations: number;
    totalAmount: number;
    uniqueDonors: number;
    progressPercentage: number;
  };
}

interface CampaignCardProps {
  campaign: Campaign;
  viewMode: 'grid' | 'list';
  geolocation?: GeolocationData | null;
  convertedAmounts?: {
    currentAmount: { amount: number; currency: string; originalAmount?: number; originalCurrency?: string };
    goalAmount: { amount: number; currency: string; originalAmount?: number; originalCurrency?: string };
  } | null;
}

export function CampaignCard({ campaign, viewMode, geolocation, convertedAmounts }: CampaignCardProps) {
  const progressPercentage = campaign.stats?.progressPercentage || 
    Math.min(100, Math.round((campaign.currentAmount / campaign.goalAmount) * 100));

  // Use converted amounts if available, otherwise use original amounts
  const displayCurrentAmount = convertedAmounts?.currentAmount || { amount: campaign.currentAmount, currency: campaign.currency };
  const displayGoalAmount = convertedAmounts?.goalAmount || { amount: campaign.goalAmount, currency: campaign.currency };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-purple-100 text-purple-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayText = (status: string, closedAt?: string) => {
    switch (status) {
      case 'closed':
        return 'Closed';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'paused':
        return 'Paused';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/3 h-[400px] relative">
            {needsEmojiFallback(campaign.coverImageUrl) ? (
              <EmojiFallbackImage
                category={campaign.reason}
                title={campaign.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <R2Image
                src={campaign.coverImageUrl!}
                alt={campaign.title}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                {getStatusDisplayText(campaign.status, campaign.closedAt)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="md:w-2/3 p-6 flex flex-col justify-between h-[400px]">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {campaign.title.slice(0, 40)}...
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {campaign.description}
                  </p>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{campaign.creatorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{formatDate(campaign.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{campaign.reason}</span>
                </div>
              </div>

              {/* Progress Bar */}
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
                  <span>{formatCurrencyWithConversion(displayCurrentAmount.amount, displayCurrentAmount.currency, displayCurrentAmount.originalAmount, displayCurrentAmount.originalCurrency)} raised</span>
                  <span>Goal: {formatCurrencyWithConversion(displayGoalAmount.amount, displayGoalAmount.currency, displayGoalAmount.originalAmount, displayGoalAmount.originalCurrency)}</span>
                </div>
              </div>

              {/* Stats */}
              {campaign.stats && (
                <div className="flex gap-6 text-sm text-gray-600 mb-4">
                  <span>{campaign.stats.totalDonations} donations</span>
                  <span>{campaign.stats.uniqueDonors} donors</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <Link href={`/campaign/${campaign.slug}`}>
                <Button className="">
                  <Eye className="h-4 w-4 mr-2" />
                  View Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view - Updated design matching homepage
  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-[#E8E8E8] hover:border-[#104901] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col">
      {/* IMAGE SECTION */}
      <div className="relative w-full h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {needsEmojiFallback(campaign.coverImageUrl) ? (
          <EmojiFallbackImage
            category={campaign.reason}
            title={campaign.title}
            className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <R2Image
            src={campaign.coverImageUrl!}
            alt={campaign.title}
            width={400}
            height={200}
            className="w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="font-jakarta font-bold text-xs text-[#104901] uppercase tracking-wider">
            {campaign.reason || 'Campaign'}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-[#333333] text-white px-3 py-1.5 rounded-full">
          <span className="font-jakarta font-bold text-xs">
            {campaign.duration || '12 days'} left
          </span>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-5 md:p-6 flex flex-col gap-4 flex-grow">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="font-jakarta font-regular text-xs text-[#999999] uppercase tracking-wider">
              Organized by <b className="text-black">{campaign.creatorName || 'Campaign'}</b>
            </p>
            {campaign.status === 'active' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#104901] border border-[#104901]/20">
                <Shield className="h-3 w-3" />
              </span>
            )}
          </div>
          <Link href={`/campaign/${campaign.slug}`}>
            <h3 className="font-jakarta font-bold text-lg text-black mb-2 hover:text-[#104901] transition-colors">
              {campaign.title.length > 50
                ? `${campaign.title.slice(0, 50)}...`
                : campaign.title}
            </h3>
          </Link>
          <p className="font-jakarta font-regular text-sm text-[#666666] line-clamp-2">
            {campaign.description}
          </p>
        </div>
        <div className="flex-grow" />
        <div className="border-t border-[#E8E8E8] pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-jakarta font-bold text-[#1ABD73]">
              {formatCurrency(displayCurrentAmount.amount, displayCurrentAmount.currency)} raised
            </span>
            <span className="font-jakarta font-regular text-[#999999] text-sm">
              {formatCurrency(displayGoalAmount.amount, displayGoalAmount.currency)} goal
            </span>
          </div>
          <div className="w-full bg-[#E8E8E8] h-2 rounded-full overflow-hidden mb-4">
            <div
              className="bg-[#1ABD73] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <Link href={`/campaign/${campaign.slug}`}>
            <button
              className="w-full py-2.5 px-4 bg-[#F5F5F4] text-black font-jakarta font-semibold text-sm rounded-lg hover:bg-[#59AD4A] hover:text-white transition-colors duration-300"
            >
              View Campaign
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}