"use client";

import { useMemo, useRef, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

interface CreateSubscriptionResult {
  paypalSubscriptionId: string;
  recurringDonationId?: string;
}

interface PayPalSubscriptionButtonsProps {
  currency: string;
  disabled?: boolean;
  createSubscriptionRequest: () => Promise<CreateSubscriptionResult>;
  confirmSubscriptionRequest: (
    paypalSubscriptionId: string,
    recurringDonationId?: string
  ) => Promise<void>;
  cancelSubscriptionRequest?: (recurringDonationId?: string) => Promise<void>;
  onError?: (message: string) => void;
}

export function PayPalSubscriptionButtons({
  currency,
  disabled = false,
  createSubscriptionRequest,
  confirmSubscriptionRequest,
  cancelSubscriptionRequest,
  onError,
}: PayPalSubscriptionButtonsProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const recurringDonationIdRef = useRef<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const options = useMemo(
    () => ({
      clientId: clientId || "",
      currency,
      vault: true,
      intent: "subscription",
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
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", label: "subscribe" }}
          disabled={disabled || isBusy}
          forceReRender={[currency, disabled]}
          createSubscription={async () => {
            try {
              setIsBusy(true);
              const result = await createSubscriptionRequest();
              recurringDonationIdRef.current = result.recurringDonationId;
              return result.paypalSubscriptionId;
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Failed to start PayPal subscription.";
              onError?.(message);
              throw error;
            } finally {
              setIsBusy(false);
            }
          }}
          onApprove={async (data) => {
            if (!data.subscriptionID) {
              onError?.("PayPal did not return a subscription ID.");
              return;
            }

            try {
              setIsBusy(true);
              await confirmSubscriptionRequest(
                data.subscriptionID,
                recurringDonationIdRef.current
              );
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Failed to confirm PayPal subscription.";
              onError?.(message);
            } finally {
              setIsBusy(false);
            }
          }}
          onCancel={async () => {
            try {
              await cancelSubscriptionRequest?.(recurringDonationIdRef.current);
            } catch {
              // Keep cancellation non-blocking.
            }
          }}
          onError={(error) => {
            const message =
              error instanceof Error ? error.message : "PayPal subscription failed.";
            onError?.(message);
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
