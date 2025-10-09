import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { charities, charityDonations } from '@/lib/schema/charities';
import { eq } from 'drizzle-orm';
import { createStripePaymentIntent } from '@/lib/payments/stripe';
import { initializePaystackPayment } from '@/lib/payments/paystack';

/**
 * POST /api/charities/[id]/payment-intent
 * Create a payment intent for Stripe or initialize Paystack payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      amount,
      currency,
      donorEmail,
      donorName,
      message,
      isAnonymous,
      donationId, // If donation already created
    } = body;

    // Verify charity exists and is active
    const charity = await db.query.charities.findFirst({
      where: eq(charities.id, id),
    });

    if (!charity) {
      return NextResponse.json(
        { error: 'Charity not found' },
        { status: 404 }
      );
    }

    if (!charity.isActive || charity.isPaused) {
      return NextResponse.json(
        { error: 'This charity is not currently accepting donations' },
        { status: 400 }
      );
    }

    // Determine payment method based on currency
    const isNigerian = currency === 'NGN';
    const paymentMethod = isNigerian ? 'paystack' : 'stripe';

    // Create or update donation record
    let donation;
    if (donationId) {
      // Update existing donation
      const [updated] = await db
        .update(charityDonations)
        .set({
          paymentMethod,
          updatedAt: new Date(),
        })
        .where(eq(charityDonations.id, donationId))
        .returning();
      donation = updated;
    } else {
      // Create new donation
      const [created] = await db
        .insert(charityDonations)
        .values({
          charityId: charity.id,
          donorEmail,
          donorName: isAnonymous ? 'Anonymous' : donorName,
          amount: amount.toString(),
          currency,
          message,
          isAnonymous,
          paymentMethod,
          paymentStatus: 'pending',
          payoutStatus: 'pending',
        })
        .returning();
      donation = created;
    }

    // Create payment intent based on currency
    if (isNigerian) {
      // Use Paystack for Nigerian Naira
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/charities/${charity.slug}/payment-callback`;
      
      const paystackResponse = await initializePaystackPayment(
        donorEmail,
        parseFloat(amount),
        currency,
        {
          donationId: donation.id,
          charityId: charity.id,
          charityName: charity.name,
          donorName: isAnonymous ? 'Anonymous' : donorName || 'Anonymous',
        },
        callbackUrl
      );

      // Update donation with Paystack reference
      await db
        .update(charityDonations)
        .set({
          transactionId: paystackResponse.data.reference,
          updatedAt: new Date(),
        })
        .where(eq(charityDonations.id, donation.id));

      return NextResponse.json({
        paymentMethod: 'paystack',
        authorizationUrl: paystackResponse.data.authorization_url,
        reference: paystackResponse.data.reference,
        donationId: donation.id,
      });
    } else {
      // Use Stripe for other currencies
      const paymentIntent = await createStripePaymentIntent(
        parseFloat(amount),
        currency,
        {
          donationId: donation.id,
          charityId: charity.id,
          charityName: charity.name,
          donorEmail,
          donorName: isAnonymous ? 'Anonymous' : donorName || 'Anonymous',
        }
      );

      // Update donation with Stripe payment intent ID
      await db
        .update(charityDonations)
        .set({
          paymentIntentId: paymentIntent.id,
          updatedAt: new Date(),
        })
        .where(eq(charityDonations.id, donation.id));

      return NextResponse.json({
        paymentMethod: 'stripe',
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        donationId: donation.id,
      });
    }
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

