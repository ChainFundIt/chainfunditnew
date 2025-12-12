import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq, and, sum, lt } from 'drizzle-orm';
import { verifyPaystackPayment } from '@/lib/payments/paystack';
import { checkAndUpdateGoalReached } from '@/lib/utils/campaign-validation';
import { calculateAndDistributeCommissions } from '@/lib/utils/commission-calculation';
import { sendDonorConfirmationEmailById } from '@/lib/notifications/donor-confirmation-email';
import { notifications } from '@/lib/schema/notifications';
import { users } from '@/lib/schema/users';
import { shouldNotifyUserOfDonation, formatDonationNotificationMessage } from '@/lib/utils/donation-notification-utils';

export const runtime = 'nodejs';

/**
 * Helper function to update campaign currentAmount based on completed donations
 */
async function updateCampaignAmount(campaignId: string) {
  try {
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

    await db
      .update(campaigns)
      .set({
        currentAmount: totalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));

    await checkAndUpdateGoalReached(campaignId);
  } catch (error) {
    console.error('Error updating campaign amount:', error);
  }
}

/**
 * POST /api/cron/verify-pending-paystack
 * Cron job to automatically verify pending Paystack payments
 * 
 * This job:
 * - Finds pending Paystack payments older than 5 minutes
 * - Verifies each payment with Paystack API
 * - Updates payment status based on verification result
 * - Updates campaign amounts for completed payments
 * - Sends notifications and emails for completed payments
 * 
 * Should be scheduled to run every hour or more frequently:
 * - Schedule: "0 * * * *" (Every hour at minute 0)
  */
