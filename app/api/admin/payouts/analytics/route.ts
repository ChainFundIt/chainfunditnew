import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaignPayouts } from '@/lib/schema';
import { eq, and, gte, lte, sql, sum, count } from 'drizzle-orm';
import { getAdminUser } from '@/lib/admin-auth';

/**
 * GET /api/admin/payouts/analytics
 * Get payout analytics and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');

    // Build date filter
    const dateFilter = [];
    if (startDate) {
      dateFilter.push(gte(campaignPayouts.createdAt, new Date(startDate)));
    }
    if (endDate) {
      dateFilter.push(lte(campaignPayouts.createdAt, new Date(endDate)));
    }

    // Build status filter
    const statusFilter = status ? eq(campaignPayouts.status, status) : undefined;
    
    // Build provider filter
    const providerFilter = provider ? eq(campaignPayouts.payoutProvider, provider) : undefined;

    // Combine filters
    const filters = [and(...dateFilter, statusFilter, providerFilter)].filter(Boolean);

    // Get total statistics
    const [totalStats] = await db
      .select({
        totalPayouts: count(),
        totalAmount: sum(sql`CAST(${campaignPayouts.requestedAmount} AS NUMERIC)`),
        totalFees: sum(sql`CAST(${campaignPayouts.fees} AS NUMERIC)`),
        totalNetAmount: sum(sql`CAST(${campaignPayouts.netAmount} AS NUMERIC)`),
      })
      .from(campaignPayouts)
      .where(filters.length > 0 ? and(...filters) : undefined);

    // Get status breakdown
    const statusBreakdown = await db
      .select({
        status: campaignPayouts.status,
        count: count(),
        totalAmount: sum(sql`CAST(${campaignPayouts.requestedAmount} AS NUMERIC)`),
      })
      .from(campaignPayouts)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .groupBy(campaignPayouts.status);

    // Get provider breakdown
    const providerBreakdown = await db
      .select({
        provider: campaignPayouts.payoutProvider,
        count: count(),
        totalAmount: sum(sql`CAST(${campaignPayouts.requestedAmount} AS NUMERIC)`),
      })
      .from(campaignPayouts)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .groupBy(campaignPayouts.payoutProvider);

    // Get currency breakdown
    const currencyBreakdown = await db
      .select({
        currency: campaignPayouts.currency,
        count: count(),
        totalAmount: sum(sql`CAST(${campaignPayouts.requestedAmount} AS NUMERIC)`),
      })
      .from(campaignPayouts)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .groupBy(campaignPayouts.currency);

    // Get recent payouts
    const recentPayouts = await db
      .select({
        id: campaignPayouts.id,
        requestedAmount: campaignPayouts.requestedAmount,
        netAmount: campaignPayouts.netAmount,
        fees: campaignPayouts.fees,
        status: campaignPayouts.status,
        currency: campaignPayouts.currency,
        payoutProvider: campaignPayouts.payoutProvider,
        createdAt: campaignPayouts.createdAt,
        processedAt: campaignPayouts.processedAt,
      })
      .from(campaignPayouts)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(sql`${campaignPayouts.createdAt} DESC`)
      .limit(50);

    return NextResponse.json({
      success: true,
      data: {
        total: {
          payouts: Number(totalStats.totalPayouts) || 0,
          requestedAmount: Number(totalStats.totalAmount) || 0,
          fees: Number(totalStats.totalFees) || 0,
          netAmount: Number(totalStats.totalNetAmount) || 0,
        },
        breakdown: {
          byStatus: statusBreakdown.map(s => ({
            status: s.status,
            count: Number(s.count) || 0,
            totalAmount: Number(s.totalAmount) || 0,
          })),
          byProvider: providerBreakdown.map(p => ({
            provider: p.provider,
            count: Number(p.count) || 0,
            totalAmount: Number(p.totalAmount) || 0,
          })),
          byCurrency: currencyBreakdown.map(c => ({
            currency: c.currency,
            count: Number(c.count) || 0,
            totalAmount: Number(c.totalAmount) || 0,
          })),
        },
        recent: recentPayouts.map(p => ({
          id: p.id,
          requestedAmount: Number(p.requestedAmount) || 0,
          netAmount: Number(p.netAmount) || 0,
          fees: Number(p.fees) || 0,
          status: p.status,
          currency: p.currency,
          provider: p.payoutProvider,
          createdAt: p.createdAt,
          processedAt: p.processedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching payout analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

