/**
 * Currency conversion utility
 * Fetches exchange rates and converts amounts between currencies
 */

export interface ExchangeRateResponse {
  success: boolean;
  rate?: number;
  date?: string;
  error?: string;
}

/**
 * Fetch exchange rate from an external API
 * Uses exchangerate-api.io (free tier) or similar service
 */
export async function fetchExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  date?: Date
): Promise<ExchangeRateResponse> {
  try {
    // If same currency, return 1.0
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return {
        success: true,
        rate: 1.0,
        date: date ? date.toISOString() : new Date().toISOString(),
      };
    }

    // Use exchangerate-api.io (free tier, no API key required for basic usage)
    // Alternative: You can use exchangerate.host, fixer.io, or currencyapi.net
    const baseUrl = 'https://api.exchangerate-api.com/v4';
    const endpoint = date
      ? `${baseUrl}/history/${fromCurrency.toUpperCase()}/${date.toISOString().split('T')[0]}`
      : `${baseUrl}/latest/${fromCurrency.toUpperCase()}`;

    const response = await fetch(endpoint, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`);
    }

    const data = await response.json();

    // Handle historical data (has 'rates' object)
    if (date && data.rates) {
      const rate = data.rates[toCurrency.toUpperCase()];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }
      return {
        success: true,
        rate: rate,
        date: date.toISOString(),
      };
    }

    // Handle latest data (has 'rates' object)
    if (data.rates) {
      const rate = data.rates[toCurrency.toUpperCase()];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }
      return {
        success: true,
        rate: rate,
        date: data.date || new Date().toISOString(),
      };
    }

    throw new Error('Invalid response format from exchange rate API');
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch exchange rate',
    };
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date?: Date
): Promise<{ success: boolean; convertedAmount?: number; rate?: number; date?: string; error?: string }> {
  try {
    const rateResponse = await fetchExchangeRate(fromCurrency, toCurrency, date);

    if (!rateResponse.success || !rateResponse.rate) {
      return {
        success: false,
        error: rateResponse.error || 'Failed to fetch exchange rate',
      };
    }

    const convertedAmount = amount * rateResponse.rate;

    return {
      success: true,
      convertedAmount: Number(convertedAmount.toFixed(2)),
      rate: rateResponse.rate,
      date: rateResponse.date,
    };
  } catch (error) {
    console.error('Error converting currency:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert currency',
    };
  }
}

/**
 * Get exchange rate using alternative API (exchangerate.host) as fallback
 */
export async function fetchExchangeRateFallback(
  fromCurrency: string,
  toCurrency: string,
  date?: Date
): Promise<ExchangeRateResponse> {
  try {
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return {
        success: true,
        rate: 1.0,
        date: date ? date.toISOString() : new Date().toISOString(),
      };
    }

    // Use exchangerate.host as fallback (free, no API key)
    const baseUrl = 'https://api.exchangerate.host';
    const endpoint = date
      ? `${baseUrl}/${date.toISOString().split('T')[0]}?base=${fromCurrency.toUpperCase()}&symbols=${toCurrency.toUpperCase()}`
      : `${baseUrl}/latest?base=${fromCurrency.toUpperCase()}&symbols=${toCurrency.toUpperCase()}`;

    const response = await fetch(endpoint, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.rates || !data.rates[toCurrency.toUpperCase()]) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    const rate = data.rates[toCurrency.toUpperCase()];

    return {
      success: true,
      rate: rate,
      date: data.date || (date ? date.toISOString() : new Date().toISOString()),
    };
  } catch (error) {
    console.error('Error fetching exchange rate (fallback):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch exchange rate',
    };
  }
}

/**
 * Approximate exchange rates to NGN (Naira)
 * These are fallback rates when async conversion is not available.
 * For accurate conversions, use convertCurrency() instead.
 * Rates are approximate and should be updated periodically.
 */
const APPROXIMATE_RATES_TO_NGN: Record<string, number> = {
  NGN: 1.0,
  USD: 1500.0, // Approximate: 1 USD ≈ 1500 NGN
  GBP: 1900.0, // Approximate: 1 GBP ≈ 1900 NGN
  EUR: 1650.0, // Approximate: 1 EUR ≈ 1650 NGN
  CAD: 1100.0, // Approximate: 1 CAD ≈ 1100 NGN
};

/**
 * Export the currency rates with the expected name for backward compatibility
 */
export const CURRENCY_RATES_TO_NGN = APPROXIMATE_RATES_TO_NGN;

/**
 * Synchronously convert amount to NGN (Naira) using approximate rates
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @returns Amount in NGN
 * 
 * Note: This uses approximate rates. For accurate conversions, use convertCurrency() async function.
 */
export function convertToNaira(amount: number, fromCurrency: string): number {
  const currency = fromCurrency.toUpperCase();
  
  if (currency === 'NGN') {
    return amount;
  }

  const rate = APPROXIMATE_RATES_TO_NGN[currency];
  if (!rate) {
    // Default to USD rate if currency not found
    console.warn(`Unknown currency ${currency}, using USD rate as fallback`);
    return amount * APPROXIMATE_RATES_TO_NGN['USD'];
  }

  return Number((amount * rate).toFixed(2));
}

/**
 * Synchronously convert amount from NGN (Naira) to another currency using approximate rates
 * @param amountInNGN - Amount in NGN
 * @param toCurrency - Target currency code
 * @returns Amount in target currency
 * 
 * Note: This uses approximate rates. For accurate conversions, use convertCurrency() async function.
 */
export function convertFromNaira(amountInNGN: number, toCurrency: string): number {
  const currency = toCurrency.toUpperCase();
  
  if (currency === 'NGN') {
    return amountInNGN;
  }

  const rate = APPROXIMATE_RATES_TO_NGN[currency];
  if (!rate) {
    // Default to USD rate if currency not found
    console.warn(`Unknown currency ${currency}, using USD rate as fallback`);
    return Number((amountInNGN / APPROXIMATE_RATES_TO_NGN['USD']).toFixed(2));
  }

  return Number((amountInNGN / rate).toFixed(2));
}

/**
 * Get approximate exchange rate from one currency to another (via NGN)
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Approximate exchange rate
 */
export function getCurrencyRate(fromCurrency: string, toCurrency: string): number {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) {
    return 1.0;
  }

  // Convert via NGN
  const fromRate = APPROXIMATE_RATES_TO_NGN[from] || APPROXIMATE_RATES_TO_NGN['USD'];
  const toRate = APPROXIMATE_RATES_TO_NGN[to] || APPROXIMATE_RATES_TO_NGN['USD'];

  if (from === 'NGN') {
    return 1 / toRate;
  }

  if (to === 'NGN') {
    return fromRate;
  }

  // Convert from -> NGN -> to
  return fromRate / toRate;
}
