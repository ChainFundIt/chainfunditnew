import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/donations/manual-add
 * Legacy Stripe-based manual add is no longer supported.
 * Use dashboard or database tools to add donations for Paystack/PayPal.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Stripe is no longer supported. Manual add via Stripe payment intent is unavailable. Use dashboard or database tools for Paystack/PayPal donations.',
    },
    { status: 410 }
  );
}
