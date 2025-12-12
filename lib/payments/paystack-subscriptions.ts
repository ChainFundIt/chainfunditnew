import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export type SubscriptionPeriod = 'monthly' | 'quarterly' | 'yearly';

/**
 * Convert period to Paystack plan interval
 */
function getPaystackInterval(period: SubscriptionPeriod): string {
  switch (period) {
    case 'monthly':
      return 'monthly';
    case 'quarterly':
      return 'quarterly';
    case 'yearly':
      return 'annually';
    default:
      return 'monthly';
  }
}

/**
 * Create or retrieve a Paystack customer
 */
export async function createOrRetrievePaystackCustomer(
  email: string,
  firstName?: string,
  lastName?: string,
  phone?: string,
  metadata?: Record<string, any>
): Promise<any> {
  try {
    // First, try to find existing customer by email
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/customer?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status && response.data.data.length > 0) {
      return response.data.data[0];
    }

    // Create new customer
    const createResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/customer`,
      {
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return createResponse.data.data;
  } catch (error: any) {
    console.error('Error creating/retrieving Paystack customer:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a Paystack plan for recurring donations
 */
export async function createPaystackPlan(
  name: string,
  amount: number,
  currency: string,
  period: SubscriptionPeriod,
  metadata?: Record<string, any>
): Promise<any> {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/plan`,
      {
        name,
        amount: Math.round(amount * 100), // Convert to kobo/cents
        interval: getPaystackInterval(period),
        currency: currency.toLowerCase(),
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Error creating Paystack plan:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a Paystack subscription
 */
export async function createPaystackSubscription(
  customerCode: string,
  planCode: string,
  authorizationCode: string,
  metadata?: Record<string, any>
): Promise<any> {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/subscription`,
      {
        customer: customerCode,
        plan: planCode,
        authorization: authorizationCode,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Error creating Paystack subscription:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get Paystack subscription details
 */
export async function getPaystackSubscription(subscriptionCode: string): Promise<any> {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/subscription/${subscriptionCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Error retrieving Paystack subscription:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Cancel a Paystack subscription
 */
export async function cancelPaystackSubscription(subscriptionCode: string): Promise<any> {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/subscription/disable`,
      {
        code: subscriptionCode,
        token: subscriptionCode, // Paystack uses token for cancellation
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Error canceling Paystack subscription:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Enable a Paystack subscription
 */
export async function enablePaystackSubscription(subscriptionCode: string): Promise<any> {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/subscription/enable`,
      {
        code: subscriptionCode,
        token: subscriptionCode,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Error enabling Paystack subscription:', error.response?.data || error.message);
    throw error;
  }
}

