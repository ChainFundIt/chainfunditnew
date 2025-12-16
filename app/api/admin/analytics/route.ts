import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, campaigns, donations, chainers, commissionPayouts } from '@/lib/schema';
import { eq, gte, count, sum, sql, desc, and } from 'drizzle-orm';
import { convertFromNaira, convertToNaira } from '@/lib/utils/currency-conversion';

/**
 * GET /api/admin/analytics
 * Get comprehensive platform analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const displayCurrency = (searchParams.get('currency') || 'USD').toUpperCase();

    const normalizeAmount = (value: number) =>
      Number.isFinite(value) ? Number(value.toFixed(2)) : 0;

    const convertCurrencySync = (amount: number, fromCurrency: string, toCurrency: string) => {
      const from = (fromCurrency || 'USD').toUpperCase();
      const to = (toCurrency || 'USD').toUpperCase();
      if (from === to) return amount;
      const amountInNGN = convertToNaira(amount, from);
      return convertFromNaira(amountInNGN, to);
    };

    // Calculate date range
    const getDateRange = (range: string) => {
      const now = new Date();
      switch (range) {
        case '7d':
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case '90d':
          return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case '1y':
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    };

    const startDate = getDateRange(range);

    // Overview metrics
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalCampaigns] = await db.select({ count: count() }).from(campaigns);
    const [totalDonations] = await db
      .select({ count: count() })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));
    const [totalChainers] = await db.select({ count: count() }).from(chainers);
    const [totalPayouts] = await db.select({ count: count() }).from(commissionPayouts);

    const donationTotalsByCurrency = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));

    // Total raised across all donations, converted to requested display currency
    const donationTotalsForConversion = await db
      .select({
        currency: donations.currency,
        totalAmount: sum(donations.amount),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'))
      .groupBy(donations.currency);

    const totalAmountConverted = normalizeAmount(
      donationTotalsForConversion.reduce((acc, row) => {
        const amount = Number(row.totalAmount || 0);
        return acc + convertCurrencySync(amount, row.currency, displayCurrency);
      }, 0)
    );

    // Platform revenue is the platform fee accrued at donation time, not payout time.
    // Fee formula intentionally matches app/api/payouts/route.ts:
    // - stripe: 2.5% + 0.30 (per donation)
    // - paystack: 1.5%
    // - default: 2.0%
    const donationFeeGroups = await db
      .select({
        paymentMethod: donations.paymentMethod,
        currency: donations.currency,
        donationCount: count(),
        totalAmount: sum(donations.amount),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'))
      .groupBy(donations.paymentMethod, donations.currency);

    const platformRevenueConverted = normalizeAmount(
      donationFeeGroups.reduce((acc, row) => {
        const method = (row.paymentMethod || '').toLowerCase();
        const feeRate =
          method === 'stripe' ? 0.025 : method === 'paystack' ? 0.015 : 0.02;
        const fixedFee = method === 'stripe' ? 0.3 : 0;

        const gross = Number(row.totalAmount || 0);
        const txCount = Number(row.donationCount || 0);
        const feeInDonationCurrency = gross * feeRate + txCount * fixedFee;

        return (
          acc +
          convertCurrencySync(feeInDonationCurrency, row.currency, displayCurrency)
        );
      }, 0)
    );

    const [averageDonation] = await db
      .select({ average: sql<number>`AVG(${donations.amount})` })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));
    const averageDonationConverted = normalizeAmount(
      totalDonations.count > 0 ? totalAmountConverted / totalDonations.count : 0
    );

    // Growth data
    const userGrowth = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE_TRUNC('month', ${users.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${users.createdAt})`);

    const campaignGrowth = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${campaigns.createdAt})`,
        count: count(),
      })
      .from(campaigns)
      .where(gte(campaigns.createdAt, startDate))
      .groupBy(sql`DATE_TRUNC('month', ${campaigns.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${campaigns.createdAt})`);

    const donationGrowthRaw = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${donations.createdAt})`,
        currency: donations.currency,
        count: count(),
        amount: sum(donations.amount),
      })
      .from(donations)
      .where(and(
        gte(donations.createdAt, startDate),
        eq(donations.paymentStatus, 'completed')
      ))
      .groupBy(sql`DATE_TRUNC('month', ${donations.createdAt})`, donations.currency)
      .orderBy(sql`DATE_TRUNC('month', ${donations.createdAt})`);

    // Aggregate donation growth into display currency per month
    const donationGrowthByMonth = new Map<
      string,
      { month: string; count: number; amount: number }
    >();

    for (const row of donationGrowthRaw) {
      const monthKey = String(row.month);
      const existing = donationGrowthByMonth.get(monthKey) || {
        month: monthKey,
        count: 0,
        amount: 0,
      };

      const amount = Number(row.amount || 0);
      existing.count += Number(row.count || 0);
      existing.amount = normalizeAmount(
        existing.amount + convertCurrencySync(amount, row.currency, displayCurrency)
      );

      donationGrowthByMonth.set(monthKey, existing);
    }

    const donationGrowth = Array.from(donationGrowthByMonth.values()).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    // Platform revenue by campaign (within selected range), calculated at donation time
    const campaignRevenueGroups = await db
      .select({
        campaignId: donations.campaignId,
        campaignTitle: campaigns.title,
        paymentMethod: donations.paymentMethod,
        currency: donations.currency,
        donationCount: count(),
        totalAmount: sum(donations.amount),
      })
      .from(donations)
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .where(
        and(gte(donations.createdAt, startDate), eq(donations.paymentStatus, 'completed'))
      )
      .groupBy(
        donations.campaignId,
        campaigns.title,
        donations.paymentMethod,
        donations.currency
      );

    const campaignRevenueById = new Map<
      string,
      {
        id: string;
        title: string;
        donations: number;
        raised: number; // total donation amount converted into display currency
        platformRevenue: number; // fees converted into display currency
      }
    >();

    for (const row of campaignRevenueGroups) {
      const campaignId = String(row.campaignId);
      const existing = campaignRevenueById.get(campaignId) || {
        id: campaignId,
        title: row.campaignTitle || 'Unknown',
        donations: 0,
        raised: 0,
        platformRevenue: 0,
      };

      const method = (row.paymentMethod || '').toLowerCase();
      const feeRate =
        method === 'stripe' ? 0.025 : method === 'paystack' ? 0.015 : 0.02;
      const fixedFee = method === 'stripe' ? 0.3 : 0;

      const gross = Number(row.totalAmount || 0);
      const txCount = Number(row.donationCount || 0);
      const feeInDonationCurrency = gross * feeRate + txCount * fixedFee;

      existing.donations += txCount;
      existing.raised = normalizeAmount(
        existing.raised + convertCurrencySync(gross, row.currency, displayCurrency)
      );
      existing.platformRevenue = normalizeAmount(
        existing.platformRevenue +
          convertCurrencySync(feeInDonationCurrency, row.currency, displayCurrency)
      );

      campaignRevenueById.set(campaignId, existing);
    }

    const campaignRevenue = Array.from(campaignRevenueById.values()).sort(
      (a, b) => b.platformRevenue - a.platformRevenue
    );

    // Top performing campaigns
    const topCampaigns = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        currency: campaigns.currency,
        amount: campaigns.currentAmount,
        donations: sql<number>`(
          SELECT COUNT(*) FROM ${donations} 
          WHERE ${donations.campaignId} = ${campaigns.id} 
          AND ${donations.paymentStatus} = 'completed'
        )`,
        chainers: sql<number>`(
          SELECT COUNT(*) FROM ${chainers} 
          WHERE ${chainers.campaignId} = ${campaigns.id}
        )`,
      })
      .from(campaigns)
      .orderBy(desc(campaigns.currentAmount))
      .limit(10);

    // Top performing chainers
    const topChainers = await db
      .select({
        id: chainers.id,
        name: sql<string>`(
          SELECT ${users.fullName} FROM ${users} 
          WHERE ${users.id} = ${chainers.userId}
        )`,
        currency: sql<string>`(
          SELECT ${campaigns.currency} FROM ${campaigns}
          WHERE ${campaigns.id} = ${chainers.campaignId}
        )`,
        referrals: chainers.totalReferrals,
        raised: chainers.totalRaised,
        commission: chainers.commissionEarned,
      })
      .from(chainers)
      .orderBy(desc(chainers.commissionEarned))
      .limit(10);

    // Top donors
    const topDonorsRaw = await db
      .select({
        id: donations.donorId,
        name: users.fullName,
        currency: donations.currency,
        totalDonated: sum(donations.amount),
        donationCount: count(),
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .where(eq(donations.paymentStatus, 'completed'))
      .groupBy(donations.donorId, users.fullName, donations.currency)
      .orderBy(desc(sum(donations.amount)))
      .limit(200);

    const topDonorsById = new Map<
      string,
      { id: string; name: string; totalDonated: number; donationCount: number }
    >();

    for (const row of topDonorsRaw) {
      const id = String(row.id);
      const existing = topDonorsById.get(id) || {
        id,
        name: row.name || 'Unknown',
        totalDonated: 0,
        donationCount: 0,
      };

      const amount = Number(row.totalDonated || 0);
      existing.totalDonated = normalizeAmount(
        existing.totalDonated +
          convertCurrencySync(amount, row.currency, displayCurrency)
      );
      existing.donationCount += Number(row.donationCount || 0);

      topDonorsById.set(id, existing);
    }

    const topDonors = Array.from(topDonorsById.values())
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, 10);

    // Conversion rates
    const [donationToChainerRate] = await db
      .select({
        rate: sql<number>`(
          SELECT COUNT(*)::float / (SELECT COUNT(*) FROM ${donations} WHERE ${donations.paymentStatus} = 'completed')::float * 100
          FROM ${chainers}
        )`,
      })
      .from(chainers);

    // Currency distribution
    const currencyDistribution = await db
      .select({
        currency: donations.currency,
        amount: sum(donations.amount),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'))
      .groupBy(donations.currency);

    const totalCurrencyAmount = currencyDistribution.reduce((sum, curr) => sum + Number(curr.amount || 0), 0);

    const revenueByCurrency = currencyDistribution.map(currency => ({
      currency: currency.currency,
      amount: Number(currency.amount || 0),
      percentage: totalCurrencyAmount > 0 ? Math.round((Number(currency.amount || 0) / totalCurrencyAmount) * 100) : 0,
    }));

    // Donations by status
    const donationsByStatus = await db
      .select({
        status: donations.paymentStatus,
        count: count(),
      })
      .from(donations)
      .groupBy(donations.paymentStatus);

    const totalDonationsCount = donationsByStatus.reduce((sum, status) => sum + status.count, 0);

    const donationsByStatusWithPercentage = donationsByStatus.map(status => ({
      status: status.status,
      count: status.count,
      percentage: totalDonationsCount > 0 ? Math.round((status.count / totalDonationsCount) * 100) : 0,
    }));

    // Campaigns by status
    const campaignsByStatus = await db
      .select({
        status: campaigns.status,
        count: count(),
      })
      .from(campaigns)
      .groupBy(campaigns.status);

    const totalCampaignsCount = campaignsByStatus.reduce((sum, status) => sum + status.count, 0);

    const campaignsByStatusWithPercentage = campaignsByStatus.map(status => ({
      status: status.status,
      count: status.count,
      percentage: totalCampaignsCount > 0 ? Math.round((status.count / totalCampaignsCount) * 100) : 0,
    }));

    // User activity by hour (simplified)
    const userActivity = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activeUsers: Math.floor(Math.random() * 100) + 10, // Mock data
    }));

    const analytics = {
      overview: {
        totalUsers: totalUsers.count,
        totalCampaigns: totalCampaigns.count,
        totalDonations: totalDonations.count,
        totalAmount: totalAmountConverted,
        totalChainers: totalChainers.count,
        totalPayouts: totalPayouts.count,
        platformRevenue: platformRevenueConverted,
        averageDonation: averageDonationConverted,
      },
      growth: {
        userGrowth,
        campaignGrowth,
        donationGrowth,
        revenueGrowth: donationGrowth.map(d => ({ month: d.month, amount: Number(d.amount || 0) })),
      },
      performance: {
        campaignRevenue,
        topCampaigns: topCampaigns.map(c => ({
          id: c.id,
          title: c.title,
          amount: normalizeAmount(
            convertCurrencySync(Number(c.amount || 0), c.currency, displayCurrency)
          ),
          donations: c.donations,
          chainers: c.chainers,
        })),
        topChainers: topChainers.map(c => ({
          id: c.id,
          name: c.name || 'Unknown',
          referrals: c.referrals,
          raised: normalizeAmount(
            convertCurrencySync(Number(c.raised || 0), c.currency || 'USD', displayCurrency)
          ),
          commission: normalizeAmount(
            convertCurrencySync(Number(c.commission || 0), c.currency || 'USD', displayCurrency)
          ),
        })),
        topDonors,
      },
      metrics: {
        conversionRates: {
          donationToChainer: Number(donationToChainerRate?.rate || 0),
          clickToDonation: 15.2, // Mock data
          campaignSuccess: 78.5, // Mock data
        },
        engagement: {
          averageSessionTime: 4.2, // Mock data
          bounceRate: 35.8, // Mock data
          returnVisitorRate: 42.1, // Mock data
        },
        fraud: {
          fraudScore: 12.3, // Mock data
          suspiciousTransactions: 23, // Mock data
          blockedAttempts: 8, // Mock data
        },
      },
      charts: {
        revenueByCurrency,
        donationsByStatus: donationsByStatusWithPercentage,
        campaignsByStatus: campaignsByStatusWithPercentage,
        userActivity,
      },
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
