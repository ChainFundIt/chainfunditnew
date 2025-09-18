import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🧪 Test webhook received:', JSON.stringify(body, null, 2));
    
    // Extract donation ID from metadata
    const donationId = body.metadata?.donationId;
    const reference = body.reference;
    
    if (!donationId) {
      console.log('❌ No donation ID in metadata');
      return NextResponse.json({ 
        success: false, 
        error: 'No donation ID in metadata' 
      }, { status: 400 });
    }

    // Check if donation exists
    const donation = await db
      .select()
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation.length) {
      console.log('❌ Donation not found:', donationId);
      return NextResponse.json({ 
        success: false, 
        error: 'Donation not found' 
      }, { status: 404 });
    }

    console.log('✅ Found donation:', donation[0]);

    // Update donation status
    const updateResult = await db
      .update(donations)
      .set({
        paymentStatus: 'completed',
        processedAt: new Date(),
        lastStatusUpdate: new Date(),
        providerStatus: 'success',
        providerError: null,
        paymentIntentId: reference,
      })
      .where(eq(donations.id, donationId))
      .returning();

    console.log('✅ Updated donation:', updateResult[0]);

    return NextResponse.json({ 
      success: true, 
      donation: updateResult[0],
      message: 'Test webhook processed successfully' 
    });

  } catch (error) {
    console.error('💥 Test webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Test webhook failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Paystack test webhook endpoint',
    usage: 'POST with webhook payload to test donation processing'
  });
}
