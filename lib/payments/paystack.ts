import axios from 'axios';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

if (!PAYSTACK_SECRET_KEY) {
  console.warn('PAYSTACK_SECRET_KEY is not set in environment variables');
}

function validatePaystackKey(): void {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not set in environment variables. Please configure your Paystack secret key.');
  }
  
  // Validate key format (Paystack keys start with sk_test_ or sk_live_)
  if (!PAYSTACK_SECRET_KEY.startsWith('sk_test_') && !PAYSTACK_SECRET_KEY.startsWith('sk_live_')) {
    throw new Error('PAYSTACK_SECRET_KEY has an invalid format. Paystack secret keys should start with "sk_test_" or "sk_live_".');
  }
}

/**
 * Paystack returns HTTP 200 with `{ status: false, message }` for many API errors.
 * Axios does not throw on 200, so callers must check `body.status`.
 */
function assertPaystackSuccess<T extends { status?: boolean; message?: string }>(
  body: T,
  context: string
): asserts body is T & { status: true } {
  if (!body || body.status !== true) {
    const msg = body?.message || 'Request failed';
    throw new Error(`${context}: ${msg}`);
  }
}

/**
 * Dedicated virtual accounts: test keys must use `test-bank`; live typically uses `wema-bank` or `titan-paystack`.
 * Override with PAYSTACK_DEDICATED_ACCOUNT_BANK if needed.
 */
export function resolvePaystackDedicatedAccountPreferredBank(): string {
  const override = process.env.PAYSTACK_DEDICATED_ACCOUNT_BANK?.trim();
  if (override) return override;
  if (PAYSTACK_SECRET_KEY?.startsWith('sk_test_')) return 'test-bank';
  return 'wema-bank';
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

export interface PaystackCustomerResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    customer_code: string;
    email: string;
  };
}

export interface PaystackDedicatedAccountResponse {
  status: boolean;
  message: string;
  data: {
    account_name: string;
    account_number: string;
    bank: {
      name: string;
    };
    customer: number;
    dedicated_account_id: number;
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
  // Validate Paystack configuration before making API call
  validatePaystackKey();
  
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
    const errorData = error.response?.data || {};
    const errorMessage = errorData.message || error.message || 'Unknown error';
    
    console.error('Error initializing Paystack payment:', {
      status: errorData.status,
      message: errorMessage,
      type: errorData.type,
      code: errorData.code,
      meta: errorData.meta,
    });
    
    // Provide more helpful error messages
    if (error.response?.status === 401) {
      throw new Error(`Paystack authentication failed: ${errorMessage}. Please check that your PAYSTACK_SECRET_KEY is correct and valid.`);
    }
    
    throw error;
  }
}

/**
 * Create a Paystack customer for virtual account setup
 */
export async function createPaystackCustomer(
  email: string,
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  },
  metadata?: Record<string, any>
): Promise<PaystackCustomerResponse> {
  validatePaystackKey();

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/customer`,
      {
        email,
        first_name: profile?.firstName,
        last_name: profile?.lastName,
        phone: profile?.phone,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    assertPaystackSuccess(data, 'Failed to create Paystack customer');
    if (!data.data?.customer_code) {
      throw new Error('Failed to create Paystack customer: no customer_code in response');
    }
    return data;
  } catch (error: any) {
    const errorData = error.response?.data || {};
    const errorMessage = errorData.message || error.message || 'Unknown error';
    console.error('Error creating Paystack customer:', {
      status: error.response?.status,
      message: errorMessage,
      data: errorData,
    });
    throw new Error(`Failed to create Paystack customer: ${errorMessage}`);
  }
}

/**
 * Create a dedicated virtual account for bank transfer
 */
export async function createPaystackDedicatedAccount(
  customer: number | string,
  preferredBank?: string
): Promise<PaystackDedicatedAccountResponse> {
  validatePaystackKey();

  const primary = preferredBank?.trim() || resolvePaystackDedicatedAccountPreferredBank();
  const fallbacks =
    primary === 'wema-bank'
      ? ['titan-paystack' as const]
      : primary === 'titan-paystack'
        ? ['wema-bank' as const]
        : [];

  const banksToTry = [primary, ...fallbacks.filter((b) => b !== primary)];
  let lastMessage = 'Unknown error';

  for (const bank of banksToTry) {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/dedicated_account`,
        {
          customer,
          preferred_bank: bank,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      if (!data?.status) {
        lastMessage = data?.message || 'Paystack returned status false';
        console.error('Paystack dedicated account rejected:', {
          preferred_bank: bank,
          message: lastMessage,
          data,
        });
        continue;
      }
      if (!data.data?.account_number) {
        lastMessage = 'Paystack did not return account_number';
        console.error('Paystack dedicated account missing account_number:', { bank, data });
        continue;
      }
      return data;
    } catch (error: any) {
      const errorData = error.response?.data || {};
      lastMessage = errorData.message || error.message || 'Unknown error';
      console.error('Error creating Paystack dedicated account:', {
        preferred_bank: bank,
        status: error.response?.status,
        message: lastMessage,
        data: errorData,
      });
      if (banksToTry.length > 1 && error.response?.status && error.response.status < 500) {
        continue;
      }
      throw new Error(`Failed to create Paystack dedicated account: ${lastMessage}`);
    }
  }

  throw new Error(`Failed to create Paystack dedicated account: ${lastMessage}`);
}

