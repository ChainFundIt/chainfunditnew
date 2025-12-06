import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq, sum, and, isNull, lt } from 'drizzle-orm';
import { verifyPaystackPayment } from '@/lib/payments/paystack';
import { checkAndUpdateGoalReached } from '@/lib/utils/campaign-validation';

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

    // Check if campaign reached its goal and update status
    await checkAndUpdateGoalReached(campaignId);
  } catch (error) {
    console.error('Error updating campaign amount:', error);
  }
}

// GET /api/admin/process-pending-payments - Get all pending payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const summary = searchParams.get('summary') === 'true';
    const paymentMethod = searchParams.get('paymentMethod') || null;

    if (summary) {
      // Return summary statistics
      const whereConditions = paymentMethod
        ? and(
            eq(donations.paymentStatus, 'pending'),
            eq(donations.paymentMethod, paymentMethod)
          )
        : eq(donations.paymentStatus, 'pending');

      const allPending = await db
        .select({
          id: donations.id,
          paymentMethod: donations.paymentMethod,
          paymentIntentId: donations.paymentIntentId,
          createdAt: donations.createdAt,
        })
        .from(donations)
        .where(whereConditions);

      const now = Date.now();
      const stats = {
        total: allPending.length,
        withReference: allPending.filter(d => d.paymentIntentId).length,
        withoutReference: allPending.filter(d => !d.paymentIntentId).length,
        byMethod: {} as Record<string, number>,
        byAge: {
          lessThan1Hour: 0,
          oneTo24Hours: 0,
          moreThan24Hours: 0,
        }
      };

      allPending.forEach(donation => {
        // Count by payment method
        const method = donation.paymentMethod || 'unknown';
        stats.byMethod[method] = (stats.byMethod[method] || 0) + 1;

        // Count by age
        const ageInMs = now - donation.createdAt.getTime();
        const ageInHours = ageInMs / (1000 * 60 * 60);
        
        if (ageInHours < 1) {
          stats.byAge.lessThan1Hour++;
        } else if (ageInHours < 24) {
          stats.byAge.oneTo24Hours++;
        } else {
          stats.byAge.moreThan24Hours++;
        }
      });

      return NextResponse.json({
        success: true,
        summary: stats,
        message: `Found ${stats.total} pending payment(s)`
      });
    }

    // Get all pending donations older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const whereConditions = paymentMethod
      ? and(
          eq(donations.paymentStatus, 'pending'),
          lt(donations.createdAt, fiveMinutesAgo),
          eq(donations.paymentMethod, paymentMethod)
        )
      : and(
          eq(donations.paymentStatus, 'pending'),
          lt(donations.createdAt, fiveMinutesAgo)
        );
    
    const pendingDonations = await db
      .select({
        id: donations.id,
        campaignId: donations.campaignId,
        amount: donations.amount,
        currency: donations.currency,
        paymentMethod: donations.paymentMethod,
        paymentIntentId: donations.paymentIntentId,
        createdAt: donations.createdAt,
        lastStatusUpdate: donations.lastStatusUpdate,
      })
      .from(donations)
      .where(whereConditions)
      .orderBy(donations.createdAt);

    return NextResponse.json({
      success: true,
      data: pendingDonations,
      count: pendingDonations.length
    });
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending payments' },
      { status: 500 }
    );
  }
}

