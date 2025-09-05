import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq, sum, and } from 'drizzle-orm';
import { handlePaystackWebhook, verifyPaystackTransaction } from '@/lib/payments/paystack';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { success, event, error } = await handlePaystackWebhook(body);

    if (!success) {
      console.error('Paystack webhook error:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleChargeSuccess(chargeData: any) {
  try {
    const donationId = chargeData.metadata?.donationId;
    const reference = chargeData.reference;
    
    if (!donationId) {
      console.error('No donation ID found in charge metadata');
      return;
    }

    // Get donation to get campaignId
    const donation = await db
      .select({ campaignId: donations.campaignId })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation.length) {
      console.error('Donation not found:', donationId);
      return;
    }

    // Verify the transaction
    const verification = await verifyPaystackTransaction(reference);
    
    if (verification.success) {
      await db
        .update(donations)
        .set({
          paymentStatus: 'completed',
          processedAt: new Date(),
        })
        .where(eq(donations.id, donationId));

      // Update campaign currentAmount
      await updateCampaignAmount(donation[0].campaignId);

      console.log(`Payment completed for donation: ${donationId}`);
    } else {
      console.error('Transaction verification failed:', verification.error);
    }
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

async function handleChargeFailed(chargeData: any) {
  try {
    const donationId = chargeData.metadata?.donationId;
    
    if (!donationId) {
      console.error('No donation ID found in charge metadata');
      return;
    }

    await db
      .update(donations)
      .set({
        paymentStatus: 'failed',
      })
      .where(eq(donations.id, donationId));

    console.log(`Payment failed for donation: ${donationId}`);
  } catch (error) {
    console.error('Error handling charge failure:', error);
  }
}
