import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { retryFailedPayouts, retryPayout } from '@/lib/payments/payout-retry';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * POST /api/payouts/retry
 * Retry failed payouts (admin only or automatic)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payoutId, type, auto } = body;

    // If auto=true, check for admin auth or cron secret
    if (auto) {
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;
      
      if (authHeader === `Bearer ${cronSecret}` || !cronSecret) {
        // Run automatic retry for all failed payouts
        const result = await retryFailedPayouts({
          maxRetries: 3,
          retryDelayMinutes: 60,
        });

        return NextResponse.json(result);
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Manual retry - require admin authentication
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user.length || user[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!payoutId || !type) {
      return NextResponse.json(
        { error: 'Missing payoutId or type' },
        { status: 400 }
      );
    }

    const result = await retryPayout(payoutId, type);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in retry payout endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to retry payout' },
      { status: 500 }
    );
  }
}