export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const vercelSignature = request.headers.get('x-vercel-signature');
    const netlifySignature = request.headers.get('x-netlify-signature');
    const cronSecret = process.env.CRON_SECRET;
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (!isDevelopment && cronSecret) {
      // Allow if:
      // 1. Authorization header matches CRON_SECRET, OR
      // 2. Vercel signature is present (Vercel Cron), OR
      // 3. Netlify signature is present (Netlify Scheduled Functions)
      if (authHeader !== `Bearer ${cronSecret}` && !vercelSignature && !netlifySignature) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Only verify payments older than 5 minutes to avoid verifying payments that just started
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Get pending Paystack donations older than 5 minutes
    const pendingDonations = await db
      .select()
      .from(donations)
      .where(and(
        eq(donations.paymentStatus, 'pending'),
        eq(donations.paymentMethod, 'paystack'),
        lt(donations.createdAt, fiveMinutesAgo)
      ))
      .orderBy(donations.createdAt);

    if (pendingDonations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending Paystack payments to verify',
        processed: 0,
        completed: 0,
        failed: 0,
        skipped: 0,
        errors: 0,
        timestamp: new Date().toISOString(),
      });
    }

    const results = {
      processed: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
      errors: 0,
      details: [] as Array<{
        donationId: string;
        status: string;
        error?: string;
      }>,
    };

    console.log(`🔄 Starting verification of ${pendingDonations.length} pending Paystack payments...`);

    // Process each donation
    for (let i = 0; i < pendingDonations.length; i++) {
      const donation = pendingDonations[i];
      const progress = `[${i + 1}/${pendingDonations.length}]`;

      // Skip if no payment reference
      if (!donation.paymentIntentId) {
        console.log(`${progress} ⚠️  Skipped donation ${donation.id}: No payment reference`);
        results.skipped++;
        results.details.push({
          donationId: donation.id,
          status: 'skipped',
          error: 'No payment reference'
        });
        continue;
      }

      try {
        console.log(`${progress} Verifying donation ${donation.id} (reference: ${donation.paymentIntentId})...`);

        // Verify payment with Paystack
        const verification = await verifyPaystackPayment(donation.paymentIntentId);

        if (verification.status && verification.data.status === 'success') {
          // Payment was successful - update to completed
          await db
            .update(donations)
            .set({
              paymentStatus: 'completed',
              processedAt: new Date(),
              lastStatusUpdate: new Date(),
              providerStatus: 'success',
              providerError: null,
            })
            .where(eq(donations.id, donation.id));

          // Update campaign amount
          await updateCampaignAmount(donation.campaignId);

          // Check if campaign should be closed due to goal reached
          const campaign = await db
            .select({
              id: campaigns.id,
              creatorId: campaigns.creatorId,
              title: campaigns.title,
              currentAmount: campaigns.currentAmount,
              goalAmount: campaigns.goalAmount,
              currency: campaigns.currency,
              status: campaigns.status
            })
            .from(campaigns)
            .where(eq(campaigns.id, donation.campaignId))
            .limit(1);

          if (campaign.length > 0 && campaign[0].status === 'active') {
            const currentAmount = parseFloat(campaign[0].currentAmount);
            const goalAmount = parseFloat(campaign[0].goalAmount);
            
            // Check if goal reached (using a small threshold to avoid floating point issues)
            if (currentAmount >= goalAmount * 0.99) {
              const { shouldCloseForGoalReached, closeCampaign } = await import('@/lib/utils/campaign-closure');
              if (shouldCloseForGoalReached(currentAmount, goalAmount)) {
                await closeCampaign(campaign[0].id, 'goal_reached', campaign[0].creatorId);
              }
            }
          }

          // Calculate and distribute commissions
          await calculateAndDistributeCommissions(donation.id);

          // Send notifications and emails
          try {
            // Create notification for campaign creator
            const campaign = await db
              .select({ creatorId: campaigns.creatorId })
              .from(campaigns)
              .where(eq(campaigns.id, donation.campaignId))
              .limit(1);

            if (campaign.length > 0) {
              // Check user preferences before creating notification
              const notificationCheck = await shouldNotifyUserOfDonation(
                campaign[0].creatorId,
                donation.amount,
                donation.currency
              );

              if (notificationCheck.shouldNotify) {
                // Format notification message
                const { title, message } = formatDonationNotificationMessage(
                  donation.amount,
                  donation.currency,
                  notificationCheck.isLargeDonation
                );

                // Create notification
                await db.insert(notifications).values({
                  userId: campaign[0].creatorId,
                  type: notificationCheck.isLargeDonation ? 'large_donation_received' : 'donation_received',
                  title,
                  message,
                  metadata: JSON.stringify({
                    donationId: donation.id,
                    campaignId: donation.campaignId,
                    amount: donation.amount,
                    currency: donation.currency,
                    donorId: donation.donorId,
                    isLargeDonation: notificationCheck.isLargeDonation
                  })
                });

                // Send email to campaign creator
                const { sendCampaignDonationEmailById } = await import('@/lib/notifications/campaign-donation-email');
                await sendCampaignDonationEmailById(
                  donation.id,
                  campaign[0].creatorId,
                  notificationCheck.isLargeDonation
                );
              }
            }

            // Send confirmation email to donor
            await sendDonorConfirmationEmailById(donation.id);
          } catch (notificationError) {
            console.error(`Error sending notifications for donation ${donation.id}:`, notificationError);
            // Don't fail the whole process if notifications fail
          }

          console.log(`${progress} ✅ Completed: Payment verified successfully`);
          results.completed++;
          results.processed++;
          results.details.push({
            donationId: donation.id,
            status: 'completed'
          });

        } else {
          // Payment failed or is still pending on Paystack
          const paystackStatus = verification.data?.status || 'unknown';
          const errorMessage = verification.message || 'Payment verification failed';

          await db
            .update(donations)
            .set({
              paymentStatus: 'failed',
              lastStatusUpdate: new Date(),
              providerStatus: 'failed',
              providerError: errorMessage,
            })
            .where(eq(donations.id, donation.id));

          console.log(`${progress} ❌ Failed: ${errorMessage} (Paystack status: ${paystackStatus})`);
          results.failed++;
          results.processed++;
          results.details.push({
            donationId: donation.id,
            status: 'failed',
            error: errorMessage
          });
        }

        // Add delay to avoid rate limiting (200ms between requests)
        if (i < pendingDonations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

      } catch (error) {
        console.error(`${progress} 💥 Error verifying donation ${donation.id}:`, error);
        results.errors++;
        results.processed++;
        results.details.push({
          donationId: donation.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Verification complete: ${results.completed} completed, ${results.failed} failed, ${results.skipped} skipped, ${results.errors} errors`);

    return NextResponse.json({
      success: true,
      message: `Verified ${results.processed} pending Paystack payments`,
      ...results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('💥 Fatal error in verify-pending-paystack cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/verify-pending-paystack
 * Get summary of pending Paystack payments (for monitoring)
 */
export async function GET(request: NextRequest) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const pendingDonations = await db
      .select({
        id: donations.id,
        paymentIntentId: donations.paymentIntentId,
        amount: donations.amount,
        currency: donations.currency,
        createdAt: donations.createdAt,
      })
      .from(donations)
      .where(and(
        eq(donations.paymentStatus, 'pending'),
        eq(donations.paymentMethod, 'paystack'),
        lt(donations.createdAt, fiveMinutesAgo)
      ))
      .orderBy(donations.createdAt);

    const now = Date.now();
    const stats = {
      total: pendingDonations.length,
      withReference: pendingDonations.filter(d => d.paymentIntentId).length,
      withoutReference: pendingDonations.filter(d => !d.paymentIntentId).length,
      byAge: {
        lessThan1Hour: 0,
        oneTo24Hours: 0,
        moreThan24Hours: 0,
      }
    };

    pendingDonations.forEach(donation => {
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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

