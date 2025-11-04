import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  campaignPayouts,
  commissionPayouts,
  chainers,
  campaigns,
  users,
} from '@/lib/schema';
import { eq, and, desc, or, sql } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * GET /api/payouts/history
 * Get combined payout history for the authenticated user (campaign payouts + commission payouts)
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

    const userId = user[0].id;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'campaign' | 'commission' | 'all'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get campaign payouts
    const campaignPayoutsWhere = [eq(campaignPayouts.userId, userId)];
    if (status && status !== 'all') {
      campaignPayoutsWhere.push(eq(campaignPayouts.status, status));
    }

    const campaignPayoutsList = await db
      .select({
        id: campaignPayouts.id,
        type: sql<string>`'campaign'`,
        campaignId: campaignPayouts.campaignId,
        campaignTitle: campaigns.title,
        amount: campaignPayouts.requestedAmount,
        netAmount: campaignPayouts.netAmount,
        fees: campaignPayouts.fees,
        currency: campaignPayouts.currency,
        status: campaignPayouts.status,
        payoutProvider: campaignPayouts.payoutProvider,
        reference: campaignPayouts.reference,
        transactionId: campaignPayouts.transactionId,
        createdAt: campaignPayouts.createdAt,
        processedAt: campaignPayouts.processedAt,
        rejectionReason: campaignPayouts.rejectionReason,
        failureReason: campaignPayouts.failureReason,
      })
      .from(campaignPayouts)
      .leftJoin(campaigns, eq(campaignPayouts.campaignId, campaigns.id))
      .where(and(...campaignPayoutsWhere))
      .orderBy(desc(campaignPayouts.createdAt));

    // Get commission payouts (if user is an ambassador)
    const chainer = await db
      .select({ id: chainers.id })
      .from(chainers)
      .where(eq(chainers.userId, userId))
      .limit(1);

    let commissionPayoutsList: any[] = [];
    if (chainer.length) {
      const commissionWhere = [eq(commissionPayouts.chainerId, chainer[0].id)];
      if (status && status !== 'all') {
        commissionWhere.push(eq(commissionPayouts.status, status));
      }

      commissionPayoutsList = await db
        .select({
          id: commissionPayouts.id,
          type: sql<string>`'commission'`,
          campaignId: commissionPayouts.campaignId,
          campaignTitle: campaigns.title,
          amount: commissionPayouts.amount,
          netAmount: commissionPayouts.amount,
          fees: sql<string>`'0'`,
          currency: commissionPayouts.currency,
          status: commissionPayouts.status,
          payoutProvider: sql<string | null>`NULL`,
          reference: sql<string | null>`NULL`,
          transactionId: commissionPayouts.transactionId,
          createdAt: commissionPayouts.createdAt,
          processedAt: commissionPayouts.processedAt,
          rejectionReason: sql<string | null>`NULL`,
          failureReason: sql<string | null>`NULL`,
        })
        .from(commissionPayouts)
        .leftJoin(campaigns, eq(commissionPayouts.campaignId, campaigns.id))
        .where(and(...commissionWhere))
        .orderBy(desc(commissionPayouts.createdAt));
    }

    // Combine and sort all payouts
    let allPayouts = [
      ...campaignPayoutsList.map(p => ({ ...p, type: 'campaign' })),
      ...commissionPayoutsList.map(p => ({ ...p, type: 'commission' })),
    ];

    // Filter by type if specified
    if (type && type !== 'all') {
      allPayouts = allPayouts.filter(p => p.type === type);
    }

    // Sort by created date (most recent first)
    allPayouts.sort((a, b) => {
      const dateA = new Date(a.createdAt as string).getTime();
      const dateB = new Date(b.createdAt as string).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const paginatedPayouts = allPayouts.slice(offset, offset + limit);

    // Calculate summary statistics
    const summary = {
      total: allPayouts.length,
      pending: allPayouts.filter(p => p.status === 'pending').length,
      completed: allPayouts.filter(p => p.status === 'completed').length,
      failed: allPayouts.filter(p => p.status === 'failed').length,
      rejected: allPayouts.filter(p => p.status === 'rejected').length,
      totalAmount: allPayouts.reduce((sum, p) => {
        const amount = parseFloat(p.amount?.toString() || '0');
        return sum + amount;
      }, 0),
      totalNetAmount: allPayouts.reduce((sum, p) => {
        const amount = parseFloat(p.netAmount?.toString() || '0');
        return sum + amount;
      }, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        payouts: paginatedPayouts.map(p => ({
          id: p.id,
          type: p.type,
          campaignId: p.campaignId,
          campaignTitle: p.campaignTitle,
          amount: parseFloat(p.amount?.toString() || '0'),
          netAmount: parseFloat(p.netAmount?.toString() || '0'),
          fees: parseFloat(p.fees?.toString() || '0'),
          currency: p.currency || 'USD',
          status: p.status,
          payoutProvider: p.payoutProvider,
          reference: p.reference,
          transactionId: p.transactionId,
          createdAt: p.createdAt,
          processedAt: p.processedAt,
          rejectionReason: p.rejectionReason,
          failureReason: p.failureReason,
        })),
        summary,
        pagination: {
          total: allPayouts.length,
          limit,
          offset,
          hasMore: offset + limit < allPayouts.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching payout history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout history' },
      { status: 500 }
    );
  }
}

