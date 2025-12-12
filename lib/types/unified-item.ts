/**
 * Unified types for campaigns and charities
 */

export type ItemType = 'campaign' | 'charity';

export interface UnifiedItem {
  id: string;
  type: ItemType;
  slug: string;
  title: string;
  description: string;
  image?: string | null;
  coverImage?: string | null;
  category: string; // Normalized category/reason
  originalCategory: string; // Original category/reason from source
  createdAt: string | Date;
  updatedAt: string | Date;
  
  // Campaign-specific fields (optional)
  goalAmount?: number;
  currentAmount?: number;
  currency?: string;
  status?: string;
  isActive?: boolean;
  reason?: string;
  creatorName?: string;
  creatorAvatar?: string;
  stats?: {
    totalDonations?: number;
    uniqueDonors?: number;
  };
  
  // Charity-specific fields (optional)
  totalReceived?: string | number;
  isVerified?: boolean;
  mission?: string;
  logo?: string;
  website?: string;
}

export interface CampaignItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl?: string | null;
  galleryImages?: string[];
  reason: string | null;
  goalAmount: number | string;
  currentAmount: number | string;
  currency: string;
  status: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  creatorName?: string;
  creatorAvatar?: string;
  stats?: {
    totalDonations?: number;
    uniqueDonors?: number;
  };
}

export interface CharityItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImage?: string | null;
  logo?: string | null;
  website?: string | null;
  category: string;
  totalReceived: string | number;
  isVerified: boolean;
  mission?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Type guard to check if item is a campaign
 */
export function isCampaign(item: UnifiedItem | CampaignItem | CharityItem): item is CampaignItem {
  return 'reason' in item || 'goalAmount' in item;
}

/**
 * Type guard to check if item is a charity
 */
export function isCharity(item: UnifiedItem | CampaignItem | CharityItem): item is CharityItem {
  return 'category' in item && 'isVerified' in item && !('reason' in item);
}

