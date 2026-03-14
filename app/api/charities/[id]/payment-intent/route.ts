import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { charities, charityDonations } from '@/lib/schema/charities';
import { eq } from 'drizzle-orm';
import { initializePaystackPayment } from '@/lib/payments/paystack';
import { createPayPalOrder, getPayPalApprovalUrl } from '@/lib/payments/paypal';
import { getSupportedProviders } from '@/lib/payments/config';

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
      donationId,
      paymentMethod: requestedPaymentMethod,
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

    const supportedProviders = getSupportedProviders(currency);
    const paymentMethod =
      typeof requestedPaymentMethod === 'string' &&
      supportedProviders.includes(requestedPaymentMethod as any)
        ? requestedPaymentMethod
        : currency === 'NGN'
          ? 'paystack'
          : 'paypal';

    if (!supportedProviders.includes(paymentMethod as any)) {
      return NextResponse.json(
        { error: `${paymentMethod} does not support ${currency}` },
        { status: 400 }
      );
    }

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
    if (paymentMethod === 'paystack') {
      // Use Paystack for Nigerian Naira
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/charities/${charity.slug}/payment-callback`;
      
      // Structure metadata with custom_fields for Paystack Dashboard display
      const charityMetadata = {
        donationId: donation.id,
        charityId: charity.id,
        charityName: charity.name,
        donorName: isAnonymous ? 'Anonymous' : donorName || 'Anonymous',
        custom_fields: [
          {
            display_name: "Charity Name",
            variable_name: "charity_name",
            value: charity.name,
          },
          {
            display_name: "Charity ID",
            variable_name: "charity_id",
            value: charity.id,
          },
          {
            display_name: "Donation ID",
            variable_name: "donation_id",
            value: donation.id,
          },
          {
            display_name: "Donor Name",
            variable_name: "donor_name",
            value: isAnonymous ? 'Anonymous' : donorName || 'Anonymous',
          },
        ],
      };

      const paystackResponse = await initializePaystackPayment(
        donorEmail,
        parseFloat(amount),
        currency,
        charityMetadata,
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
    } else if (paymentMethod === 'paypal') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
      const returnUrl = `${baseUrl}/virtual-giving-mall/${charity.slug}/payment-callback`;
      const cancelUrl = `${baseUrl}/virtual-giving-mall/${charity.slug}`;
      const order = await createPayPalOrder({
        amount: parseFloat(amount),
        currency,
        donationId: donation.id,
        campaignTitle: charity.name,
        donorEmail,
        returnUrl,
        cancelUrl,
        customId: charity.slug,
        description: `Donation to ${charity.name}`,
      });

      const approvalUrl = getPayPalApprovalUrl(order);
      if (!approvalUrl) {
        throw new Error('PayPal approval URL missing');
      }

      await db
        .update(charityDonations)
        .set({
          paymentIntentId: order.id,
          updatedAt: new Date(),
        })
        .where(eq(charityDonations.id, donation.id));

      return NextResponse.json({
        paymentMethod: 'paypal',
        approvalUrl,
        orderId: order.id,
        donationId: donation.id,
      });
    }

    return NextResponse.json(
      { error: `Unsupported payment method: ${paymentMethod}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

