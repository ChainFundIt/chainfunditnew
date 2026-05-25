import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { recurringDonations } from '@/lib/schema/recurring-donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq } from 'drizzle-orm';
import { verifyPaystackPayment } from '@/lib/payments/paystack';
import { createPaystackPlan, createPaystackSubscription } from '@/lib/payments/paystack-subscriptions';
import { updateCampaignAmount } from '@/lib/utils/campaign-amount';
import { sendDonorConfirmationEmailById } from '@/lib/notifications/donor-confirmation-email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/campaigns?donation_status=failed&error=missing_reference`
      );
    }

    // Verify the transaction
    const verification = await verifyPaystackPayment(reference);
    
    if (!verification.status || verification.data.status !== 'success') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/campaigns?donation_status=failed&error=verification_failed`
      );
    }

    // Find donation by payment intent ID (reference)
    let donation = await db
      .select()
      .from(donations)
      .where(eq(donations.paymentIntentId, reference))
      .limit(1);

    // If not found by paymentIntentId, try to find by reference pattern
    if (!donation.length) {
      // Try to find by reference pattern (donation_<id>_<timestamp>)
      const referenceMatch = reference.match(/donation_(.+)_\d+/);
      if (referenceMatch) {
        const donationId = referenceMatch[1];
        donation = await db
          .select()
          .from(donations)
          .where(eq(donations.id, donationId))
          .limit(1);
      }
    }

    if (!donation.length) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/campaigns?donation_status=failed&error=donation_not_found`
      );
    }


    // Check if donation is already completed
    if (donation[0].paymentStatus === 'completed') {
      // Get campaign slug for redirect
      const campaign = await db.query.campaigns.findFirst({
        where: eq(campaigns.id, donation[0].campaignId),
        columns: { slug: true },
      });
      const campaignSlug = campaign?.slug || donation[0].campaignId;
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${campaignSlug}?donation_status=success&donation_id=${donation[0].id}`;
      return NextResponse.redirect(redirectUrl);
    }

    // Update donation status
    const updateResult = await db
      .update(donations)
      .set({
        paymentStatus: 'completed',
        processedAt: new Date(),
        lastStatusUpdate: new Date(),
        providerStatus: 'success',
        providerError: null,
        paymentIntentId: reference, // Ensure reference is stored
      })
      .where(eq(donations.id, donation[0].id))
      .returning();

    // Update campaign currentAmount
    await updateCampaignAmount(donation[0].campaignId);

    // If this is recurring setup payment, attempt subscription activation.
    // Do not fail the success redirect if this post-payment step fails.
    const recurringDonationId = verification.data?.metadata?.recurringDonationId;
    if (recurringDonationId) {
      try {
        const recurringDonation = await db.query.recurringDonations.findFirst({
          where: eq(recurringDonations.id, recurringDonationId),
        });

        if (recurringDonation && !recurringDonation.paystackSubscriptionId) {
          const authorizationCode = (verification.data as any)?.authorization?.authorization_code;
          const customerCode =
            verification.data?.customer?.customer_code || recurringDonation.paystackCustomerCode;

          if (authorizationCode && customerCode) {
            const plan = await createPaystackPlan(
              `Recurring Donation - ${recurringDonation.amount} ${recurringDonation.currency}`,
              parseFloat(recurringDonation.amount),
              recurringDonation.currency,
              recurringDonation.period as 'monthly' | 'quarterly' | 'yearly',
              {
                recurringDonationId: recurringDonation.id,
                campaignId: recurringDonation.campaignId,
              }
            );

            const paystackSubscription = await createPaystackSubscription(
              customerCode,
              plan.plan_code,
              authorizationCode,
              {
                recurringDonationId: recurringDonation.id,
                campaignId: recurringDonation.campaignId,
              }
            );

            await db
              .update(recurringDonations)
              .set({
                paystackSubscriptionId: paystackSubscription.subscription_code,
                paystackCustomerCode: customerCode,
                status: 'active',
                isActive: true,
                updatedAt: new Date(),
              })
              .where(eq(recurringDonations.id, recurringDonation.id));
          }
        }
      } catch (setupError) {
        console.error('Recurring Paystack setup failed after successful payment:', setupError);
      }
    }

    // Send confirmation email, but never block successful donation redirect.
    try {
      await sendDonorConfirmationEmailById(donation[0].id);
    } catch (emailError) {
      console.error('Donor confirmation email failed:', emailError);
    }

    // Get campaign slug for redirect
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, donation[0].campaignId),
      columns: { slug: true },
    });
    const campaignSlug = campaign?.slug || donation[0].campaignId;

    // Redirect to campaign page with success status
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/campaign/${campaignSlug}?donation_status=success&donation_id=${donation[0].id}`;
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Paystack callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/campaigns?donation_status=failed&error=callback_error`
    );
  }
}
