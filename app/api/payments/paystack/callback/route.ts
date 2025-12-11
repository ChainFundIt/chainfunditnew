import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq } from 'drizzle-orm';
import { verifyPaystackPayment } from '@/lib/payments/paystack';
import { updateCampaignAmount } from '@/lib/utils/campaign-amount';
import { toast } from 'sonner';
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

    // Send confirmation email to donor
    await sendDonorConfirmationEmailById(donation[0].id);

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
    toast.error('Paystack callback error: ' + error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/campaigns?donation_status=failed&error=callback_error`
    );
  }
}
