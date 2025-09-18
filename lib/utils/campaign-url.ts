/**
 * Utility functions for generating campaign URLs
 */

/**
 * Generates a campaign URL using the slug
 * @param campaign - Campaign object with slug
 * @returns Campaign URL
 */
export function getCampaignUrl(campaign: { slug: string }): string {
  return `/campaign/${campaign.slug}`;
}

/**
 * Generates a full campaign URL with domain
 * @param campaign - Campaign object with slug
 * @param baseUrl - Base URL (defaults to current origin)
 * @returns Full campaign URL
 */
export function getFullCampaignUrl(
  campaign: { slug: string },
  baseUrl?: string
): string {
  const path = getCampaignUrl(campaign);
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${origin}${path}`;
}

/**
 * Generates a campaign URL with referral code
 * @param campaign - Campaign object with slug
 * @param referralCode - Referral code to append
 * @returns Campaign URL with referral parameter
 */
export function getCampaignUrlWithReferral(
  campaign: { slug: string },
  referralCode: string
): string {
  const baseUrl = getCampaignUrl(campaign);
  return `${baseUrl}?ref=${referralCode}`;
}

