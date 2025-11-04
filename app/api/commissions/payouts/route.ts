import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { commissionPayouts, chainers, campaigns, users } from '@/lib/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * GET /api/commissions/payouts
 * Get commission payouts for the authenticated ambassador
 */
export async function GET(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's chainer record
    const chainer = await db
      .select({ id: chainers.id })
      .from(chainers)
      .where(eq(chainers.userId, user[0].id))
      .limit(1);

    if (!chainer.length) {
      // User is not an ambassador
      return NextResponse.json({
        success: true,
        data: {
          payouts: [],
          summary: {
            totalPending: 0,
            totalCompleted: 0,
            totalFailed: 0,
            totalAmount: 0,
          },
        },
      });
    }

    const chainerId = chainer[0].id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions
    const whereConditions = [eq(commissionPayouts.chainerId, chainerId)];
    if (status) {
      whereConditions.push(eq(commissionPayouts.status, status));
    }

    // Get commission payouts with campaign details
    const payouts = await db
      .select({
        id: commissionPayouts.id,
        campaignId: commissionPayouts.campaignId,
        amount: commissionPayouts.amount,
        currency: commissionPayouts.currency,
        destination: commissionPayouts.destination,
        destinationCampaignId: commissionPayouts.destinationCampaignId,
        status: commissionPayouts.status,
        transactionId: commissionPayouts.transactionId,
        notes: commissionPayouts.notes,
        createdAt: commissionPayouts.createdAt,
        processedAt: commissionPayouts.processedAt,
        campaignTitle: campaigns.title,
        campaignCurrency: campaigns.currency,
      })
      .from(commissionPayouts)
      .leftJoin(campaigns, eq(commissionPayouts.campaignId, campaigns.id))
      .where(and(...whereConditions))
      .orderBy(desc(commissionPayouts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get summary statistics
    const summary = await db
      .select({
        totalPending: sql<number>`COALESCE(SUM(CASE WHEN ${commissionPayouts.status} = 'pending' THEN ${commissionPayouts.amount}::numeric ELSE 0 END), 0)`,
        totalCompleted: sql<number>`COALESCE(SUM(CASE WHEN ${commissionPayouts.status} = 'completed' THEN ${commissionPayouts.amount}::numeric ELSE 0 END), 0)`,
        totalFailed: sql<number>`COALESCE(SUM(CASE WHEN ${commissionPayouts.status} = 'failed' THEN ${commissionPayouts.amount}::numeric ELSE 0 END), 0)`,
        totalAmount: sql<number>`COALESCE(SUM(${commissionPayouts.amount}::numeric), 0)`,
      })
      .from(commissionPayouts)
      .where(eq(commissionPayouts.chainerId, chainerId));

    const summaryData = summary[0];

    return NextResponse.json({
      success: true,
      data: {
        payouts: payouts.map(p => ({
          id: p.id,
          campaignId: p.campaignId,
          campaignTitle: p.campaignTitle,
          amount: parseFloat(p.amount),
          currency: p.currency || 'USD',
          destination: p.destination,
          destinationCampaignId: p.destinationCampaignId,
          status: p.status,
          transactionId: p.transactionId,
          notes: p.notes,
          createdAt: p.createdAt,
          processedAt: p.processedAt,
        })),
        summary: {
          totalPending: parseFloat(summaryData.totalPending.toString()),
          totalCompleted: parseFloat(summaryData.totalCompleted.toString()),
          totalFailed: parseFloat(summaryData.totalFailed.toString()),
          totalAmount: parseFloat(summaryData.totalAmount.toString()),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching commission payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commission payouts' },
      { status: 500 }
    );
  }
}

