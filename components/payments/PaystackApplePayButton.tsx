"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';
import { getPaystackPublicKey } from '@/lib/payments/paystack';

interface PaystackApplePayButtonProps {
  amount: number;
  currency: string;
  donationId: string;
  email: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  metadata?: Record<string, any>;
  label?: string;
}

const PaystackApplePayButton: React.FC<PaystackApplePayButtonProps> = ({
  amount,
  currency,
  donationId,
  email,
  onSuccess,
  onError,
  metadata = {},
  label = 'Pay with Apple Pay',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkApplePayAvailability();
  }, []);

  const checkApplePayAvailability = () => {
    // Check if Apple Pay is available on the device
    if (typeof window !== 'undefined' && window.ApplePaySession) {
      // Check if Apple Pay can make payments
      if (window.ApplePaySession.canMakePayments()) {
        setIsAvailable(true);
      }
    }
  };

  const handleApplePay = async () => {
    setIsProcessing(true);

    try {
      // Initialize payment on server to get reference
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          donationId,
          paymentProvider: 'paystack',
          paymentMethod: 'apple_pay',
          email,
          metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Load Paystack InlineJS if not already loaded
      if (!window.PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v2/inline.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

     
      const handler = window.PaystackPop.setup({
        key: getPaystackPublicKey(),
        email,
        amount: Math.round(amount * 100), // Convert to kobo/cents
        currency: currency.toUpperCase(),
        ref: data.reference,
        metadata: {
          ...metadata,
          donationId,
          paymentMethod: 'apple_pay',
        },
        onClose: () => {
          setIsProcessing(false);
          onError('Payment was cancelled');
        },
        callback: async (response: any) => {
          try {
            // Verify payment on server
            const verifyResponse = await fetch('/api/payments/paystack/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                reference: response.reference,
                donationId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              // Track payment success
              track('payment_succeeded', {
                donation_id: donationId,
                reference: response.reference,
                payment_method: 'paystack',
              });

              toast.success('Payment successful! Thank you for your donation.');
              onSuccess();
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            const errorMessage = error.message || 'Payment verification failed';
            
            // Track payment failure
            track('payment_failed', {
              donation_id: donationId,
              payment_method: 'paystack',
              error_message: errorMessage,
            });

            onError(errorMessage);
            toast.error(errorMessage);
          } finally {
            setIsProcessing(false);
          }
        },
      });

      handler.openIframe();
      
    } catch (error: any) {
      console.error('Apple Pay payment error:', error);
      const errorMessage = error.message || 'Payment failed. Please try again.';
      
      // Track payment failure
      track('payment_failed', {
        donation_id: donationId,
        payment_method: 'paystack',
        error_message: errorMessage,
      });

      onError(errorMessage);
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };


  if (!isAvailable) {
    return null;
  }

  return (
    <div className="w-full" ref={containerRef}>
      <Button
        type="button"
        onClick={handleApplePay}
        disabled={isProcessing}
        className="w-full h-12 bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2 rounded-lg"
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            {label}
          </>
        )}
      </Button>
    </div>
  );
};

declare global {
  interface Window {
    PaystackPop?: any;
    ApplePaySession?: any;
  }
}

export default PaystackApplePayButton;

