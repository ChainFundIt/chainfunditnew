"use client";

import { createElement, useEffect, useMemo, useRef, useState } from "react";
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
  }) => Promise<{ merchantSession: unknown }>;
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
  const pendingDonationIdRef = useRef<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const options = useMemo(
    () => ({
      clientId: clientId || "",
      currency,
      intent: "capture",
      components: "buttons,applepay",
    }),
    [clientId, currency]
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
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        setIsEligible(false);
        return;
      }

      const ApplePaySession = getApplePaySession();
      const applepay = getPayPalApplePay();

      if (!ApplePaySession || !ApplePaySession.canMakePayments() || !applepay) {
        setIsEligible(false);
        return;
      }

      try {
        const config = await applepay.config();
        if (!cancelled) {
          setApplePayConfig(config);
          setIsEligible(Boolean(config.isEligible));
        }
      } catch {
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

  const handleApplePayClick = () => {
    const ApplePaySession = getApplePaySession();
    const applepay = getPayPalApplePay();

    if (!ApplePaySession || !applepay || !applePayConfig) {
      onError?.("Apple Pay is not available on this device or browser.");
      return;
    }

    const paymentRequest = {
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

    const session = new ApplePaySession(4, paymentRequest);

    session.onvalidatemerchant = async (event) => {
      try {
        const validateResult = await applepay.validateMerchant({
          validationUrl: event.validationURL,
          displayName: label,
        });
        session.completeMerchantValidation(validateResult.merchantSession);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Apple Pay merchant validation failed.";
        onError?.(message);
        session.abort();
      }
    };

    session.onpaymentauthorized = async (event) => {
      try {
        onBusyChange(true);
        const result = await createOrderRequest();
        pendingDonationIdRef.current = result.donationId;

        const confirmResult = await applepay.confirmOrder({
          orderId: result.orderId,
          token: event.payment.token,
          billingContact: event.payment.billingContact,
          shippingContact: event.payment.shippingContact,
        });

        const confirmStatus = getConfirmOrderStatus(confirmResult);
        if (confirmStatus && confirmStatus !== "APPROVED" && confirmStatus !== "COMPLETED") {
          throw new Error(`Apple Pay authorization failed with status: ${confirmStatus}`);
        }

        await captureOrderRequest(result.orderId, result.donationId);
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
      } catch (error) {
        session.completePayment(ApplePaySession.STATUS_FAILURE);
        const message =
          error instanceof Error ? error.message : "Apple Pay checkout failed.";
        onError?.(message);
      } finally {
        onBusyChange(false);
      }
    };

    session.oncancel = async () => {
      try {
        await cancelOrderRequest?.(pendingDonationIdRef.current);
      } catch {
        // Keep Apple Pay cancellation non-blocking for the donor.
      }
    };

    session.begin();
  };

  if (!isEligible) {
    return null;
  }

  return (
    <div className="mb-3 px-8 py-4 w-full overflow-hidden rounded-lg">
      {createElement("apple-pay-button", {
        buttonstyle: "black",
        type: "donate",
        locale: "en-US",
        "aria-label": "Donate with Apple Pay",
        className: "h-12 w-full",
        onClick: handleApplePayClick,
      })}
    </div>
  );
}
