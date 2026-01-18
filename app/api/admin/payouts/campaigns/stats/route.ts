import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaignPayouts } from '@/lib/schema';
import { eq, count, sum, sql } from 'drizzle-orm';

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

    // Get all payouts with their currencies
    const allPayouts = await db
      .select({
        requestedAmount: campaignPayouts.requestedAmount,
        netAmount: campaignPayouts.netAmount,
        currency: campaignPayouts.currency,
        status: campaignPayouts.status,
      })
      .from(campaignPayouts);

    const totalsByCurrency = new Map<string, number>();
    const pendingByCurrency = new Map<string, number>();
    const approvedByCurrency = new Map<string, number>();
    const paidByCurrency = new Map<string, number>();

    let totalAmount = 0;
    let pendingAmount = 0;
    let approvedAmount = 0;
    let paidAmount = 0;

    allPayouts.forEach((payout) => {
      const currency = (payout.currency || 'USD').toUpperCase();
      const requestedAmount = parseFloat(payout.requestedAmount || '0');
      const netAmount = parseFloat(payout.netAmount || '0');
      const status = payout.status;

      totalAmount += requestedAmount;
      totalsByCurrency.set(
        currency,
        (totalsByCurrency.get(currency) || 0) + requestedAmount
      );

      if (status === 'pending') {
        pendingAmount += requestedAmount;
        pendingByCurrency.set(
          currency,
          (pendingByCurrency.get(currency) || 0) + requestedAmount
        );
      } else if (status === 'approved') {
        approvedAmount += requestedAmount;
        approvedByCurrency.set(
          currency,
          (approvedByCurrency.get(currency) || 0) + requestedAmount
        );
      } else if (status === 'completed') {
        paidAmount += netAmount;
        paidByCurrency.set(
          currency,
          (paidByCurrency.get(currency) || 0) + netAmount
        );
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
      totalAmountByCurrency: Array.from(totalsByCurrency.entries()).map(
        ([currency, amount]) => ({ currency, amount })
      ),
      pendingAmountByCurrency: Array.from(pendingByCurrency.entries()).map(
        ([currency, amount]) => ({ currency, amount })
      ),
      approvedAmountByCurrency: Array.from(approvedByCurrency.entries()).map(
        ([currency, amount]) => ({ currency, amount })
      ),
      paidAmountByCurrency: Array.from(paidByCurrency.entries()).map(
        ([currency, amount]) => ({ currency, amount })
      ),
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

