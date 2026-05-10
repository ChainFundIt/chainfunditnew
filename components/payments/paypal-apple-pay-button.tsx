"use client";

import {
  createElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from "react";
import type { MutableRefObject } from "react";
import { usePayPalScriptReducer } from "@paypal/react-paypal-js";
import {
  buyerCountryFromCurrency,
  extractPayPalAppleMerchantSession,
  formatPayPalApplePayUserMessage,
  isPayPalAppleConfirmSuccessful,
  pickApplePaySessionVersion,
} from "@/lib/payments/paypal-apple-pay-web";

const APPLE_PAY_DEBUG =
  process.env.NEXT_PUBLIC_PAYPAL_APPLEPAY_DEBUG === "1" ||
  process.env.NEXT_PUBLIC_PAYPAL_APPLEPAY_DEBUG === "true";

function logApplePay(stage: string, payload?: unknown) {
  if (!APPLE_PAY_DEBUG) return;
  if (payload === undefined) {
    console.info(`[PayPal Apple Pay] ${stage}`);
    return;
  }
  try {
    console.info(
      `[PayPal Apple Pay] ${stage}`,
      typeof payload === "string"
        ? payload
        : JSON.parse(JSON.stringify(payload))
    );
  } catch {
    console.info(`[PayPal Apple Pay] ${stage}`, payload);
  }
}

export interface ApplePayOrderResult {
  orderId: string;
  donationId?: string;
}

interface ApplePayConfigShape {
  countryCode: string;
  merchantCapabilities: string[];
  supportedNetworks: string[];
  isEligible: boolean;
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

type ApplePaySessionApi = {
  onvalidatemerchant?: (event: ApplePaySessionEvent) => void;
  onpaymentauthorized?: (event: ApplePayAuthorizedEvent) => void;
  oncancel?: () => void;
  completeMerchantValidation: (merchantSession: unknown) => void;
  completePayment: (status: number) => void;
  abort: () => void;
  begin: () => void;
};

type ApplePaySessionConstructor = {
  new (version: number, paymentRequest: Record<string, unknown>): ApplePaySessionApi;
  STATUS_SUCCESS: number;
  STATUS_FAILURE: number;
  canMakePayments: () => boolean;
  supportsVersion?: (version: number) => boolean;
};

type PayPalApplePaySdk = {
  config: () => Promise<ApplePayConfigShape>;
  validateMerchant: (params: {
    validationUrl: string;
    displayName: string;
  }) => Promise<{ merchantSession?: unknown }>;
  confirmOrder: (params: {
    orderId: string;
    token: unknown;
    billingContact?: unknown;
    shippingContact?: unknown;
  }) => Promise<unknown>;
};

declare global {
  interface Window {
    ApplePaySession?: ApplePaySessionConstructor;
  }
}

function getApplePaySession(): ApplePaySessionConstructor | undefined {
  return window.ApplePaySession;
}

function getPayPalApplePay(): PayPalApplePaySdk | undefined {
  const paypal = window.paypal as unknown as
    | { Applepay?: () => PayPalApplePaySdk }
    | undefined;
  return paypal?.Applepay?.();
}

function summarizeError(error: unknown): Record<string, unknown> {
  if (!error) return { kind: "empty" };
  if (error instanceof Error) {
    const extra: Record<string, unknown> = {};
    const code = (error as Error & { code?: unknown }).code;
    const name = (error as Error & { name?: unknown }).name;
    if (code != null) extra.code = code;
    if (name != null) extra.name = name;
    return { kind: "Error", message: error.message, ...extra };
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

export interface PayPalApplePayButtonProps {
  amount: number | string;
  currency: string;
  label: string;
  disabled: boolean;
  createOrderRequest: () => Promise<ApplePayOrderResult>;
  captureOrderRequest: (orderId: string, donationId?: string) => Promise<void>;
  cancelOrderRequest?: (donationId?: string) => Promise<void>;
  pendingDonationIdRef: MutableRefObject<string | undefined>;
  onBusyChange: (busy: boolean) => void;
  onError?: (message: string) => void;
}

/**
 * Apple Pay button using PayPal's `Applepay()` bridge + Apple's `<apple-pay-button>`.
 * Important: `ApplePaySession` must be constructed synchronously inside the user's click path.
 * Do not defer with `requestAnimationFrame`, `setTimeout`, or `await` before `begin()`.
 */
export function PayPalApplePayButton({
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
}: PayPalApplePayButtonProps) {
  const [{ isResolved }] = usePayPalScriptReducer();
  const [applePayConfig, setApplePayConfig] = useState<ApplePayConfigShape | null>(
    null
  );
  const [isEligible, setIsEligible] = useState(false);
  const [isAppleSdkReady, setIsAppleSdkReady] = useState(false);
  const numericAmount = Number(amount);
  const hostRef = useRef<HTMLDivElement | null>(null);
  /** Prevent overlapping sessions (double listeners / rapid taps). */
  const sessionActiveRef = useRef(false);

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://applepay.cdn-apple.com"]'
    );

    if (existing) {
      if (
        existing.dataset.loaded === "true" ||
        window.customElements?.get("apple-pay-button")
      ) {
        setIsAppleSdkReady(true);
        return;
      }
      const onLoad = () => {
        existing.dataset.loaded = "true";
        setIsAppleSdkReady(true);
      };
      existing.addEventListener("load", onLoad, { once: true });
      return () => existing.removeEventListener("load", onLoad);
    }

    const script = document.createElement("script");
    script.src = "https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js";
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      setIsAppleSdkReady(true);
    };
    script.onerror = () => setIsAppleSdkReady(false);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      if (
        !isResolved ||
        !isAppleSdkReady ||
        disabled ||
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        setIsEligible(false);
        return;
      }

      const ApplePaySession = getApplePaySession();
      const applepay = getPayPalApplePay();

      if (!ApplePaySession || !ApplePaySession.canMakePayments() || !applepay) {
        logApplePay("eligibility:unsupported", {
          hasApplePaySession: Boolean(ApplePaySession),
          canMakePayments: ApplePaySession?.canMakePayments?.(),
          hasPayPalApplePay: Boolean(applepay),
        });
        setIsEligible(false);
        return;
      }

      try {
        const config = await applepay.config();
        logApplePay("eligibility:config", config);
        if (!cancelled) {
          setApplePayConfig(config);
          setIsEligible(Boolean(config.isEligible));
        }
      } catch (error) {
        logApplePay("eligibility:config-error", summarizeError(error));
        if (!cancelled) setIsEligible(false);
      }
    }

    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, [disabled, isResolved, isAppleSdkReady, numericAmount]);

  const startSessionFromUserGesture = useCallback(() => {
    if (sessionActiveRef.current) {
      logApplePay("session:ignored (already active)");
      return;
    }

    const ApplePaySession = getApplePaySession();
    const applepay = getPayPalApplePay();

    if (!ApplePaySession || !applepay || !applePayConfig) {
      logApplePay("start:blocked", {
        hasApplePaySession: Boolean(ApplePaySession),
        hasPayPalApplePay: Boolean(applepay),
        hasConfig: Boolean(applePayConfig),
      });
      onError?.("Apple Pay is not available on this device or browser.");
      return;
    }

    const apiVersion = pickApplePaySessionVersion(ApplePaySession);

    const paymentRequest: Record<string, unknown> = {
      countryCode: applePayConfig.countryCode,
      merchantCapabilities: applePayConfig.merchantCapabilities,
      supportedNetworks: applePayConfig.supportedNetworks,
      currencyCode: currency,
      total: {
        label,
        type: "final",
        amount: numericAmount.toFixed(2),
      },
    };

    const session = new ApplePaySession(
      apiVersion,
      paymentRequest
    ) as ApplePaySessionApi;

    sessionActiveRef.current = true;

    session.onvalidatemerchant = (event) => {
      void (async () => {
        try {
          logApplePay("merchant-validation:start", {
            validationURL: event.validationURL,
          });
          const validateResult = await applepay.validateMerchant({
            validationUrl: event.validationURL,
            displayName: label,
          });
          const merchantSession =
            extractPayPalAppleMerchantSession(validateResult);
          const rawKeys =
            validateResult && typeof validateResult === "object"
              ? Object.keys(validateResult as Record<string, unknown>)
              : [];
          logApplePay("merchant-validation:resolved", {
            hasSession: Boolean(merchantSession),
            rawKeys,
          });
          if (merchantSession == null) {
            throw new Error(
              "PayPal returned no Apple Pay merchant session. Keys: " +
                (rawKeys.length ? rawKeys.join(", ") : "(non-object)")
            );
          }
          session.completeMerchantValidation(merchantSession);
        } catch (error) {
          const raw =
            error instanceof Error
              ? error.message
              : "Apple Pay merchant validation failed.";
          logApplePay("merchant-validation:error", summarizeError(error));
          onError?.(formatPayPalApplePayUserMessage(raw));
          session.abort();
          sessionActiveRef.current = false;
        }
      })();
    };

    session.onpaymentauthorized = (event) => {
      void (async () => {
        onBusyChange(true);
        try {
          logApplePay("payment-authorized:start");
          const result = await createOrderRequest();
          pendingDonationIdRef.current = result.donationId;
          logApplePay("order:create", {
            orderId: result.orderId,
            donationId: result.donationId,
          });

          const confirmResult = await applepay.confirmOrder({
            orderId: result.orderId,
            token: event.payment.token,
            billingContact: event.payment.billingContact,
            shippingContact: event.payment.shippingContact,
          });

          logApplePay("order:confirm", summarizeError(confirmResult));

          if (!isPayPalAppleConfirmSuccessful(confirmResult)) {
            const st = String(
              (confirmResult as { status?: string })?.status ?? "unknown"
            );
            throw new Error(`Apple Pay confirm failed with status: ${st}`);
          }

          /**
           * PayPal's sample completes the Apple Pay sheet after `confirmOrder` resolves,
           * then captures on the server. That avoids long-running capture work inside
           * `onpaymentauthorized`, which can cause the sheet to fail or time out.
           */
          session.completePayment(ApplePaySession.STATUS_SUCCESS);

          try {
            await captureOrderRequest(result.orderId, result.donationId);
            logApplePay("order:capture:ok", { orderId: result.orderId });
          } catch (captureErr) {
            logApplePay("order:capture:error", summarizeError(captureErr));
            const msg =
              captureErr instanceof Error
                ? captureErr.message
                : "Payment may still be processing; check your confirmation email.";
            onError?.(msg);
          }
        } catch (error) {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          const raw =
            error instanceof Error ? error.message : "Apple Pay checkout failed.";
          logApplePay("payment-authorized:error", summarizeError(error));
          onError?.(formatPayPalApplePayUserMessage(raw));
        } finally {
          onBusyChange(false);
          sessionActiveRef.current = false;
        }
      })();
    };

    session.oncancel = () => {
      logApplePay("session:cancelled", {
        pendingDonationId: pendingDonationIdRef.current ?? null,
      });
      sessionActiveRef.current = false;
      void cancelOrderRequest?.(pendingDonationIdRef.current).catch(() => null);
    };

    try {
      session.begin();
      logApplePay("session:begin", { apiVersion });
    } catch (error) {
      sessionActiveRef.current = false;
      logApplePay("session:begin:error", summarizeError(error));
      onError?.(
        error instanceof Error
          ? error.message
          : "Could not start Apple Pay. Try again or use PayPal below."
      );
    }
  }, [
    applePayConfig,
    captureOrderRequest,
    createOrderRequest,
    cancelOrderRequest,
    currency,
    label,
    numericAmount,
    onBusyChange,
    onError,
    pendingDonationIdRef,
  ]);

  /** Attach the native handler immediately after layout — no `requestAnimationFrame`. */
  useLayoutEffect(() => {
    const root = hostRef.current;
    if (!root || !isEligible || !applePayConfig || disabled) {
      return;
    }

    const attach = (): (() => void) | null => {
      const el = root.querySelector("apple-pay-button");
      if (!(el instanceof HTMLElement)) return null;

      const handler = () => {
        startSessionFromUserGesture();
      };

      el.addEventListener("click", handler, { capture: true });
      return () => el.removeEventListener("click", handler, true);
    };

    let detach = attach();
    if (detach) return detach;

    const mo = new MutationObserver(() => {
      detach?.();
      detach = attach();
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      detach?.();
    };
  }, [applePayConfig, disabled, isEligible, startSessionFromUserGesture]);

  if (!isEligible) return null;

  return (
    <div
      ref={hostRef}
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
