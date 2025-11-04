import axios from 'axios';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

if (!PAYSTACK_SECRET_KEY) {
  console.warn('PAYSTACK_SECRET_KEY is not set in environment variables');
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: Record<string, any>;
  };
}

/**
 * Initialize a Paystack payment
 */
export async function initializePaystackPayment(
  email: string,
  amount: number,
  currency: string = 'NGN',
  metadata?: Record<string, any>,
  callbackUrl?: string
): Promise<PaystackInitializeResponse> {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo/cents
        currency,
        metadata,
        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error initializing Paystack payment:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Verify a Paystack payment
 */
export async function verifyPaystackPayment(
  reference: string
): Promise<PaystackVerifyResponse> {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error verifying Paystack payment:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Verify Paystack webhook signature
 */
export function verifyPaystackWebhook(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY || '')
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}

/**
 * Create a transfer recipient (for payouts)
 */
export async function createPaystackRecipient(
  name: string,
  accountNumber: string,
  bankCode: string,
  currency: string = 'NGN'
) {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error creating Paystack recipient:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Initiate a transfer (payout)
 */
export async function initiatePaystackTransfer(
  amount: number,
  recipientCode: string,
  reason: string,
  currency: string = 'NGN',
  reference?: string
) {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: 'balance',
        amount: Math.round(amount * 100), // Convert to kobo
        recipient: recipientCode,
        reason,
        currency,
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error initiating Paystack transfer:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get Paystack public key
 */
export function getPaystackPublicKey(): string {
  return PAYSTACK_PUBLIC_KEY || '';
}

/**
 * List Nigerian banks
 */
export async function getPaystackBanks() {
  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank?country=nigeria`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching Paystack banks:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Verify a transfer (payout) status
 */
export async function verifyPaystackTransfer(transferCode: string) {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transfer/${transferCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error verifying Paystack transfer:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * List all transfers (payouts)
 */
export async function listPaystackTransfers(perPage: number = 50, page: number = 1) {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transfer?perPage=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error listing Paystack transfers:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Check if a recipient exists and is valid
 */
export async function getPaystackRecipient(recipientCode: string) {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transferrecipient/${recipientCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error getting Paystack recipient:', error.response?.data || error.message);
    throw error;
  }
}
