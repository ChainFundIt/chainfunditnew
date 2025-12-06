import { db } from '@/lib/db';
import { userPreferences } from '@/lib/schema/user-preferences';
import { eq } from 'drizzle-orm';
import { convertCurrency } from '@/lib/utils/geolocation';

/**
 * Check if user should receive a donation notification based on their preferences
 * @param userId - The user ID to check preferences for
 * @param donationAmount - The donation amount
 * @param donationCurrency - The donation currency code
 * @returns Object with shouldNotify flag and isLargeDonation flag
 */
export async function shouldNotifyUserOfDonation(
  userId: string,
  donationAmount: number | string,
  donationCurrency: string
): Promise<{ shouldNotify: boolean; isLargeDonation: boolean; reason?: string }> {
  try {
    // Get user preferences
    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    // Default to true if no preferences exist (backward compatibility)
    if (!preferences) {
      return {
        shouldNotify: true,
        isLargeDonation: false,
        reason: 'No preferences found, defaulting to notify',
      };
    }

    // Check if campaign donation notifications are enabled
    if (!preferences.notifyOnCampaignDonation) {
      return {
        shouldNotify: false,
        isLargeDonation: false,
        reason: 'Campaign donation notifications are disabled',
      };
    }

    // Parse donation amount
    const amount = typeof donationAmount === 'string' ? parseFloat(donationAmount) : donationAmount;

    // Check if it's a large donation
    const threshold = parseFloat(preferences.largeDonationThreshold || '1000'); // Default to 1000 USD
    
    // Convert donation amount to USD for comparison
    let amountInUSD = amount;
    if (donationCurrency.toUpperCase() !== 'USD') {
      try {
        const conversion = await convertCurrency(amount, donationCurrency, 'USD');
        if (conversion) {
          amountInUSD = conversion.convertedAmount;
        } else {
          // If conversion fails, use a simple approximation
          // This is a fallback - in production you'd want proper exchange rates
          console.warn(`Currency conversion failed for ${donationCurrency}, using direct comparison`);
        }
      } catch (error) {
        console.error('Error converting currency:', error);
        // Fallback: assume 1:1 if conversion fails (not ideal but prevents errors)
      }
    }

    const isLargeDonation = amountInUSD >= threshold;

    // If it's a large donation, check if large donation notifications are enabled
    if (isLargeDonation && !preferences.notifyOnLargeDonation) {
      // Still notify if regular campaign donations are enabled, but don't mark as large
      return {
        shouldNotify: true,
        isLargeDonation: false,
        reason: 'Large donation notifications disabled, but regular notifications enabled',
      };
    }

    return {
      shouldNotify: true,
      isLargeDonation: isLargeDonation && preferences.notifyOnLargeDonation,
      reason: isLargeDonation ? 'Large donation detected' : 'Regular donation notification',
    };
  } catch (error) {
    console.error('Error checking user notification preferences:', error);
    // Default to true on error to ensure users don't miss notifications
    return {
      shouldNotify: true,
      isLargeDonation: false,
      reason: 'Error checking preferences, defaulting to notify',
    };
  }
}

/**
 * Format donation notification message based on whether it's a large donation
 */
export function formatDonationNotificationMessage(
  amount: number | string,
  currency: string,
  isLargeDonation: boolean
): { title: string; message: string } {
  // Parse and format the amount
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isNGN = currency.toUpperCase() === 'NGN';
  const formattedAmount = isNGN 
    ? Math.round(numAmount).toLocaleString('en-US')
    : numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const currencySymbol = 
    currency === 'NGN' ? '₦' :
    currency === 'GBP' ? '£' :
    currency === 'EUR' ? '€' : '$';

  if (isLargeDonation) {
    return {
      title: '🎉 Large Donation Received!',
      message: `You received a large donation of ${currencySymbol}${formattedAmount} ${currency}! Thank you for your campaign!`,
    };
  }

  return {
    title: 'New Donation Received!',
    message: `You received a donation of ${currencySymbol}${formattedAmount} ${currency}. Thank you for your campaign!`,
  };
}