// Bulk process pending payments
async function processBulkPendingPayments(paymentMethod: string, action: string) {
  try {
    // Get all pending donations for the specified payment method
    const pendingDonations = await db
      .select()
      .from(donations)
      .where(and(
        eq(donations.paymentStatus, 'pending'),
        eq(donations.paymentMethod, paymentMethod)
      ))
      .orderBy(donations.createdAt);

    if (pendingDonations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending payments found',
        processed: 0,
        completed: 0,
        failed: 0,
        errors: 0
      });
    }

    const results = {
      processed: 0,
      completed: 0,
      failed: 0,
      errors: 0,
      details: [] as Array<{ donationId: string; status: string; error?: string }>
    };

    // Process each donation
    for (const donation of pendingDonations) {
      try {
        let newStatus = 'pending';
        let processedAt: Date | null = null;
        let providerStatus: string | null = null;
        let providerError: string | null = null;

        if (action === 'verify' && donation.paymentIntentId) {
          if (paymentMethod === 'paystack') {
            try {
              const verification = await verifyPaystackPayment(donation.paymentIntentId);
              
              if (verification.status && verification.data.status === 'success') {
                newStatus = 'completed';
                processedAt = new Date();
                providerStatus = 'success';
                providerError = null;
                results.completed++;
              } else {
                newStatus = 'failed';
                providerStatus = 'failed';
                providerError = verification.message || 'Verification failed';
                results.failed++;
              }
            } catch (error) {
              console.error(`Error verifying payment ${donation.id}:`, error);
              newStatus = 'failed';
              providerStatus = 'error';
              providerError = error instanceof Error ? error.message : 'Verification error';
              results.failed++;
            }
          }
        } else if (action === 'complete') {
          newStatus = 'completed';
          processedAt = new Date();
          providerStatus = 'manual_completion';
          providerError = null;
          results.completed++;
        } else if (action === 'fail') {
          newStatus = 'failed';
          providerStatus = 'manual_failure';
          providerError = 'Manually marked as failed';
          results.failed++;
        }

        // Update the donation
        await db
          .update(donations)
          .set({
            paymentStatus: newStatus,
            processedAt,
            lastStatusUpdate: new Date(),
            providerStatus,
            providerError,
          })
          .where(eq(donations.id, donation.id));

        // If completed, update campaign amount
        if (newStatus === 'completed') {
          await updateCampaignAmount(donation.campaignId);
        }

        results.processed++;
        results.details.push({
          donationId: donation.id,
          status: newStatus
        });

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing donation ${donation.id}:`, error);
        results.errors++;
        results.details.push({
          donationId: donation.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} pending payments`,
      ...results
    });

  } catch (error) {
    console.error('Error in bulk processing:', error);
    return NextResponse.json(
      { success: false, error: 'Bulk processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/process-pending-payments - Process pending payments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donationId, action = 'verify', bulk = false, paymentMethod = 'paystack' } = body;

    // Bulk processing mode
    if (bulk) {
      return await processBulkPendingPayments(paymentMethod, action);
    }

    if (!donationId) {
      return NextResponse.json(
        { success: false, error: 'Missing donation ID' },
        { status: 400 }
      );
    }

    // Get the donation
    const donation = await db
      .select()
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation.length) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }

    const donationRecord = donation[0];

    if (donationRecord.paymentStatus !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Donation is not pending' },
        { status: 400 }
      );
    }

    let newStatus = 'pending';
    let processedAt = null;
    let providerStatus = null;
    let providerError = null;

    if (action === 'verify' && donationRecord.paymentMethod === 'paystack' && donationRecord.paymentIntentId) {
      // Verify with Paystack
      try {
        const verification = await verifyPaystackPayment(donationRecord.paymentIntentId);
        
        if (verification.status && verification.data.status === 'success') {
          newStatus = 'completed';
          processedAt = new Date();
          providerStatus = 'success';
          providerError = null;
        } else {
          newStatus = 'failed';
          providerStatus = 'failed';
          providerError = verification.message || 'Verification failed';
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        newStatus = 'failed';
        providerStatus = 'error';
        providerError = error instanceof Error ? error.message : 'Verification error';
      }
    } else if (action === 'complete') {
      // Manually mark as completed
      newStatus = 'completed';
      processedAt = new Date();
      providerStatus = 'manual_completion';
      providerError = null;
    } else if (action === 'fail') {
      // Manually mark as failed
      newStatus = 'failed';
      providerStatus = 'manual_failure';
      providerError = 'Manually marked as failed';
    }

    // Update the donation
    const updateResult = await db
      .update(donations)
      .set({
        paymentStatus: newStatus,
        processedAt,
        lastStatusUpdate: new Date(),
        providerStatus,
        providerError,
      })
      .where(eq(donations.id, donationId))
      .returning();

    // If completed, update campaign amount
    if (newStatus === 'completed') {
      await updateCampaignAmount(donationRecord.campaignId);
    }

    return NextResponse.json({
      success: true,
      data: updateResult[0],
      message: `Donation ${donationId} updated to ${newStatus}`
    });

  } catch (error) {
    console.error('Error processing pending payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
