'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Initialize Stripe
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ donationId }: { donationId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const params = useParams();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/virtual-giving-mall/${params.slug}/payment-success?donation_id=${donationId}`,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Lock className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Complete Donation'}
      </Button>

      <p className="text-xs text-center text-gray-500">
        By completing this donation, you agree to our terms and conditions
      </p>
    </form>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const clientSecret = searchParams.get('client_secret');
  const donationId = searchParams.get('donation_id');

  if (!clientSecret || !donationId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invalid Payment Link</CardTitle>
            <CardDescription>
              The payment link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/virtual-giving-mall/${params.slug}`}>
                Back to Charity
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#16a34a',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button asChild variant="ghost" className="mb-6">
          <Link href={`/virtual-giving-mall/${params.slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Charity
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              Complete Your Donation
            </CardTitle>
            <CardDescription>
              Enter your payment details to complete your donation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm donationId={donationId} />
            </Elements>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Powered by Stripe • Secure payment processing</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

