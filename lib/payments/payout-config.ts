import { PaymentProvider } from './config';

// Payout provider types (paystack and paypal only; stripe removed)
export type PayoutProvider = 'paystack' | 'paypal';

// Currency to payout provider mapping (intelligent routing)
export const PAYOUT_PROVIDER_MAPPING: Record<string, PayoutProvider> = {
  'USD': 'paypal',
  'EUR': 'paypal',
  'GBP': 'paypal',
  'CAD': 'paypal',
  'AUD': 'paypal',

  // African currencies → Paystack Transfers
  'NGN': 'paystack',
  'GHS': 'paystack',
  'ZAR': 'paystack',
  'KES': 'paystack',
};

export const PAYOUT_PROVIDER_SUPPORT: Record<string, PayoutProvider[]> = {
  USD: ['paypal'],
  EUR: ['paypal'],
  GBP: ['paypal'],
  CAD: ['paypal'],
  AUD: ['paypal'],
  NGN: ['paystack'],
  GHS: ['paystack'],
  ZAR: ['paystack'],
  KES: ['paystack'],
};

// Payout provider configurations
export const PAYOUT_CONFIG = {
  paystack: {
    name: 'Paystack Transfers',
    description: 'Direct bank transfer to Nigerian bank account',
    supportedCountries: ['NG'],
    minPayoutAmount: 100.00, // ₦100 minimum
    processingTime: '1-3 business days',
    fees: '1.5% + ₦50 per transaction',
  },
  paypal: {
    name: 'PayPal Payouts',
    description: 'Send funds to the email tied to your PayPal account',
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
    minPayoutAmount: 1.00,
    processingTime: 'Minutes to 1 business day',
    fees: 'Varies by market and currency',
  },
};

// Get the recommended payout provider for a currency
export function getPayoutProvider(currency: string): PayoutProvider | null {
  return PAYOUT_PROVIDER_MAPPING[currency] || null;
}

export function getSupportedPayoutProviders(currency: string): PayoutProvider[] {
  return PAYOUT_PROVIDER_SUPPORT[currency] || [];
}

// Get payout configuration for a provider
export function getPayoutConfig(provider: PayoutProvider) {
  return PAYOUT_CONFIG[provider];
}

// Check if a currency is supported for payouts
export function isPayoutSupported(currency: string): boolean {
  return getSupportedPayoutProviders(currency).length > 0;
}

// Get all supported currencies for payouts
export function getSupportedPayoutCurrencies(): string[] {
  return Object.keys(PAYOUT_PROVIDER_MAPPING);
}
