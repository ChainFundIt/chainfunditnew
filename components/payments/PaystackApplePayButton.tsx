"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type PaystackPaymentRequestConfig = {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  container: string;
  style?: Record<string, unknown>;
  onSuccess?: (transaction: { reference?: string; trxref?: string }) => void;
  onError?: (error?: unknown) => void;
  onCancel?: () => void;
  onElementsMount?: (elements: { applePay?: boolean } | null) => void;
};

type PaystackPopInstance = {
  paymentRequest: (config: PaystackPaymentRequestConfig) => Promise<void>;
};

type PaystackPopConstructor = new () => PaystackPopInstance;

declare global {
  interface Window {
    PaystackPop?: PaystackPopConstructor;
  }
}

interface PaystackApplePayButtonProps {
  amount: number;
  currency: string;
  campaignId: string;
  chainerId?: string | null;
  email?: string;
  donorName?: string;
  donorPhone?: string;
  isAnonymous?: boolean;
  disabled?: boolean;
  onSuccess: (donationId?: string) => void;
  onError: (error: string) => void;
}

function loadPaystackInline(): Promise<void> {
  if (window.PaystackPop) {
    return Promise.resolve();
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[src="https://js.paystack.co/v2/inline.js"]'
  );

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Paystack failed to load.")), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Paystack failed to load."));
    document.body.appendChild(script);
  });
}

const PaystackApplePayButton: React.FC<PaystackApplePayButtonProps> = ({
  amount,
  currency,
  campaignId,
  chainerId,
  email,
  donorName,
  donorPhone,
  isAnonymous = true,
  disabled = false,
  onSuccess,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [donationId, setDonationId] = useState<string | undefined>();
  const [hasAttemptedPrepare, setHasAttemptedPrepare] = useState(false);
  const preparedSignatureRef = useRef<string | null>(null);
  const containerId = useMemo(
    () => `paystack-apple-pay-${Math.random().toString(36).slice(2)}`,
    []
  );

  useEffect(() => {
    setIsMounted(false);
    setDonationId(undefined);
    setHasAttemptedPrepare(false);
    preparedSignatureRef.current = null;
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  }, [amount, currency, campaignId]);

  const prepareApplePay = async () => {
    if (isPreparing) {
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      onError("Enter a valid donation amount first.");
      return;
    }

    setIsPreparing(true);
    setIsMounted(false);
    setHasAttemptedPrepare(true);

    try {
      await loadPaystackInline();

      if (!window.PaystackPop) {
        throw new Error("Paystack is not available in this browser.");
      }

      const fallbackId =
        window.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const fallbackEmail = email?.trim() || `quickdonor+${fallbackId}@chainfundit.app`;

      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          campaignId,
          amount,
          currency,
          paymentProvider: "paystack",
          paymentMethod: "apple_pay",
          quickDonate: true,
          chainerId: chainerId || null,
          isAnonymous,
          email: fallbackEmail,
          donorName,
          donorPhone,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || !data?.reference || !data?.publicKey) {
        throw new Error(data?.error || "Could not prepare Apple Pay.");
      }

      setDonationId(data.donationId);
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      const paystack = new window.PaystackPop();
      await paystack.paymentRequest({
        key: data.publicKey,
        email: fallbackEmail,
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        ref: data.reference,
        container: containerId,
        style: {
          theme: "dark",
          applePay: {
            margin: "0",
            padding: "0",
            width: "100%",
            borderRadius: "9999px",
            type: "donate",
            locale: "en",
          },
        },
        onElementsMount: (elements) => {
          const hasApplePay = Boolean(elements?.applePay);
          setIsMounted(hasApplePay);
          if (!hasApplePay) {
            onError("Apple Pay is not available on this device or browser.");
          }
        },
        onSuccess: async (transaction) => {
          const reference = transaction.reference || transaction.trxref || data.reference;
          try {
            const verifyResponse = await fetch("/api/payments/paystack/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference,
                donationId: data.donationId,
              }),
            });

            const verifyData = await verifyResponse.json().catch(() => null);
            if (!verifyResponse.ok || !verifyData?.success) {
              throw new Error(verifyData?.error || "Payment verification failed.");
            }

            track("payment_succeeded", {
              donation_id: data.donationId,
              reference,
              payment_method: "paystack",
            });
            onSuccess(data.donationId);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Payment verification failed.";
            track("payment_failed", {
              donation_id: data.donationId,
              payment_method: "paystack",
              error_message: message,
            });
            onError(message);
          }
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : "Apple Pay payment failed.";
          track("payment_failed", {
            donation_id: data.donationId,
            payment_method: "paystack",
            error_message: message,
          });
          onError(message);
        },
        onCancel: () => {
          onError("Apple Pay payment was cancelled.");
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not prepare Apple Pay.";
      onError(message);
    } finally {
      setIsPreparing(false);
    }
  };

  useEffect(() => {
    if (disabled || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const signature = [
      campaignId,
      currency.toUpperCase(),
      amount.toFixed(2),
      chainerId || "",
      email || "",
      donorName || "",
      donorPhone || "",
      String(isAnonymous),
    ].join("|");

    if (preparedSignatureRef.current === signature) {
      return;
    }

    preparedSignatureRef.current = signature;
    void prepareApplePay();
  }, [
    amount,
    campaignId,
    chainerId,
    currency,
    disabled,
    donorName,
    donorPhone,
    email,
    isAnonymous,
  ]);

  return (
    <div className="space-y-2">
      {!isMounted ? (
        <Button
          type="button"
          onClick={prepareApplePay}
          disabled={disabled || isPreparing}
          className="h-11 w-full rounded-full bg-black text-white"
        >
          {isPreparing
            ? "Preparing Apple Pay..."
            : hasAttemptedPrepare
              ? "Retry Apple Pay"
              : "Preparing Apple Pay..."}
        </Button>
      ) : null}
      <div
        id={containerId}
        ref={containerRef}
        className={isMounted ? "min-h-11 overflow-hidden rounded-full" : "hidden"}
      />
      {donationId && !isMounted ? (
        <p className="text-xs text-gray-500">Checking Apple Pay availability...</p>
      ) : null}
    </div>
  );
};

export default PaystackApplePayButton;
