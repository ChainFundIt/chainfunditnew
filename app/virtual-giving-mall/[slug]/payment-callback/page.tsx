'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref'); // Paystack uses this too

    const actualReference = reference || trxref;

    if (actualReference) {
      verifyPayment(actualReference);
    } else {
      setStatus('failed');
    }
  }, [searchParams]); 

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(
        `/api/charities/verify-payment?reference=${reference}&method=paystack`
      );
      
      const data = await response.json();

      if (data.success && data.status === 'completed') {
        setStatus('success');
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push(`/virtual-giving-mall/${params.slug}/payment-success?donation_id=${data.donation?.id}`);
        }, 2000);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'verifying' && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <span>Verifying Payment...</span>
              </div>
            )}
            {status === 'success' && (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <span className="text-green-600">Payment Successful!</span>
              </div>
            )}
            {status === 'failed' && (
              <div className="flex flex-col items-center gap-4">
                <XCircle className="h-12 w-12 text-red-600" />
                <span className="text-red-600">Payment Failed</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-600">
          {status === 'verifying' && (
            <p>Please wait while we verify your payment...</p>
          )}
          {status === 'success' && (
            <p>Redirecting you to your donation receipt...</p>
          )}
          {status === 'failed' && (
            <p>There was an issue verifying your payment. Please contact support if you were charged.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

