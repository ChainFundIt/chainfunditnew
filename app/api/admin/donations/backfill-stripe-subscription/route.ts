import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/donations/backfill-stripe-subscription
 *
 * Legacy endpoint. Stripe is no longer supported; backfill is unavailable.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Stripe is no longer supported. Backfill for Stripe subscriptions is unavailable.',
    },
    { status: 410 }
  );
}
