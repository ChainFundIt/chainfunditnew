/**
 * Utilities for transforming and normalizing campaigns and charities into unified items
 */

import { UnifiedItem, CampaignItem, CharityItem, isCampaign, isCharity } from '@/lib/types/unified-item';
import { getCampaignReasonsForCharityCategory, getCharityCategoriesForCampaignReason } from '@/lib/utils/category-mapping';
import { needsEmojiFallback } from '@/lib/utils/campaign-emojis';

/**
 * Normalize a campaign into a unified item
 */
export function normalizeCampaign(campaign: any): UnifiedItem {
  // Get image - prefer gallery first image, then cover image
  const getImage = () => {
    if (campaign.galleryImages && Array.isArray(campaign.galleryImages) && campaign.galleryImages.length > 0) {
      const firstImage = campaign.galleryImages[0];
      if (firstImage && firstImage !== 'undefined') {
        return firstImage;
      }
    }
    return campaign.coverImageUrl || null;
  };

  const image = getImage();
  const reason = campaign.reason || 'Uncategorized';

  return {
    id: campaign.id,
    type: 'campaign',
    slug: campaign.slug,
    title: campaign.title,
    description: campaign.description,
    image: image,
    coverImage: image,
    category: reason, // Use reason as normalized category
    originalCategory: reason,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    goalAmount: typeof campaign.goalAmount === 'string' ? parseFloat(campaign.goalAmount) : campaign.goalAmount,
    currentAmount: typeof campaign.currentAmount === 'string' ? parseFloat(campaign.currentAmount) : campaign.currentAmount,
    currency: campaign.currency,
    status: campaign.status,
    isActive: campaign.isActive,
    reason: reason,
    creatorName: campaign.creatorName,
    creatorAvatar: campaign.creatorAvatar,
    stats: campaign.stats,
  };
}

/**
 * Get fallback image for charity based on category or use default
 */
export function getCharityFallbackImage(category?: string): string {
  // Map categories to available images in public/images
  const categoryImageMap: Record<string, string> = {
    'Health': '/images/blue-cross.jpg',
    'Education': '/images/happyChildren.png',
    'Community': '/images/volunteersHelping.png',
    'Environment': '/images/save-the-planet.jpg',
    'Children': '/images/happyChildren.png',
    'Disaster Relief': '/images/volunteersHelping.png',
  };
  
  if (category && categoryImageMap[category]) {
    return categoryImageMap[category];
  }
  
  // Default fallback
  return '/images/card-img1.png';
}

/**
 * Normalize a charity into a unified item
 */
export function normalizeCharity(charity: any): UnifiedItem {
  // Filter out clearbit.com URLs as they often return 403
  const hasValidCoverImage = charity.coverImage && !charity.coverImage.includes('logo.clearbit.com');
  const hasValidLogo = charity.logo && !charity.logo.includes('logo.clearbit.com');
  
  // Get image - prefer cover image, then logo, then fallback based on category
  // Skip clearbit URLs as they're unreliable
  const image = (hasValidCoverImage ? charity.coverImage : null) || 
                (hasValidLogo ? charity.logo : null) || 
                getCharityFallbackImage(charity.category);
  const category = charity.category || 'Uncategorized';

  return {
    id: charity.id,
    type: 'charity',
    slug: charity.slug,
    title: charity.name, // Charities use 'name' instead of 'title'
    description: charity.description,
    image: image,
    coverImage: image,
    category: category, // Use category as normalized category
    originalCategory: category,
    createdAt: charity.createdAt,
    updatedAt: charity.updatedAt,
    totalReceived: typeof charity.totalReceived === 'string' ? parseFloat(charity.totalReceived) : charity.totalReceived,
    isVerified: charity.isVerified,
    mission: charity.mission,
    logo: charity.logo,
  };
}

/**
 * Merge campaigns and charities into a unified list, sorted by newest first
 */
export function mergeAndSort(
  campaigns: any[],
  charities: any[]
): UnifiedItem[] {
  const normalizedCampaigns = campaigns.map(normalizeCampaign);
  const normalizedCharities = charities.map(normalizeCharity);
  
  const merged = [...normalizedCampaigns, ...normalizedCharities];
  
  // Sort by newest first (createdAt descending)
  return merged.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
}

/**
 * Group items by category, only including categories that have matches
 */
export function groupByCategory(items: UnifiedItem[]): Record<string, UnifiedItem[]> {
  const grouped: Record<string, UnifiedItem[]> = {};
  
  items.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  
  // Remove empty groups
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });
  
  return grouped;
}

/**
 * Get related items for a given category/reason
 * Returns both campaigns and charities that match
 */
export function getRelatedItems(
  items: UnifiedItem[],
  categoryOrReason: string,
  excludeId?: string,
  limit: number = 5
): UnifiedItem[] {
  const related: UnifiedItem[] = [];
  
  // Get all related categories/reasons
  const relatedCategories = new Set<string>([categoryOrReason]);
  
  // If it's a campaign reason, get matching charity categories
  const charityCategories = getCharityCategoriesForCampaignReason(categoryOrReason);
  charityCategories.forEach(cat => relatedCategories.add(cat));
  
  // If it's a charity category, get matching campaign reasons
  const campaignReasons = getCampaignReasonsForCharityCategory(categoryOrReason);
  campaignReasons.forEach(reason => relatedCategories.add(reason));
  
  // Filter items that match any related category and exclude the current item
  items.forEach(item => {
    if (excludeId && item.id === excludeId) return;
    
    if (relatedCategories.has(item.category)) {
      related.push(item);
    }
  });
  
  // Sort by newest first and limit
  return related
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, limit);
}

/**
 * Check if an item needs emoji fallback
 */
export function itemNeedsEmojiFallback(item: UnifiedItem): boolean {
  const imageUrl = item.coverImage ?? item.image;
  return needsEmojiFallback(imageUrl ?? undefined);
}

