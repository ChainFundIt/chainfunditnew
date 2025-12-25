import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { eq } from 'drizzle-orm';
import { verifyPaystackPayment } from '@/lib/payments/paystack';
import { updateCampaignAmount } from '@/lib/utils/campaign-amount';
import { sendDonorConfirmationEmailById } from '@/lib/notifications/donor-confirmation-email';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, donationId } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Missing reference' },
        { status: 400 }
      );
    }

    // Verify the transaction with Paystack
    const verification = await verifyPaystackPayment(reference);

    if (!verification.status || verification.data.status !== 'success') {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification failed',
          status: verification.data.status,
        },
        { status: 400 }
      );
    }

    // Find donation by ID or reference
    let donation;
    if (donationId) {
      donation = await db.query.donations.findFirst({
        where: eq(donations.id, donationId),
      });
    }

    // If not found by ID, try to find by reference
    if (!donation) {
      const donationsList = await db
        .select()
        .from(donations)
        .where(eq(donations.paymentIntentId, reference))
        .limit(1);

      if (donationsList.length > 0) {
        donation = donationsList[0];
      }
    }

    if (!donation) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Check if donation is already completed
    if (donation.paymentStatus === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        donation,
      });
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
        paymentIntentId: reference,
      })
      .where(eq(donations.id, donation.id))
      .returning();

    // Update campaign currentAmount
    await updateCampaignAmount(donation.campaignId);

    // Send confirmation email to donor
    await sendDonorConfirmationEmailById(donation.id);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      donation: updateResult[0],
    });
  } catch (error: any) {
    console.error('Error verifying Paystack payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Payment verification failed',
      },
      { status: 500 }
    );
  }
}

