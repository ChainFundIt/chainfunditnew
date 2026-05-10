/**
 * PayPal Apple Pay on the Web — shared helpers (no React).
 * See: https://developer.paypal.com/docs/checkout/apm/apple-pay/
 */

/** Maps checkout currency to PayPal SDK `buyer-country` (ISO 3166-1 alpha-2). */
export function buyerCountryFromCurrency(currencyCode: string): string {
  const c = currencyCode.trim().toUpperCase();
  const map: Record<string, string> = {
    USD: "US",
    GBP: "GB",
    EUR: "DE",
    CAD: "CA",
    AUD: "AU",
    JPY: "JP",
  };
  return map[c] ?? "US";
}

export function parseMaybeJsonSession(raw: unknown): unknown {
  if (raw == null) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return raw;
    }
  }
  return raw;
}

function looksLikeAppleMerchantSession(candidate: unknown): boolean {
  if (!candidate || typeof candidate !== "object") return false;
  const o = candidate as Record<string, unknown>;
  return (
    typeof o.merchantSessionIdentifier === "string" &&
    typeof o.signature === "string"
  );
}

/**
 * PayPal's `validateMerchant` may return `merchantSession`, nested variants, or a JSON string.
 * Apple expects the decoded merchant session object in `completeMerchantValidation`.
 */
export function extractPayPalAppleMerchantSession(
  validateResult: unknown
): unknown {
  if (validateResult == null) return undefined;

  const parsedRoot = parseMaybeJsonSession(validateResult);
  if (parsedRoot && typeof parsedRoot === "object") {
    const r = parsedRoot as Record<string, unknown>;
    const nested =
      r.merchantSession ??
      r.merchant_session ??
      r.session ??
      r.applePayMerchantSession;
    if (nested != null) {
      const session = parseMaybeJsonSession(nested);
      if (looksLikeAppleMerchantSession(session)) return session;
    }
    if (looksLikeAppleMerchantSession(parsedRoot)) return parsedRoot;
  }

  const asSession = parseMaybeJsonSession(validateResult);
  return looksLikeAppleMerchantSession(asSession) ? asSession : undefined;
}

type ApplePaySessionCtor = {
  supportsVersion?: (version: number) => boolean;
  new (
    version: number,
    request: Record<string, unknown>
  ): unknown;
};

/** Prefer a recent Apple Pay JS API version when the browser supports it. */
export function pickApplePaySessionVersion(
  ApplePaySession: ApplePaySessionCtor | undefined
): number {
  if (!ApplePaySession?.supportsVersion) return 4;
  const candidates = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4];
  for (const v of candidates) {
    try {
      if (ApplePaySession.supportsVersion(v)) return v;
    } catch {
      /* ignore */
    }
  }
  return 4;
}

export function getConfirmOrderStatus(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const status = (result as { status?: unknown }).status;
  return typeof status === "string" ? status : undefined;
}

/** Treat missing status as success (some SDK responses omit it when the promise resolves). */
export function isPayPalAppleConfirmSuccessful(result: unknown): boolean {
  const s = getConfirmOrderStatus(result)?.toUpperCase();
  if (!s) return true;
  return s === "APPROVED" || s === "COMPLETED";
}

export function formatPayPalApplePayUserMessage(raw: string): string {
  const trimmed = raw.trim();
  if (
    trimmed.includes("APPLE_PAY_MERCHANT_SESSION_VALIDATION_ERROR") ||
    trimmed.toLowerCase().includes("merchant_session_validation")
  ) {
    return (
      "Apple Pay could not verify this site with Apple (merchant validation failed). " +
      "In PayPal: enable Apple Pay for your account, add this exact website domain for Apple Pay on the web, " +
      "and match live vs sandbox credentials. You can still pay with PayPal or card below."
    );
  }
  return trimmed;
}
