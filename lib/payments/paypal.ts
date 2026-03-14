import { Buffer } from "node:buffer";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENVIRONMENT = (process.env.PAYPAL_ENVIRONMENT || "sandbox").toLowerCase();

type PayPalRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: PayPalLink[];
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    invoice_id?: string;
    description?: string;
    amount?: {
      currency_code: string;
      value: string;
    };
  }>;
}

export interface CreatePayPalOrderParams {
  amount: number;
  currency: string;
  donationId: string;
  campaignTitle: string;
  donorEmail?: string | null;
  returnUrl: string;
  cancelUrl: string;
  customId?: string;
  description?: string;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    amount?: {
      currency_code: string;
      value: string;
    };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
      }>;
    };
  }>;
}

export interface PayPalSubscriptionResponse {
  id: string;
  status: string;
  plan_id?: string;
  custom_id?: string;
  subscriber?: {
    payer_id?: string;
    email_address?: string;
  };
  links: PayPalLink[];
}

interface PayPalProductResponse {
  id: string;
}

interface PayPalPlanResponse {
  id: string;
  status: string;
}

export interface CreatePayPalSubscriptionParams {
  recurringDonationId: string;
  campaignTitle: string;
  amount: number;
  currency: string;
  period: "monthly" | "quarterly" | "yearly";
  donorEmail?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalPayoutResult {
  batchId?: string;
  payoutItemId?: string;
  payoutItemStatus?: string;
  transactionId?: string;
}

const PAYPAL_FETCH_TIMEOUT_MS = 25_000;

function getPayPalBaseUrl(): string {
  return PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function isNetworkTimeoutError(err: unknown): boolean {
  if (err instanceof Error && err.cause instanceof Error) {
    const cause = err.cause as Error & { code?: string };
    return cause.code === "UND_ERR_CONNECT_TIMEOUT" || cause.message?.includes("Timeout");
  }
  return false;
}

function validatePayPalConfig(): void {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error(
      "PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET."
    );
  }
}

async function getPayPalAccessToken(): Promise<string> {
  validatePayPalConfig();

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.access_token) {
    const message = data?.error_description || data?.error || "Failed to authenticate with PayPal";
    throw new Error(message);
  }

  return data.access_token;
}

async function paypalRequest<T>(
  path: string,
  options: PayPalRequestOptions = {}
): Promise<T> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const details =
      Array.isArray(data?.details) && data.details.length > 0
        ? data.details.map((detail: { issue?: string; description?: string }) => detail.issue || detail.description).filter(Boolean).join(", ")
        : null;
    const message = details || data?.message || "PayPal request failed";
    throw new Error(message);
  }

  return data as T;
}

export async function createPayPalOrder(
  params: CreatePayPalOrderParams
): Promise<PayPalOrderResponse> {
  const description = truncatePayPalText(params.description || params.campaignTitle, 120);

  return paypalRequest<PayPalOrderResponse>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.donationId,
          custom_id: params.customId || params.donationId,
          invoice_id: params.donationId,
          description,
          amount: {
            currency_code: params.currency,
            value: params.amount.toFixed(2),
          },
        },
      ],
      payer: params.donorEmail
        ? {
            email_address: params.donorEmail,
          }
        : undefined,
      application_context: {
        brand_name: "ChainFundit",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });
}

export async function getPayPalOrder(orderId: string): Promise<PayPalOrderResponse> {
  return paypalRequest<PayPalOrderResponse>(`/v2/checkout/orders/${orderId}`, {
    method: "GET",
  });
}

