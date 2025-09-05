import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq, sum, and } from 'drizzle-orm';
import { verifyPaystackTransaction } from '@/lib/payments/paystack';

// Helper function to update campaign currentAmount based on completed donations
async function updateCampaignAmount(campaignId: string) {
  try {
    // Calculate total amount from completed donations
    const donationStats = await db
      .select({
        totalAmount: sum(donations.amount),
      })
      .from(donations)
      .where(and(
        eq(donations.campaignId, campaignId),
        eq(donations.paymentStatus, 'completed')
      ));

    const totalAmount = Number(donationStats[0]?.totalAmount || 0);

    // Update campaign currentAmount
    await db
      .update(campaigns)
      .set({
        currentAmount: totalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));

    console.log(`Updated campaign ${campaignId} currentAmount to ${totalAmount}`);
  } catch (error) {
    console.error('Error updating campaign amount:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/donation/failed?error=missing_reference`
      );
    }

    // Verify the transaction
    const verification = await verifyPaystackTransaction(reference);
    
    if (!verification.success) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/donation/failed?error=verification_failed`
      );
    }

    // Find donation by payment intent ID (reference)
    const donation = await db
      .select()
      .from(donations)
      .where(eq(donations.paymentIntentId, reference))
      .limit(1);

    if (!donation.length) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/donation/failed?error=donation_not_found`
      );
    }

    // Update donation status
    await db
      .update(donations)
      .set({
        paymentStatus: 'completed',
        processedAt: new Date(),
      })
      .where(eq(donations.id, donation[0].id));

    // Update campaign currentAmount
    await updateCampaignAmount(donation[0].campaignId);

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/donation/success?donation=${donation[0].id}`
    );

  } catch (error) {
    console.error('Error processing Paystack callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/donation/failed?error=callback_error`
    );
  }
}
