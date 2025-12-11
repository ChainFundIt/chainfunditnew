import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema';
import { eq, and, inArray, isNotNull, gte } from 'drizzle-orm';
import { verifyPaystackPayment } from '@/lib/payments/paystack';
import { updateCampaignAmount } from '@/lib/utils/campaign-amount';

/**
 * POST /api/admin/donations/fix-failed
 * Re-verify failed Paystack donations that may have been incorrectly marked as failed
 * due to API authentication errors. This endpoint:
 * 1. Finds failed donations with Paystack paymentIntentId
 * 2. Re-verifies them with Paystack
 * 3. Updates status to completed if verification succeeds
 * 4. Updates campaign amounts accordingly
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      donationIds, // Optional: specific donation IDs to fix
      paymentMethod = 'paystack',
      dryRun = false // If true, only returns what would be fixed without making changes
    } = body;

    // Build where condition
    let whereCondition;
    if (donationIds && Array.isArray(donationIds) && donationIds.length > 0) {
      // Fix specific donations
      whereCondition = and(
        eq(donations.paymentStatus, 'failed'),
        eq(donations.paymentMethod, paymentMethod),
        inArray(donations.id, donationIds)
      );
    } else {
      // Fix all failed Paystack donations that have a paymentIntentId
      // Focus on recent ones (last 7 days) to avoid processing very old donations
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      whereCondition = and(
        eq(donations.paymentStatus, 'failed'),
        eq(donations.paymentMethod, paymentMethod),
        isNotNull(donations.paymentIntentId),
        gte(donations.createdAt, sevenDaysAgo)
      );
    }

    // Get failed donations
    const failedDonations = await db
      .select({
        id: donations.id,
        campaignId: donations.campaignId,
        amount: donations.amount,
        currency: donations.currency,
        paymentIntentId: donations.paymentIntentId,
        paymentMethod: donations.paymentMethod,
        providerStatus: donations.providerStatus,
        providerError: donations.providerError,
        createdAt: donations.createdAt,
      })
      .from(donations)
      .where(whereCondition)
      .limit(100); // Limit to 100 at a time to avoid timeouts

    if (failedDonations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No failed donations found to verify',
        fixed: 0,
        stillFailed: 0,
        errors: 0,
        details: []
      });
    }

    const results = {
      fixed: 0,
      stillFailed: 0,
      errors: 0,
      authErrors: 0,
      details: [] as Array<{
        donationId: string;
        reference: string;
        status: string;
        error?: string;
      }>
    };

    // Process each donation
    for (const donation of failedDonations) {
      if (!donation.paymentIntentId) {
        results.stillFailed++;
        results.details.push({
          donationId: donation.id,
          reference: 'N/A',
          status: 'skipped',
          error: 'No payment reference found'
        });
        continue;
      }

      try {
        if (dryRun) {
          // In dry run mode, just check what would happen
          results.details.push({
            donationId: donation.id,
            reference: donation.paymentIntentId,
            status: 'would_verify',
            error: 'Dry run - would verify with Paystack'
          });
          continue;
        }

        // Re-verify with Paystack
        const verification = await verifyPaystackPayment(donation.paymentIntentId);
        
        if (verification.status && verification.data.status === 'success') {
          // Payment was actually successful - fix the status
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

          results.fixed++;
          results.details.push({
            donationId: donation.id,
            reference: donation.paymentIntentId,
            status: 'fixed',
          });
        } else {
          // Payment is actually failed on Paystack's side
          results.stillFailed++;
          results.details.push({
            donationId: donation.id,
            reference: donation.paymentIntentId,
            status: 'still_failed',
            error: verification.message || 'Payment verification failed'
          });
        }
      } catch (error: any) {
        // Check if this is an authentication error
        const isAuthError = error?.response?.status === 401 || 
                            error?.response?.data?.code === 'invalid_Key' ||
                            error?.message?.includes('Invalid key') ||
                            error?.message?.includes('authentication failed');
        
        if (isAuthError) {
          results.authErrors++;
          results.errors++;
          results.details.push({
            donationId: donation.id,
            reference: donation.paymentIntentId || 'N/A',
            status: 'auth_error',
            error: 'Paystack API authentication failed - cannot verify. Please check API key configuration.'
          });
        } else {
          results.errors++;
          results.details.push({
            donationId: donation.id,
            reference: donation.paymentIntentId || 'N/A',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown verification error'
          });
        }
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return NextResponse.json({
      success: true,
      message: dryRun 
        ? `Dry run: Would verify ${failedDonations.length} failed donation(s)`
        : `Fixed ${results.fixed} donation(s), ${results.stillFailed} still failed, ${results.errors} errors`,
      ...results,
      totalProcessed: failedDonations.length
    });

  } catch (error) {
    console.error('Error fixing failed donations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fix donations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/donations/fix-failed
 * Get list of failed donations that can be fixed (have paymentIntentId)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentMethod = searchParams.get('paymentMethod') || 'paystack';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get failed donations with payment references
    const failedDonations = await db
      .select({
        id: donations.id,
        campaignId: donations.campaignId,
        amount: donations.amount,
        currency: donations.currency,
        paymentIntentId: donations.paymentIntentId,
        paymentMethod: donations.paymentMethod,
        providerStatus: donations.providerStatus,
        providerError: donations.providerError,
        createdAt: donations.createdAt,
      })
      .from(donations)
      .where(and(
        eq(donations.paymentStatus, 'failed'),
        eq(donations.paymentMethod, paymentMethod),
        isNotNull(donations.paymentIntentId)
      ))
      .orderBy(donations.createdAt)
      .limit(limit);

    return NextResponse.json({
      success: true,
      count: failedDonations.length,
      donations: failedDonations,
      message: `Found ${failedDonations.length} failed donation(s) with payment references`
    });

  } catch (error) {
    console.error('Error fetching failed donations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch failed donations' },
      { status: 500 }
    );
  }
}