export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResponse> {
  try {
    return await paypalRequest<PayPalCaptureResponse>(`/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PayPal capture failed";
    if (message.includes("ORDER_ALREADY_CAPTURED")) {
      const order = await getPayPalOrder(orderId);
      return {
        id: order.id,
        status: order.status,
      };
    }
    throw error;
  }
}

export function getPayPalApprovalUrl(resource: { links: PayPalLink[] }): string | null {
  return resource.links.find((link) => link.rel === "approve")?.href || null;
}

export async function createPayPalSubscription(
  params: CreatePayPalSubscriptionParams
): Promise<PayPalSubscriptionResponse> {
  const product = await paypalRequest<PayPalProductResponse>("/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({
      name: truncatePayPalText(params.campaignTitle, 127),
      description: truncatePayPalText(
        `Recurring donation for ${params.campaignTitle}`,
        256
      ),
      type: "SERVICE",
      category: "CHARITY",
    }),
  });

  const plan = await paypalRequest<PayPalPlanResponse>("/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: product.id,
      name: truncatePayPalText(
        `${params.campaignTitle} ${params.period} recurring donation`,
        127
      ),
      description: truncatePayPalText(
        `${params.period} recurring donation for ${params.campaignTitle}`,
        127
      ),
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: getPayPalBillingFrequency(params.period),
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: params.amount.toFixed(2),
              currency_code: params.currency,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });

  return paypalRequest<PayPalSubscriptionResponse>("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: plan.id,
      custom_id: params.recurringDonationId,
      subscriber: params.donorEmail
        ? { email_address: params.donorEmail }
        : undefined,
      application_context: {
        brand_name: "ChainFundit",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });
}

export async function getPayPalSubscription(
  subscriptionId: string
): Promise<PayPalSubscriptionResponse> {
  return paypalRequest<PayPalSubscriptionResponse>(
    `/v1/billing/subscriptions/${subscriptionId}`,
    {
      method: "GET",
    }
  );
}

export async function cancelPayPalSubscription(subscriptionId: string): Promise<void> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: "Cancelled by donor",
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Failed to cancel PayPal subscription");
  }
}

export async function createPayPalPayout(params: {
  senderItemId: string;
  receiverEmail: string;
  amount: number;
  currency: string;
  note: string;
  emailSubject: string;
}): Promise<PayPalPayoutResult> {
  const data = await paypalRequest<{
    batch_header?: {
      payout_batch_id?: string;
      batch_status?: string;
    };
    items?: Array<{
      payout_item_id?: string;
      transaction_status?: string;
      transaction_id?: string;
    }>;
  }>("/v1/payments/payouts", {
    method: "POST",
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: `${params.senderItemId}-${Date.now()}`,
        email_subject: truncatePayPalText(params.emailSubject, 255),
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: params.amount.toFixed(2),
            currency: params.currency,
          },
          receiver: params.receiverEmail,
          note: truncatePayPalText(params.note, 1000),
          sender_item_id: params.senderItemId,
        },
      ],
    }),
  });

  return {
    batchId: data.batch_header?.payout_batch_id,
    payoutItemId: data.items?.[0]?.payout_item_id,
    payoutItemStatus: data.items?.[0]?.transaction_status || data.batch_header?.batch_status,
    transactionId: data.items?.[0]?.transaction_id,
  };
}

export async function verifyPayPalWebhookSignature(
  webhookEvent: unknown,
  headers: {
    authAlgo?: string | null;
    certUrl?: string | null;
    transmissionId?: string | null;
    transmissionSig?: string | null;
    transmissionTime?: string | null;
  }
): Promise<boolean> {
  validatePayPalConfig();

  if (
    !headers.authAlgo ||
    !headers.certUrl ||
    !headers.transmissionId ||
    !headers.transmissionSig ||
    !headers.transmissionTime
  ) {
    return false;
  }

  if (!process.env.PAYPAL_WEBHOOK_ID) {
    throw new Error("PAYPAL_WEBHOOK_ID is not set");
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      auth_algo: headers.authAlgo,
      cert_url: headers.certUrl,
      transmission_id: headers.transmissionId,
      transmission_sig: headers.transmissionSig,
      transmission_time: headers.transmissionTime,
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: webhookEvent,
    }),
  });

  const data = await response.json().catch(() => null);
  return response.ok && data?.verification_status === "SUCCESS";
}

function truncatePayPalText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function getPayPalBillingFrequency(period: "monthly" | "quarterly" | "yearly") {
  if (period === "quarterly") {
    return { interval_unit: "MONTH", interval_count: 3 };
  }

  if (period === "yearly") {
    return { interval_unit: "YEAR", interval_count: 1 };
  }

  return { interval_unit: "MONTH", interval_count: 1 };
}
