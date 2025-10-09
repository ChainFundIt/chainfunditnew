import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackPayment } from '@/lib/payments/paystack';
import { getStripePaymentIntent } from '@/lib/payments/stripe';
import { db } from '@/lib/db';
import { charityDonations } from '@/lib/schema/charities';
import { eq } from 'drizzle-orm';

/**
 * GET /api/charities/verify-payment?reference={reference}&method={stripe|paystack}
 * Verify payment status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const method = searchParams.get('method');

    if (!reference || !method) {
      return NextResponse.json(
        { error: 'Missing reference or method' },
        { status: 400 }
      );
    }

    if (method === 'paystack') {
      // Verify Paystack payment
      const verification = await verifyPaystackPayment(reference);

      if (verification.status && verification.data.status === 'success') {
        // Find donation by reference
        const donation = await db.query.charityDonations.findFirst({
          where: eq(charityDonations.transactionId, reference),
        });

        return NextResponse.json({
          success: true,
          status: 'completed',
          donation,
          message: 'Payment verified successfully',
        });
      } else {
        return NextResponse.json({
          success: false,
          status: 'failed',
          message: 'Payment verification failed',
        });
      }
    } else if (method === 'stripe') {
      // Verify Stripe payment
      const paymentIntent = await getStripePaymentIntent(reference);

      const donation = await db.query.charityDonations.findFirst({
        where: eq(charityDonations.paymentIntentId, reference),
      });

      return NextResponse.json({
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        donation,
        message:
          paymentIntent.status === 'succeeded'
            ? 'Payment verified successfully'
            : 'Payment not completed',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

