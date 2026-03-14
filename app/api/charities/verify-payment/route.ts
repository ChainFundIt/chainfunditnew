import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackPayment } from '@/lib/payments/paystack';
import { capturePayPalOrder } from '@/lib/payments/paypal';
import { db } from '@/lib/db';
import { charityDonations } from '@/lib/schema/charities';
import { eq } from 'drizzle-orm';
import { completeCharityDonation } from '@/lib/payments/charity-donation-processing';

/**
 * GET /api/charities/verify-payment?reference={reference}&method={stripe|paystack|paypal}
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
      return NextResponse.json({
        success: false,
        status: 'unsupported',
        message: 'Stripe is no longer supported. Please use PayPal or Paystack.',
      });
    } else if (method === 'paypal') {
      const donation = await db.query.charityDonations.findFirst({
        where: eq(charityDonations.paymentIntentId, reference),
      });

      if (!donation) {
        return NextResponse.json(
          { error: 'Donation not found' },
          { status: 404 }
        );
      }

      const capture = await capturePayPalOrder(reference);
      if (capture.status !== 'COMPLETED') {
        return NextResponse.json({
          success: false,
          status: capture.status?.toLowerCase?.() || 'failed',
          donation,
          message: 'Payment not completed',
        });
      }

      const completed = await completeCharityDonation({
        donationId: donation.id,
        paymentReference: reference,
      });

      return NextResponse.json({
        success: true,
        status: 'completed',
        donation: {
          ...donation,
          id: completed.donationId,
        },
        message: 'Payment verified successfully',
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

