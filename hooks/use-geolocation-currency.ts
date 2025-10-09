import { useState, useEffect } from 'react';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  country: string;
}

export interface LocationInfo {
  country: string;
  countryCode: string;
  currency: CurrencyInfo;
}

// Currency mapping by country
const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  'NG': { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria' },
  'US': { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
  'GB': { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
  'CA': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
  'AU': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
  'DE': { code: 'EUR', symbol: '€', name: 'Euro', country: 'Germany' },
  'FR': { code: 'EUR', symbol: '€', name: 'Euro', country: 'France' },
  'IT': { code: 'EUR', symbol: '€', name: 'Euro', country: 'Italy' },
  'ES': { code: 'EUR', symbol: '€', name: 'Euro', country: 'Spain' },
  'NL': { code: 'EUR', symbol: '€', name: 'Euro', country: 'Netherlands' },
  'ZA': { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
  'KE': { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya' },
  'GH': { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', country: 'Ghana' },
  'EG': { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', country: 'Egypt' },
  'IN': { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
  'CN': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
  'JP': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
  'BR': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil' },
  'MX': { code: 'MXN', symbol: '$', name: 'Mexican Peso', country: 'Mexico' },
  'AR': { code: 'ARS', symbol: '$', name: 'Argentine Peso', country: 'Argentina' },
};

// Default fallback
const DEFAULT_CURRENCY: CurrencyInfo = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  country: 'United States'
};

export function useGeolocationCurrency() {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectLocationAndCurrency();
  }, []);

  const detectLocationAndCurrency = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get location from IP geolocation
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      const countryCode = data.country_code?.toUpperCase();

      if (!countryCode) {
        throw new Error('Country code not found');
      }

      // Get currency info for the country
      const currency = CURRENCY_MAP[countryCode] || DEFAULT_CURRENCY;

      setLocationInfo({
        country: data.country_name || currency.country,
        countryCode,
        currency,
      });

    } catch (err) {
      console.error('Error detecting location:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect location');
      
      // Fallback to default
      setLocationInfo({
        country: DEFAULT_CURRENCY.country,
        countryCode: 'US',
        currency: DEFAULT_CURRENCY,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPresetAmounts = (currencyCode: string): string[] => {
    // Adjust preset amounts based on currency
    switch (currencyCode) {
      case 'NGN':
        // Nigerian Naira - higher amounts due to exchange rate
        return ['5000', '10000', '25000', '50000', '100000', '250000'];
      case 'GBP':
        // British Pound - slightly lower amounts
        return ['20', '40', '80', '200', '400', '800'];
      case 'EUR':
        // Euro - similar to USD
        return ['25', '50', '100', '250', '500', '1000'];
      case 'CAD':
      case 'AUD':
        // Canadian/Australian Dollar - similar to USD
        return ['25', '50', '100', '250', '500', '1000'];
      case 'USD':
      default:
        // US Dollar - default amounts
        return ['25', '50', '100', '250', '500', '1000'];
    }
  };

  const formatAmount = (amount: string, currencyCode: string): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';

    const currency = Object.values(CURRENCY_MAP).find(c => c.code === currencyCode) || DEFAULT_CURRENCY;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'NGN' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'NGN' ? 0 : 2,
    }).format(num);
  };

  return {
    locationInfo,
    loading,
    error,
    getPresetAmounts,
    formatAmount,
    refetch: detectLocationAndCurrency,
  };
}
