import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema/users';
import { recurringDonations } from '@/lib/schema/recurring-donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq, desc, inArray } from 'drizzle-orm';

/**
 * GET /api/payments/subscriptions
 * List recurring donations for the authenticated user (as donor).
 */
export async function GET(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const list = await db
      .select({
        id: recurringDonations.id,
        campaignId: recurringDonations.campaignId,
        amount: recurringDonations.amount,
        currency: recurringDonations.currency,
        period: recurringDonations.period,
        paymentMethod: recurringDonations.paymentMethod,
        status: recurringDonations.status,
        isActive: recurringDonations.isActive,
        nextBillingDate: recurringDonations.nextBillingDate,
        totalDonations: recurringDonations.totalDonations,
        totalAmount: recurringDonations.totalAmount,
        createdAt: recurringDonations.createdAt,
        cancelledAt: recurringDonations.cancelledAt,
      })
      .from(recurringDonations)
      .where(eq(recurringDonations.donorId, user.id))
      .orderBy(desc(recurringDonations.createdAt));

    const campaignIds = [...new Set(list.map((r) => r.campaignId))];
    const campaignRows =
      campaignIds.length > 0
        ? await db
            .select({
              id: campaigns.id,
              title: campaigns.title,
              slug: campaigns.slug,
              coverImageUrl: campaigns.coverImageUrl,
            })
            .from(campaigns)
            .where(inArray(campaigns.id, campaignIds))
        : [];
    const campaignMap = new Map(
      campaignRows.map((c) => [c.id, { title: c.title, slug: c.slug, coverImageUrl: c.coverImageUrl }])
    );

    const subscriptions = list.map((r) => ({
      ...r,
      campaignTitle: campaignMap.get(r.campaignId)?.title ?? null,
      campaignSlug: campaignMap.get(r.campaignId)?.slug ?? null,
      campaignImage: campaignMap.get(r.campaignId)?.coverImageUrl ?? null,
    }));

    return NextResponse.json({ success: true, subscriptions });
  } catch (error: unknown) {
    console.error('List subscriptions error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list subscriptions' },
      { status: 500 }
    );
  }
}
