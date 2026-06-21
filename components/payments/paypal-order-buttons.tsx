"use client";

import { useMemo, useRef, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

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

export function PayPalOrderButtons({
  currency,
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
      components: "buttons",
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
