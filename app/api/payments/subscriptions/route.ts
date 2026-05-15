import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema/users';
import { donations } from '@/lib/schema/donations';
import { recurringDonations, recurringDonationPayments } from '@/lib/schema/recurring-donations';
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

    const subscriptionIds = list.map((r) => r.id);
    const paymentRows =
      subscriptionIds.length > 0
        ? await db
            .select({
              id: recurringDonationPayments.id,
              recurringDonationId: recurringDonationPayments.recurringDonationId,
              donationId: recurringDonationPayments.donationId,
              amount: recurringDonationPayments.amount,
              currency: recurringDonationPayments.currency,
              paymentStatus: recurringDonationPayments.paymentStatus,
              billingPeriodStart: recurringDonationPayments.billingPeriodStart,
              billingPeriodEnd: recurringDonationPayments.billingPeriodEnd,
              scheduledDate: recurringDonationPayments.scheduledDate,
              processedAt: recurringDonationPayments.processedAt,
              createdAt: recurringDonationPayments.createdAt,
              donationProcessedAt: donations.processedAt,
              donationPaymentStatus: donations.paymentStatus,
            })
            .from(recurringDonationPayments)
            .innerJoin(
              recurringDonations,
              eq(recurringDonationPayments.recurringDonationId, recurringDonations.id)
            )
            .leftJoin(donations, eq(recurringDonationPayments.donationId, donations.id))
            .where(inArray(recurringDonationPayments.recurringDonationId, subscriptionIds))
            .orderBy(desc(recurringDonationPayments.processedAt), desc(recurringDonationPayments.createdAt))
        : [];

    const paymentsBySubscription = new Map<string, typeof paymentRows>();
    for (const row of paymentRows) {
      const existing = paymentsBySubscription.get(row.recurringDonationId) ?? [];
      existing.push(row);
      paymentsBySubscription.set(row.recurringDonationId, existing);
    }

    const subscriptions = list.map((r) => ({
      ...r,
      campaignTitle: campaignMap.get(r.campaignId)?.title ?? null,
      campaignSlug: campaignMap.get(r.campaignId)?.slug ?? null,
      campaignImage: campaignMap.get(r.campaignId)?.coverImageUrl ?? null,
      payments: (paymentsBySubscription.get(r.id) ?? []).map((p) => {
        const status = p.donationPaymentStatus ?? p.paymentStatus;
        const paidAt = p.processedAt ?? p.donationProcessedAt ?? p.createdAt;
        return {
          id: p.id,
          donationId: p.donationId,
          amount: p.amount,
          currency: p.currency,
          status,
          billingPeriodStart: p.billingPeriodStart,
          billingPeriodEnd: p.billingPeriodEnd,
          scheduledDate: p.scheduledDate,
          paidAt: paidAt ? new Date(paidAt).toISOString() : null,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
        };
      }),
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
