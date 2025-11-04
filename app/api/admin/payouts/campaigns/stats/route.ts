import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaignPayouts } from '@/lib/schema';
import { eq, count, sum, sql } from 'drizzle-orm';
import { convertToNaira } from '@/lib/utils/currency-conversion';
import { getCurrencyCode } from '@/lib/utils/currency';

/**
 * GET /api/admin/payouts/campaigns/stats
 * Get campaign creator payout statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get basic payout counts
    const [totalPayouts] = await db.select({ count: count() }).from(campaignPayouts);
    
    const [pendingPayouts] = await db
      .select({ count: count() })
      .from(campaignPayouts)
      .where(eq(campaignPayouts.status, 'pending'));

    const [approvedPayouts] = await db
      .select({ count: count() })
      .from(campaignPayouts)
      .where(eq(campaignPayouts.status, 'approved'));

    const [completedPayouts] = await db
      .select({ count: count() })
      .from(campaignPayouts)
      .where(eq(campaignPayouts.status, 'completed'));

    const [rejectedPayouts] = await db
      .select({ count: count() })
      .from(campaignPayouts)
      .where(eq(campaignPayouts.status, 'rejected'));

    // Get all payouts with their currencies for proper conversion
    const allPayouts = await db
      .select({
        requestedAmount: campaignPayouts.requestedAmount,
        netAmount: campaignPayouts.netAmount,
        currency: campaignPayouts.currency,
        status: campaignPayouts.status,
      })
      .from(campaignPayouts);

    // Convert all amounts to NGN before summing
    let totalAmount = 0;
    let pendingAmount = 0;
    let approvedAmount = 0;
    let paidAmount = 0;

    allPayouts.forEach(payout => {
      const currency = getCurrencyCode(payout.currency || 'USD');
      const requestedAmount = parseFloat(payout.requestedAmount || '0');
      const netAmount = parseFloat(payout.netAmount || '0');
      const status = payout.status;

      // Convert requested amount to NGN
      const requestedAmountInNGN = convertToNaira(requestedAmount, currency);
      totalAmount += requestedAmountInNGN;

      if (status === 'pending') {
        pendingAmount += requestedAmountInNGN;
      } else if (status === 'approved') {
        approvedAmount += requestedAmountInNGN;
      } else if (status === 'completed') {
        // For completed payouts, use net amount
        const netAmountInNGN = convertToNaira(netAmount, currency);
        paidAmount += netAmountInNGN;
      }
    });

    const stats = {
      totalPayouts: totalPayouts.count,
      pendingPayouts: pendingPayouts.count,
      approvedPayouts: approvedPayouts.count,
      completedPayouts: completedPayouts.count,
      rejectedPayouts: rejectedPayouts.count,
      totalAmount,
      pendingAmount,
      approvedAmount,
      paidAmount,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching campaign creator payout stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign creator payout statistics' },
      { status: 500 }
    );
  }
}

