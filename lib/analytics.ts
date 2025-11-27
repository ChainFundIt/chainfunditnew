export type AnalyticsEvent =
  // Authentication Events
  | "signup"
  | "login"
  | "logout"
  | "email_verified"
  | "phone_verified"
  | "otp_sent"
  | "otp_verified"
  | "two_factor_enabled"
  | "two_factor_disabled"

  // Campaign Events
  | "campaign_created"
  | "campaign_viewed"
  | "campaign_edited"
  | "campaign_deleted"
  | "campaign_shared"
  | "campaign_searched"
  | "campaign_filtered"
  | "campaign_liked"
  | "campaign_unliked"

  // Donation Events
  | "donation_started"
  | "donation_completed"
  | "donation_failed"
  | "donation_cancelled"
  | "donation_viewed"

  // Chainer/Referral Events
  | "chainer_signup"
  | "referral_link_clicked"
  | "referral_link_copied"
  | "chain_created"
  | "commission_earned"
  | "commission_payout_requested"

  // Payment Events
  | "payment_initiated"
  | "payment_succeeded"
  | "payment_failed"
  | "payment_method_selected"

  // Charity Events
  | "charity_viewed"
  | "charity_donation_started"
  | "charity_donation_completed"

  // User Profile Events
  | "profile_updated"
  | "profile_viewed"
  | "settings_updated"

  // General Events
  | "page_view"
  | "button_click"
  | "link_clicked"
  | "search_performed"
  | "filter_applied"
  | "form_started"
  | "form_completed"
  | "form_abandoned"

  // Virtual Giving Mall Events
  | "product_viewed"
  | "product_purchased"
  | "cart_added"
  | "cart_abandoned";

/**
 * Standard parameters that can be included with analytics events
 */
export interface AnalyticsParams {
  // Campaign related
  campaign_id?: string;
  campaign_title?: string;
  campaign_slug?: string;
  campaign_goal?: number;
  campaign_currency?: string;

  // Donation related
  donation_id?: string;
  donation_amount?: number;
  donation_currency?: string;
  is_anonymous?: boolean;

  // Payment related
  payment_method?: "stripe" | "paystack" | "other";
  payment_intent_id?: string;
  transaction_id?: string;

  // Chainer related
  chainer_id?: string;
  referral_code?: string;
  commission_amount?: number;
  commission_rate?: number;

  // Charity related
  charity_id?: string;
  charity_name?: string;
  charity_slug?: string;

  // User related
  user_id?: string;
  user_email?: string;

  // Search/Filter related
  search_query?: string;
  filter_type?: string;
  filter_value?: string;

  // Form related
  form_name?: string;
  form_step?: number;

  // Page related
  page_path?: string;
  page_title?: string;

  // Product related (Virtual Giving Mall)
  product_id?: string;
  product_name?: string;
  product_price?: number;
  
  // General
  value?: number;
  currency?: string;
  category?: string;
  label?: string;
  [key: string]: any; // Allow additional custom parameters
}

/**
 * Track an analytics event
 * 
 * @param eventName - The name of the event to track
 * @param params - Optional parameters to include with the event
 * 
 * @example
 * ```ts
 * track("donation_completed", {
 *   donation_id: "don_123",
 *   donation_amount: 50,
 *   donation_currency: "USD",
 *   campaign_id: "camp_456",
 *   value: 50,
 *   currency: "USD"
 * });
 * ```
 * 
 * @example
 * ```ts
 * track("campaign_created", {
 *   campaign_id: "camp_789",
 *   campaign_title: "Help Build a School",
 *   campaign_goal: 10000,
 *   campaign_currency: "USD"
 * });
 * ```
 */
export function track(eventName: AnalyticsEvent, params: AnalyticsParams = {}) {
  if (typeof window !== "undefined" && window.gtag) {
    // Prepare event parameters
    const eventParams: Record<string, any> = {
      ...params,
      // Ensure value and currency are properly formatted for e-commerce tracking
      ...(params.value && { value: params.value }),
      ...(params.currency && { currency: params.currency }),
      // Add timestamp
      event_timestamp: new Date().toISOString(),
    };

    // Track the event
    window.gtag("event", eventName, eventParams);
  } else if (process.env.NODE_ENV === "development") {
    // Log events in development when gtag is not available
    console.log("[Analytics]", eventName, params);
  }
}

/**
 * Track a page view
 * 
 * @param pagePath - The path of the page
 * @param pageTitle - Optional title of the page
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  track("page_view", {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

/**
 * Track a donation event with standardized parameters
 * 
 * @param eventName - Donation event type
 * @param donationData - Donation information
 */
export function trackDonation(
  eventName: "donation_started" | "donation_completed" | "donation_failed" | "donation_cancelled",
  donationData: {
    donation_id?: string;
    campaign_id?: string;
    amount: number;
    currency: string;
    is_anonymous?: boolean;
    payment_method?: "stripe" | "paystack";
  }
) {
  track(eventName, {
    donation_id: donationData.donation_id,
    campaign_id: donationData.campaign_id,
    donation_amount: donationData.amount,
    donation_currency: donationData.currency,
    is_anonymous: donationData.is_anonymous,
    payment_method: donationData.payment_method,
    value: donationData.amount,
    currency: donationData.currency,
  });
}

/**
 * Track a campaign event with standardized parameters
 * 
 * @param eventName - Campaign event type
 * @param campaignData - Campaign information
 */
export function trackCampaign(
  eventName: "campaign_created" | "campaign_viewed" | "campaign_shared" | "campaign_edited",
  campaignData: {
    campaign_id: string;
    campaign_title?: string;
    campaign_slug?: string;
    campaign_goal?: number;
    campaign_currency?: string;
  }
) {
  track(eventName, {
    campaign_id: campaignData.campaign_id,
    campaign_title: campaignData.campaign_title,
    campaign_slug: campaignData.campaign_slug,
    campaign_goal: campaignData.campaign_goal,
    campaign_currency: campaignData.campaign_currency,
  });
}

/**
 * Track a chainer/referral event with standardized parameters
 * 
 * @param eventName - Chainer event type
 * @param chainerData - Chainer/referral information
 */
export function trackChainer(
  eventName: "chainer_signup" | "referral_link_clicked" | "referral_link_copied" | "chain_created" | "commission_earned",
  chainerData: {
    chainer_id?: string;
    referral_code?: string;
    campaign_id?: string;
    commission_amount?: number;
    commission_rate?: number;
  }
) {
  track(eventName, {
    chainer_id: chainerData.chainer_id,
    referral_code: chainerData.referral_code,
    campaign_id: chainerData.campaign_id,
    commission_amount: chainerData.commission_amount,
    commission_rate: chainerData.commission_rate,
    ...(chainerData.commission_amount && { value: chainerData.commission_amount }),
  });
}