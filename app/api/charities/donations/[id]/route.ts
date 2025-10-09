import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { charityDonations } from '@/lib/schema/charities';
import { eq } from 'drizzle-orm';

/**
 * GET /api/charities/donations/[id]
 * Get a specific donation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const donation = await db.query.charityDonations.findFirst({
      where: eq(charityDonations.id, id),
    });

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error('Error fetching donation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation' },
      { status: 500 }
    );
  }
}

