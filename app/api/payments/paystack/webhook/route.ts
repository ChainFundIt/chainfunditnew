import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Legacy endpoint retained only to avoid silent webhook misrouting.
 * Configure Paystack webhooks to use /api/webhooks/paystack.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Webhook endpoint moved',
      webhookUrl: '/api/webhooks/paystack',
    },
    { status: 410 }
  );
}
