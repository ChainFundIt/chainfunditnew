// Paystack Configuration
export const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY!,
  baseUrl: 'https://api.paystack.co',
};

// Payment Provider Types
export type PaymentProvider = 'paystack' | 'paypal';

// Currency support by provider
export const CURRENCY_SUPPORT: Record<PaymentProvider, string[]> = {
  paystack: ['NGN', 'USD', 'GHS', 'ZAR', 'KES'],
  paypal: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
};

// Preferred provider for each currency (for intelligent routing)
export const PREFERRED_PROVIDER: Record<string, PaymentProvider> = {
  // International currencies → PayPal
  'USD': 'paypal',
  'EUR': 'paypal',
  'GBP': 'paypal',
  'CAD': 'paypal',
  'AUD': 'paypal',

  // African currencies → Paystack
  'NGN': 'paystack',
  'GHS': 'paystack',
  'ZAR': 'paystack',
  'KES': 'paystack',
};

// Provider descriptions for UI
export const PROVIDER_DESCRIPTIONS: Record<PaymentProvider, string> = {
  paystack: 'Bank Transfer, Card, USSD',
  paypal: 'PayPal balance, cards, and linked payment methods',
};

// Get supported payment providers for a currency
export function getSupportedProviders(currency: string): PaymentProvider[] {
  const providers: PaymentProvider[] = [];

  if (CURRENCY_SUPPORT.paystack.includes(currency)) {
    providers.push('paystack');
  }

  if (CURRENCY_SUPPORT.paypal.includes(currency)) {
    providers.push('paypal');
  }

  return providers;
}

// Get the preferred provider for a currency (intelligent routing)
export function getPreferredProvider(currency: string): PaymentProvider | null {
  return PREFERRED_PROVIDER[currency] || null;
}

// Get intelligent provider recommendations for a currency
export function getIntelligentProviders(currency: string): {
  primary: PaymentProvider | null;
  alternatives: PaymentProvider[];
} {
  const primary = getPreferredProvider(currency);
  const allSupported = getSupportedProviders(currency);
  const alternatives = allSupported.filter(provider => provider !== primary);

  return {
    primary,
    alternatives
  };
}

// Check if a Paystack key is a test key
export function isPaystackTestKey(key: string | undefined): boolean {
  if (!key) return false;
  return key.startsWith('sk_test_') || key.startsWith('pk_test_');
}

// Check if a PayPal environment is sandbox
export function isPayPalSandbox(environment: string | undefined): boolean {
  if (!environment) return true;
  return environment.toLowerCase() !== 'live';
}

// Get payment mode status
export function getPaymentModeStatus(): {
  paystack: {
    secretKeyMode: 'test' | 'live' | 'missing' | 'unknown';
    publicKeyMode: 'test' | 'live' | 'missing' | 'unknown';
    isTestMode: boolean;
  };
  paypal: {
    clientMode: 'test' | 'live' | 'missing' | 'unknown';
    publicClientMode: 'test' | 'live' | 'missing' | 'unknown';
    secretMode: 'test' | 'live' | 'missing' | 'unknown';
    environmentMode: 'test' | 'live' | 'missing' | 'unknown';
    isTestMode: boolean;
  };
} {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY;
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  const paypalPublicClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const paypalEnvironment = process.env.PAYPAL_ENVIRONMENT;
  const getPaystackSecretMode = (): 'test' | 'live' | 'missing' | 'unknown' => {
    if (!paystackSecretKey) return 'missing';
    if (paystackSecretKey.startsWith('sk_test_')) return 'test';
    if (paystackSecretKey.startsWith('sk_live_')) return 'live';
    return 'unknown';
  };

  const getPaystackPublicMode = (): 'test' | 'live' | 'missing' | 'unknown' => {
    const secretMode = getPaystackSecretMode();
    if (secretMode === 'test') return 'test';
    if (secretMode === 'live') return 'live';
    return 'missing';
  };

  const paystackSecretMode = getPaystackSecretMode();
  const paystackPublicMode = getPaystackPublicMode();
  const getPayPalCredentialMode = (
    value: string | undefined
  ): 'test' | 'live' | 'missing' | 'unknown' => {
    if (!value) return 'missing';
    return isPayPalSandbox(paypalEnvironment) ? 'test' : 'live';
  };
  const paypalClientMode = getPayPalCredentialMode(paypalClientId);
  const paypalPublicClientMode = getPayPalCredentialMode(paypalPublicClientId);
  const paypalSecretMode = getPayPalCredentialMode(paypalClientSecret);
  const paypalEnvironmentMode: 'test' | 'live' | 'missing' | 'unknown' =
    !paypalEnvironment ? 'missing' : isPayPalSandbox(paypalEnvironment) ? 'test' : 'live';
  return {
    paystack: {
      secretKeyMode: paystackSecretMode,
      publicKeyMode: paystackPublicMode,
      isTestMode: paystackSecretMode === 'test' || paystackPublicMode === 'test',
    },
    paypal: {
      clientMode: paypalClientMode,
      publicClientMode: paypalPublicClientMode,
      secretMode: paypalSecretMode,
      environmentMode: paypalEnvironmentMode,
      isTestMode:
        paypalClientMode === 'test' ||
        paypalPublicClientMode === 'test' ||
        paypalSecretMode === 'test' ||
        paypalEnvironmentMode === 'test',
    },
  };
}

// Environment validation
export function validatePaymentConfig() {
  const errors: string[] = [];

  if (!process.env.PAYSTACK_SECRET_KEY) {
    errors.push('Missing PAYSTACK_SECRET_KEY environment variable');
  }

  if (!process.env.PAYPAL_CLIENT_ID) {
    errors.push('Missing PAYPAL_CLIENT_ID environment variable');
  }

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    errors.push('Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID environment variable');
  }

  if (!process.env.PAYPAL_CLIENT_SECRET) {
    errors.push('Missing PAYPAL_CLIENT_SECRET environment variable');
  }

  if (errors.length > 0) {
    throw new Error(`Payment configuration errors:\n${errors.join('\n')}`);
  }
}
