"use client";

import { useEffect, useRef, useState } from "react";

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

type PayPalButtonsInstance = {
  isEligible?: () => boolean;
  render: (container: HTMLElement) => Promise<void>;
  close: () => Promise<void>;
};

type PayPalNamespace = {
  Buttons?: (options: Record<string, unknown>) => PayPalButtonsInstance;
};

const PAYPAL_NAMESPACE = "chainfunditPaypal";
const scriptLoads = new Map<string, Promise<void>>();

function getPayPalNamespace() {
  return (window as Window & Record<string, PayPalNamespace | undefined>)[PAYPAL_NAMESPACE];
}

function paypalButtonsReady() {
  return typeof getPayPalNamespace()?.Buttons === "function";
}

function waitForPayPalButtons(timeoutMs = 10000) {
  const started = Date.now();
  return new Promise<boolean>((resolve) => {
    const check = () => {
      if (paypalButtonsReady()) {
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(false);
        return;
      }
      window.setTimeout(check, 50);
    };
    check();
  });
}

function paypalScriptSrc(clientId: string, currency: string) {
  const params = new URLSearchParams({
    "client-id": clientId,
    currency,
    intent: "capture",
    components: "buttons",
  });
  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

function loadPayPalSdk(clientId: string, currency: string) {
  const key = `${clientId}:${currency}`;
  const inFlight = scriptLoads.get(key);
  if (inFlight) return inFlight;

  const promise = new Promise<void>((resolve, reject) => {
    const src = paypalScriptSrc(clientId, currency);
    const finish = () => {
      if (paypalButtonsReady()) {
        resolve();
        return;
      }
      waitForPayPalButtons().then((ready) => {
        if (ready) resolve();
        else {
          scriptLoads.delete(key);
          reject(new Error("PayPal loaded without a buttons component."));
        }
      });
    };

    const existing = document.querySelector(
      `script[data-paypal-sdk="${CSS.escape(key)}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      if (paypalButtonsReady()) {
        resolve();
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => {
          scriptLoads.delete(key);
          reject(new Error("PayPal script failed to load."));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.paypalSdk = key;
    script.setAttribute("data-namespace", PAYPAL_NAMESPACE);
    script.onload = finish;
    script.onerror = () => {
      scriptLoads.delete(key);
      reject(new Error("PayPal script failed to load."));
    };
    document.head.appendChild(script);
  });

  scriptLoads.set(key, promise);
  return promise;
}

export function PayPalOrderButtons({
  currency,
  disabled = false,
  createOrderRequest,
  captureOrderRequest,
  cancelOrderRequest,
  onError,
}: PayPalOrderButtonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingDonationIdRef = useRef<string | undefined>(undefined);
  const disabledRef = useRef(disabled);
  const onErrorRef = useRef(onError);
  const createOrderRequestRef = useRef(createOrderRequest);
  const captureOrderRequestRef = useRef(captureOrderRequest);
  const cancelOrderRequestRef = useRef(cancelOrderRequest);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [failureMessage, setFailureMessage] = useState("");

  disabledRef.current = disabled;
  onErrorRef.current = onError;
  createOrderRequestRef.current = createOrderRequest;
  captureOrderRequestRef.current = captureOrderRequest;
  cancelOrderRequestRef.current = cancelOrderRequest;

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setFailureMessage("PayPal is not configured for the browser yet.");
      setStatus("failed");
      return;
    }

    let cancelled = false;
    let buttons: PayPalButtonsInstance | null = null;

    const fail = (message: string) => {
      if (cancelled) return;
      setFailureMessage(message);
      setStatus("failed");
      console.error(message);
    };

    setStatus("loading");
    setFailureMessage("");

    loadPayPalSdk(clientId, currency)
      .then(async () => {
        if (cancelled || !containerRef.current) return;
        const paypal = getPayPalNamespace();
        if (!paypal?.Buttons) {
          fail("PayPal could not be loaded. Refresh the page or choose another payment method.");
          return;
        }

        buttons = paypal.Buttons({
          style: { layout: "vertical", shape: "rect", label: "paypal" },
          createOrder: async () => {
            if (disabledRef.current) {
              throw new Error("Enter an amount and email before paying with PayPal.");
            }
            const result = await createOrderRequestRef.current();
            pendingDonationIdRef.current = result.donationId;
            return result.orderId;
          },
          onApprove: async (data: { orderID?: string }) => {
            if (!data.orderID) {
              onErrorRef.current?.("PayPal did not return an order ID.");
              return;
            }
            try {
              await captureOrderRequestRef.current(
                data.orderID,
                pendingDonationIdRef.current
              );
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Failed to capture PayPal payment.";
              onErrorRef.current?.(message);
            }
          },
          onCancel: async () => {
            try {
              await cancelOrderRequestRef.current?.(pendingDonationIdRef.current);
            } catch {
              // Keep PayPal cancellation non-blocking for the donor.
            }
          },
          onError: (error: unknown) => {
            const message =
              error instanceof Error ? error.message : "PayPal checkout failed.";
            onErrorRef.current?.(message);
          },
        });

        if (buttons.isEligible && buttons.isEligible() === false) {
          fail("PayPal is not available for this currency.");
          return;
        }

        containerRef.current.replaceChildren();
        await buttons.render(containerRef.current);
        if (!cancelled) setStatus("ready");
      })
      .catch((error: unknown) => {
        fail(
          error instanceof Error
            ? error.message
            : "PayPal could not be loaded. Refresh the page or choose another payment method."
        );
      });

    return () => {
      cancelled = true;
      buttons?.close().catch(() => {
        // Ignore close errors when leaving the page.
      });
    };
  }, [currency]);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  return (
    <div>
      {!clientId && (
        <p className="text-sm text-red-600">
          PayPal is not configured for the browser yet. Add `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.
        </p>
      )}
      {clientId && status === "loading" && (
        <p className="text-sm text-gray-500">Loading PayPal…</p>
      )}
      {clientId && status === "failed" && (
        <p className="text-sm text-red-600">
          {failureMessage ||
            "PayPal could not be loaded. Refresh the page or choose another payment method."}
        </p>
      )}
      <div
        ref={containerRef}
        className={disabled ? "pointer-events-none opacity-50" : undefined}
      />
    </div>
  );
}
