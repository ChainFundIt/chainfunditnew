"use client";

import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MutableRefObject } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

interface CreateOrderResult {
  orderId: string;
  donationId?: string;
}

interface PayPalOrderButtonsProps {
  amount: number | string;
  currency: string;
  label?: string;
  disabled?: boolean;
  createOrderRequest: () => Promise<CreateOrderResult>;
  captureOrderRequest: (orderId: string, donationId?: string) => Promise<void>;
  cancelOrderRequest?: (donationId?: string) => Promise<void>;
  onError?: (message: string) => void;
}

interface ApplePayConfig {
  countryCode: string;
  merchantCapabilities: string[];
  supportedNetworks: string[];
  isEligible: boolean;
}

const APPLE_PAY_DEBUG =
  process.env.NEXT_PUBLIC_PAYPAL_APPLEPAY_DEBUG === "1" ||
  process.env.NEXT_PUBLIC_PAYPAL_APPLEPAY_DEBUG === "true";

function logApplePayDebug(stage: string, payload?: unknown) {
  if (!APPLE_PAY_DEBUG) return;
  if (payload === undefined) {
    console.info(`[PayPal ApplePay] ${stage}`);
    return;
  }
  try {
    console.info(
      `[PayPal ApplePay] ${stage}`,
      typeof payload === "string" ? payload : JSON.parse(JSON.stringify(payload))
    );
  } catch {
    console.info(`[PayPal ApplePay] ${stage}`, payload);
  }
}

interface ApplePaySessionEvent {
  validationURL: string;
}

interface ApplePayAuthorizedEvent {
  payment: {
    token: unknown;
    billingContact?: unknown;
    shippingContact?: unknown;
  };
}

type ChainfunditApplePaySessionConstructor = {
  new (version: number, paymentRequest: Record<string, unknown>): {
    onvalidatemerchant?: (event: ApplePaySessionEvent) => void;
    onpaymentauthorized?: (event: ApplePayAuthorizedEvent) => void;
    oncancel?: () => void;
    completeMerchantValidation: (merchantSession: unknown) => void;
    completePayment: (status: number) => void;
    abort: () => void;
    begin: () => void;
  };
  STATUS_SUCCESS: number;
  STATUS_FAILURE: number;
  canMakePayments: () => boolean;
};

type PayPalApplePay = {
  config: () => Promise<ApplePayConfig>;
  validateMerchant: (params: {
    validationUrl: string;
    displayName: string;
  }) => Promise<unknown>;
  confirmOrder: (params: {
    orderId: string;
    token: unknown;
    billingContact?: unknown;
    shippingContact?: unknown;
  }) => Promise<unknown>;
};

declare global {
  interface Window {
    ApplePaySession?: ChainfunditApplePaySessionConstructor;
  }
}

function getApplePaySession(): ChainfunditApplePaySessionConstructor | undefined {
  return window.ApplePaySession;
}

function getPayPalApplePay(): PayPalApplePay | undefined {
  const paypal = window.paypal as unknown as
    | {
        Applepay?: () => PayPalApplePay;
      }
    | undefined;

  return paypal?.Applepay?.();
}

function getConfirmOrderStatus(result: unknown): string | undefined {
  if (!result || typeof result !== "object") {
    return undefined;
  }

  const status = (result as { status?: unknown }).status;
  return typeof status === "string" ? status : undefined;
}

function parseMaybeJsonSession(raw: unknown): unknown {
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
    typeof o.merchantSessionIdentifier === "string" && typeof o.signature === "string"
  );
}

