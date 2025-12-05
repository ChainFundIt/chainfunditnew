/**
 * Maps charity categories to campaign reasons and vice versa
 * Used to group related campaigns and charities together
 */

// Charity categories to Campaign reasons mapping
export const CHARITY_TO_CAMPAIGN_MAP: Record<string, string> = {
  'Health': 'Medical',
  'Education': 'Education',
  'Children': 'Family',
  'Children & Youth': 'Family',
  'Community': 'Community',
  'Housing': 'Community',
  'Housing & Shelter': 'Community',
  'Environment': 'Welfare',
  'Arts': 'Creative',
  'Disaster Relief': 'Emergency',
  'Employment & Training': 'Business',
  'Global': 'Charity',
};

// Campaign reasons to Charity categories mapping (reverse)
export const CAMPAIGN_TO_CHARITY_MAP: Record<string, string[]> = {
  'Medical': ['Health'],
  'Education': ['Education'],
  'Family': ['Children', 'Children & Youth'],
  'Community': ['Community', 'Housing', 'Housing & Shelter'],
  'Welfare': ['Environment'],
  'Creative': ['Arts'],
  'Emergency': ['Disaster Relief'],
  'Business': ['Employment & Training'],
  'Charity': ['Global'],
  'Memorial': [], // No direct charity equivalent
  'Religion': [], // No direct charity equivalent
  'Sports': [], // No direct charity equivalent
  'Pets': [], // No direct charity equivalent
  'Uncategorized': [],
};

/**
 * Get campaign reason(s) that match a charity category
 */
export function getCampaignReasonsForCharityCategory(charityCategory: string): string[] {
  const campaignReason = CHARITY_TO_CAMPAIGN_MAP[charityCategory];
  return campaignReason ? [campaignReason] : [];
}

/**
 * Get charity categories that match a campaign reason
 */
export function getCharityCategoriesForCampaignReason(campaignReason: string): string[] {
  return CAMPAIGN_TO_CHARITY_MAP[campaignReason] || [];
}

/**
 * Check if a charity category and campaign reason are related
 */
export function areRelated(categoryOrReason1: string, categoryOrReason2: string): boolean {
  // Check direct mapping
  if (CHARITY_TO_CAMPAIGN_MAP[categoryOrReason1] === categoryOrReason2) {
    return true;
  }
  if (CHARITY_TO_CAMPAIGN_MAP[categoryOrReason2] === categoryOrReason1) {
    return true;
  }
  
  // Check reverse mapping
  const categories1 = CAMPAIGN_TO_CHARITY_MAP[categoryOrReason1] || [];
  if (categories1.includes(categoryOrReason2)) {
    return true;
  }
  
  const categories2 = CAMPAIGN_TO_CHARITY_MAP[categoryOrReason2] || [];
  if (categories2.includes(categoryOrReason1)) {
    return true;
  }
  
  return false;
}

/**
 * Get all related categories/reasons for a given category or reason
 */
export function getRelatedCategories(categoryOrReason: string): string[] {
  const related: string[] = [categoryOrReason];
  
  // If it's a charity category, get campaign reason
  const campaignReason = CHARITY_TO_CAMPAIGN_MAP[categoryOrReason];
  if (campaignReason) {
    related.push(campaignReason);
  }
  
  // If it's a campaign reason, get charity categories
  const charityCategories = CAMPAIGN_TO_CHARITY_MAP[categoryOrReason] || [];
  related.push(...charityCategories);
  
  return [...new Set(related)];
}

