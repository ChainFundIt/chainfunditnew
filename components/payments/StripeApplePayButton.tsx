"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';

interface StripeApplePayButtonProps {
  amount: number;
  currency: string;
  donationId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  country?: string;
  label?: string;
}

const StripeApplePayButton: React.FC<StripeApplePayButtonProps> = ({
  amount,
  currency,
  donationId,
  onSuccess,
  onError,
  country = 'US',
  label = 'Pay with Apple Pay',
}) => {
  const stripe = useStripe();
  const paymentRequestRef = useRef<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Create payment request
    const paymentRequest = stripe.paymentRequest({
      country,
      currency: currency.toLowerCase(),
      total: {
        label: 'Donation',
        amount: Math.round(amount * 100), // Convert to cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if Apple Pay is available
    paymentRequest.canMakePayment().then((result) => {
      if (result && result.applePay) {
        setCanMakePayment(true);
        paymentRequestRef.current = paymentRequest;
      }
    });

    // Handle payment method event
    paymentRequest.on('paymentmethod', async (ev) => {
      setIsProcessing(true);

      try {
        // Create payment intent on server
        const response = await fetch('/api/payments/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency,
            donationId,
            paymentProvider: 'stripe',
            paymentMethod: 'apple_pay',
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to initialize payment');
        }

        // Confirm payment with Stripe
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: ev.paymentMethod.id,
          },
          { handleActions: false }
        );

        if (confirmError) {
          ev.complete('fail');
          throw new Error(confirmError.message || 'Payment failed');
        }

        // Complete the payment request
        ev.complete('success');

        // Track payment success
        track('payment_succeeded', {
          donation_id: donationId,
          payment_intent_id: paymentIntent?.id,
          payment_method: 'stripe',
        });

        // Call callback endpoint to update donation status
        const callbackResponse = await fetch('/api/payments/stripe/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            donationId,
            paymentIntentId: paymentIntent?.id,
            status: paymentIntent?.status,
          }),
        });

        if (callbackResponse.ok) {
          toast.success('Payment successful! Thank you for your donation.');
          onSuccess();
        } else {
          const errorData = await callbackResponse.json();
          console.error('Failed to update donation status:', errorData);
          onError('Payment succeeded but failed to update donation status. Please contact support.');
        }
      } catch (error: any) {
        console.error('Apple Pay payment error:', error);
        const errorMessage = error.message || 'Payment failed. Please try again.';
        
        // Track payment failure
        track('payment_failed', {
          donation_id: donationId,
          payment_method: 'stripe',
          error_message: errorMessage,
        });

        ev.complete('fail');
        onError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    });
  }, [stripe, amount, currency, donationId, country, onSuccess, onError]);

  if (!stripe || !canMakePayment) {
    return null; // Don't show button if Apple Pay is not available
  }

  const handleClick = () => {
    if (paymentRequestRef.current && !isProcessing) {
      paymentRequestRef.current.show();
    }
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        onClick={handleClick}
        disabled={isProcessing || !canMakePayment}
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

export default StripeApplePayButton;