function extractPayPalAppleMerchantSession(validateResult: unknown): unknown {
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

function summarizeUnknownError(error: unknown): Record<string, unknown> {
  if (!error) return { kind: "empty" };
  if (error instanceof Error) {
    const extra: Record<string, unknown> = {};
    const maybeCode = (error as Error & { code?: unknown }).code;
    const maybeName = (error as Error & { name?: unknown }).name;
    if (maybeCode != null) extra.code = maybeCode;
    if (maybeName != null) extra.name = maybeName;
    return {
      kind: "Error",
      message: error.message,
      ...extra,
    };
  }

  if (typeof error === "object") {
    try {
      return {
        kind: "object",
        payload: JSON.parse(JSON.stringify(error)),
      };
    } catch {
      return {
        kind: "object-unserializable",
        keys: Object.keys(error as Record<string, unknown>),
      };
    }
  }

  return { kind: typeof error, value: String(error) };
}

function formatPayPalApplePayError(raw: string): string {
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

const CAPTURE_AFTER_APPLE_PAY_MESSAGE =
  "Apple Pay was approved, but we could not finalize the donation on our server. " +
  "If PayPal charged you, contact support with the time and amount — we can reconcile the payment.";

export function PayPalOrderButtons({
  amount,
  currency,
  label = "ChainFundit",
  disabled = false,
  createOrderRequest,
  captureOrderRequest,
  cancelOrderRequest,
  onError,
}: PayPalOrderButtonsProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const merchantId = process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID || "*";
  const pendingDonationIdRef = useRef<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const options = useMemo(
    () => ({
      clientId: clientId || "",
      currency,
      intent: "capture",
      components: "buttons,applepay",
      "enable-funding": "applepay",
      "merchant-id": merchantId,
    }),
    [clientId, currency, merchantId]
  );

  if (!clientId) {
    return (
      <p className="text-sm text-red-600">
        PayPal is not configured for the browser yet. Add `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.
      </p>
    );
  }

  return (
    <PayPalScriptProvider options={options}>
      <div className={disabled ? "pointer-events-none opacity-50" : ""}>
        <PayPalApplePayButton
          amount={amount}
          currency={currency}
          label={label}
          disabled={disabled || isBusy}
          createOrderRequest={createOrderRequest}
          captureOrderRequest={captureOrderRequest}
          cancelOrderRequest={cancelOrderRequest}
          pendingDonationIdRef={pendingDonationIdRef}
          onBusyChange={setIsBusy}
          onError={onError}
        />
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", label: "paypal" }}
          disabled={disabled || isBusy}
          forceReRender={[currency, disabled]}
          createOrder={async () => {
            try {
              setIsBusy(true);
              const result = await createOrderRequest();
              pendingDonationIdRef.current = result.donationId;
              return result.orderId;
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Failed to start PayPal checkout.";
              onError?.(message);
              throw error;
            } finally {
              setIsBusy(false);
            }
          }}
          onApprove={async (data) => {
            if (!data.orderID) {
              onError?.("PayPal did not return an order ID.");
              return;
            }

            try {
              setIsBusy(true);
              await captureOrderRequest(data.orderID, pendingDonationIdRef.current);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Failed to capture PayPal payment.";
              onError?.(message);
            } finally {
              setIsBusy(false);
            }
          }}
          onCancel={async () => {
            try {
              await cancelOrderRequest?.(pendingDonationIdRef.current);
            } catch {
              // Keep PayPal cancellation non-blocking for the donor.
            }
          }}
          onError={(error) => {
            const message =
              error instanceof Error ? error.message : "PayPal checkout failed.";
            onError?.(message);
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}

function PayPalApplePayButton({
  amount,
  currency,
  label,
  disabled,
  createOrderRequest,
  captureOrderRequest,
  cancelOrderRequest,
  pendingDonationIdRef,
  onBusyChange,
  onError,
}: {
  amount: number | string;
  currency: string;
  label: string;
  disabled: boolean;
  createOrderRequest: () => Promise<CreateOrderResult>;
  captureOrderRequest: (orderId: string, donationId?: string) => Promise<void>;
  cancelOrderRequest?: (donationId?: string) => Promise<void>;
  pendingDonationIdRef: MutableRefObject<string | undefined>;
  onBusyChange: (isBusy: boolean) => void;
  onError?: (message: string) => void;
}) {
  const [{ isResolved }] = usePayPalScriptReducer();
  const [applePayConfig, setApplePayConfig] = useState<ApplePayConfig | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [isApplePaySdkReady, setIsApplePaySdkReady] = useState(false);
  const numericAmount = Number(amount);
  const applePayHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src^="https://applepay.cdn-apple.com"]'
    );

    if (existingScript) {
      if (
        existingScript.dataset.loaded === "true" ||
        window.customElements?.get("apple-pay-button")
      ) {
        setIsApplePaySdkReady(true);
        return;
      }

      const handleLoad = () => {
        existingScript.dataset.loaded = "true";
        setIsApplePaySdkReady(true);
      };
      existingScript.addEventListener("load", handleLoad, { once: true });
      return () => existingScript.removeEventListener("load", handleLoad);
    }

    const script = document.createElement("script");
    script.src = "https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js";
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      setIsApplePaySdkReady(true);
    };
    script.onerror = () => setIsApplePaySdkReady(false);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkApplePayEligibility() {
      if (
        !isResolved ||
        !isApplePaySdkReady ||
        disabled ||
        !window.isSecureContext ||
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        setIsEligible(false);
        return;
      }

      const ApplePaySession = getApplePaySession();
      const applepay = getPayPalApplePay();
      const canMakePayments = ApplePaySession?.canMakePayments?.() ?? false;

      if (!ApplePaySession || !canMakePayments || !applepay) {
        logApplePayDebug("eligibility: missing ApplePaySession/paypal applepay bridge", {
          hasApplePaySession: Boolean(ApplePaySession),
          canMakePayments,
          hasPayPalApplePay: Boolean(applepay),
          isSecureContext: window.isSecureContext,
        });
        setIsEligible(false);
        return;
      }

      try {
        const config = await applepay.config();
        logApplePayDebug("eligibility: paypal applepay config", config);
        if (!cancelled) {
          setApplePayConfig(config);
          setIsEligible(Boolean(config.isEligible));
        }
      } catch (error) {
        logApplePayDebug("eligibility: config error", error);
        if (!cancelled) {
          setIsEligible(false);
        }
      }
    }

    checkApplePayEligibility();

    return () => {
      cancelled = true;
    };
  }, [disabled, isResolved, isApplePaySdkReady, numericAmount]);

  const handleApplePayClick = useCallback(() => {
    const ApplePaySessionCtor = getApplePaySession();
    const applepay = getPayPalApplePay();

    if (!ApplePaySessionCtor || !applepay || !applePayConfig) {
      logApplePayDebug("click: unavailable", {
        hasApplePaySession: Boolean(ApplePaySessionCtor),
        hasPayPalApplePayBridge: Boolean(applepay),
        hasApplePayConfig: Boolean(applePayConfig),
      });
      onError?.("Apple Pay is not available on this device or browser.");
      return;
    }

    const paymentRequest = {
      countryCode: applePayConfig.countryCode,
      merchantCapabilities: applePayConfig.merchantCapabilities,
      supportedNetworks: applePayConfig.supportedNetworks,
      currencyCode: currency,
      requiredBillingContactFields: ["postalAddress"],
      total: {
        label,
        type: "final",
        amount: numericAmount.toFixed(2),
      },
    };

    const session = new ApplePaySessionCtor(4, paymentRequest);

    session.onvalidatemerchant = async (event) => {
      try {
        logApplePayDebug("merchant-validation:start", { validationURL: event.validationURL });
        const validateResult = await applepay.validateMerchant({
          validationUrl: event.validationURL,
          displayName: label,
        });
        const merchantSession = extractPayPalAppleMerchantSession(validateResult);
        const rawKeys =
          validateResult && typeof validateResult === "object"
            ? Object.keys(validateResult as Record<string, unknown>)
            : [];
        logApplePayDebug("merchant-validation:resolved", {
          hasSession: Boolean(merchantSession),
          rawKeys,
        });
        if (merchantSession == null) {
          throw new Error(
            "PayPal Apple Pay merchant validation returned no merchant session. " +
              `validateMerchant keys: ${rawKeys.length ? rawKeys.join(", ") : "(non-object response)"}`
          );
        }
        session.completeMerchantValidation(merchantSession);
      } catch (error) {
        const raw =
          error instanceof Error ? error.message : "Apple Pay merchant validation failed.";
        logApplePayDebug("merchant-validation:failure", summarizeUnknownError(error));
        onError?.(formatPayPalApplePayError(raw));
        session.abort();
      }
    };

    /**
     * PayPal + Apple Pay on the Web: after `confirmOrder`, close the Apple Pay sheet immediately
     * with `completePayment(SUCCESS)`, then capture on your server.
     * Awaiting capture *before* `completePayment` commonly hits Apple's session timeout
     * ("Payment Not Completed" / `oncancel` with no donation id yet).
     *
     * @see https://developer.paypal.com/docs/checkout/apm/apple-pay/ (onpaymentauthorized example)
     */
    session.onpaymentauthorized = async (event) => {
      let orderIdForCapture: string | undefined;
      let donationIdForCapture: string | undefined;

      try {
        onBusyChange(true);
        logApplePayDebug("payment-authorized:start");

        const result = await createOrderRequest();
        orderIdForCapture = result.orderId;
        donationIdForCapture = result.donationId;
        pendingDonationIdRef.current = result.donationId;
        logApplePayDebug("order:create:success", {
          orderId: result.orderId,
          donationId: result.donationId,
        });

        const confirmResult = await applepay.confirmOrder({
          orderId: result.orderId,
          token: event.payment.token,
          billingContact: event.payment.billingContact,
          shippingContact: event.payment.shippingContact,
        });

        const confirmStatus = getConfirmOrderStatus(confirmResult);
        logApplePayDebug("order:confirm:done", { confirmStatus });

        if (confirmStatus && confirmStatus !== "APPROVED" && confirmStatus !== "COMPLETED") {
          throw new Error(`Apple Pay authorization failed with status: ${confirmStatus}`);
        }

        session.completePayment(ApplePaySessionCtor.STATUS_SUCCESS);
        logApplePayDebug("apple-pay-sheet:completePayment", { status: "SUCCESS" });

        void (async () => {
          try {
            await captureOrderRequest(orderIdForCapture!, donationIdForCapture);
            logApplePayDebug("order:capture:success", { orderId: orderIdForCapture });
          } catch (error) {
            logApplePayDebug("order:capture:failure", summarizeUnknownError(error));
            onError?.(
              error instanceof Error
                ? `${CAPTURE_AFTER_APPLE_PAY_MESSAGE} (${error.message})`
                : CAPTURE_AFTER_APPLE_PAY_MESSAGE
            );
          }
        })();
      } catch (error) {
        try {
          session.completePayment(ApplePaySessionCtor.STATUS_FAILURE);
        } catch {
          // Ignore if the session is already invalid.
        }
        const raw = error instanceof Error ? error.message : "Apple Pay checkout failed.";
        logApplePayDebug("payment-authorized:failure", summarizeUnknownError(error));
        onError?.(formatPayPalApplePayError(raw));
      } finally {
        onBusyChange(false);
      }
    };

    session.oncancel = async () => {
      logApplePayDebug("session:cancelled", {
        pendingDonationId: pendingDonationIdRef.current ?? null,
      });
      try {
        await cancelOrderRequest?.(pendingDonationIdRef.current);
      } catch {
        // Keep Apple Pay cancellation non-blocking for the donor.
      }
    };

    session.begin();
  }, [
    applePayConfig,
    cancelOrderRequest,
    captureOrderRequest,
    createOrderRequest,
    currency,
    label,
    numericAmount,
    onBusyChange,
    onError,
    pendingDonationIdRef,
  ]);

  useEffect(() => {
    const root = applePayHostRef.current;
    if (!root || !isEligible || !applePayConfig) {
      return;
    }

    let cancelled = false;
    let appleEl: HTMLElement | null = null;
    let listener: (() => void) | null = null;

    const rafId = window.requestAnimationFrame(() => {
      appleEl = root.querySelector("apple-pay-button");
      if (!(appleEl instanceof HTMLElement) || cancelled) {
        return;
      }

      listener = () => {
        handleApplePayClick();
      };

      appleEl.addEventListener("click", listener, true);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      if (appleEl && listener) {
        appleEl.removeEventListener("click", listener, true);
      }
    };
  }, [applePayConfig, handleApplePayClick, isEligible]);

  if (!isEligible) {
    return null;
  }

  return (
    <div
      ref={applePayHostRef}
      className="mb-3 px-8 py-4 w-full overflow-hidden rounded-lg"
    >
      {createElement("apple-pay-button", {
        buttonstyle: "black",
        type: "donate",
        locale: "en-US",
        "aria-label": "Donate with Apple Pay",
        className: "h-12 w-full",
      })}
    </div>
  );
}