/**
 * Verify a Paystack payment
 */
export async function verifyPaystackPayment(
  reference: string
): Promise<PaystackVerifyResponse> {
  validatePaystackKey();
  
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
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Cannot verify Paystack webhook: PAYSTACK_SECRET_KEY is not set');
    return false;
  }
  
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
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
  validatePaystackKey();
  
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
    const errorData = error.response?.data || {};
    const errorMessage = errorData.message || error.message || 'Unknown error';
    
    console.error('Error creating Paystack recipient:', {
      status: error.response?.status,
      message: errorMessage,
      data: errorData,
    });
    
    // Provide more helpful error messages
    if (error.response?.status === 400) {
      // Common 400 errors from Paystack
      if (errorMessage.includes('account') || errorMessage.includes('bank')) {
        throw new Error(`Invalid bank account details: ${errorMessage}. Please verify the account number and bank code.`);
      }
      if (errorMessage.includes('recipient') && errorMessage.includes('exists')) {
        // Recipient already exists, this is actually okay - we'll use the existing one
        throw new Error('Recipient already exists');
      }
      throw new Error(`Paystack validation error: ${errorMessage}`);
    }
    
    if (error.response?.status === 401) {
      throw new Error(`Paystack authentication failed: ${errorMessage}. Please check that your PAYSTACK_SECRET_KEY is correct and valid.`);
    }
    
    throw new Error(`Failed to create Paystack recipient: ${errorMessage}`);
  }
}

/**
 * Initiate a transfer (payout)
 * 
 * NOTE: For automated transfers (no OTP required):
 * - Go to Paystack Dashboard → Settings → Preferences → Transfer section
 * - Uncheck "Confirm transfers before sending"
 * - This allows transfers to process automatically when initiated
 * 
 * When OTP is disabled:
 * - Transfers will process immediately (status: 'success')
 * - Webhook will fire automatically when transfer completes
 * - No manual intervention needed in Paystack dashboard
 * 
 * When OTP is enabled (default):
 * - Transfers will be in 'otp' status until approved in Paystack dashboard
 * - Admin must enter OTP in Paystack to complete the transfer
 */
export async function initiatePaystackTransfer(
  amount: number,
  recipientCode: string,
  reason: string,
  currency: string = 'NGN',
  reference?: string
) {
  validatePaystackKey();
  
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
    const errorData = error.response?.data || {};
    const errorMessage = errorData.message || error.message || 'Unknown error';
    
    console.error('Error initiating Paystack transfer:', {
      status: error.response?.status,
      message: errorMessage,
      data: errorData,
    });
    
    // Provide more helpful error messages
    if (error.response?.status === 400) {
      // Common 400 errors from Paystack
      if (errorMessage.includes('balance') || errorMessage.includes('insufficient')) {
        throw new Error(`Insufficient Paystack balance: ${errorMessage}. Please top up your Paystack account.`);
      }
      if (errorMessage.includes('recipient') || errorMessage.includes('invalid')) {
        throw new Error(`Invalid recipient or transfer details: ${errorMessage}. Please verify the recipient code and transfer amount.`);
      }
      if (errorMessage.includes('amount') || errorMessage.includes('minimum')) {
        throw new Error(`Invalid transfer amount: ${errorMessage}. Please check the minimum transfer amount requirements.`);
      }
      throw new Error(`Paystack transfer validation error: ${errorMessage}`);
    }
    
    if (error.response?.status === 401) {
      throw new Error(`Paystack authentication failed: ${errorMessage}. Please check that your PAYSTACK_SECRET_KEY is correct and valid.`);
    }
    
    if (error.response?.status === 403) {
      throw new Error(`Paystack transfer not allowed: ${errorMessage}. Please check your Paystack account permissions.`);
    }
    
    throw new Error(`Failed to initiate Paystack transfer: ${errorMessage}`);
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
