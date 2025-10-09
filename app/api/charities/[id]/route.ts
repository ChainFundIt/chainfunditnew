import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { charities, charityDonations } from '@/lib/schema/charities';
import { eq, sql } from 'drizzle-orm';

/**
 * GET /api/charities/[id]
 * Get a specific charity by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(id);

    let charity = null;

    if (isUUID) {
      // Try to find by ID first if it's a valid UUID
      charity = await db.query.charities.findFirst({
        where: eq(charities.id, id),
      });
    }

    // If not found by ID or not a UUID, try by slug
    if (!charity) {
      charity = await db.query.charities.findFirst({
        where: eq(charities.slug, id),
      });
    }

    if (!charity) {
      return NextResponse.json(
        { error: 'Charity not found' },
        { status: 404 }
      );
    }

    // Get donation statistics
    const donationStats = await db
      .select({
        totalDonations: sql<number>`COUNT(*)`,
        totalAmount: sql<number>`COALESCE(SUM(CAST(${charityDonations.amount} AS NUMERIC)), 0)`,
        successfulDonations: sql<number>`COUNT(*) FILTER (WHERE ${charityDonations.paymentStatus} = 'completed')`,
      })
      .from(charityDonations)
      .where(eq(charityDonations.charityId, charity.id));

    return NextResponse.json({
      charity,
      stats: donationStats[0] || {
        totalDonations: 0,
        totalAmount: 0,
        successfulDonations: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching charity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charity' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/charities/[id]
 * Update a charity (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(id);

    // Find charity first to get actual ID
    let charity = null;
    if (isUUID) {
      charity = await db.query.charities.findFirst({
        where: eq(charities.id, id),
      });
    }
    
    if (!charity) {
      charity = await db.query.charities.findFirst({
        where: eq(charities.slug, id),
      });
    }

    if (!charity) {
      return NextResponse.json(
        { error: 'Charity not found' },
        { status: 404 }
      );
    }

    const [updatedCharity] = await db
      .update(charities)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(charities.id, charity.id))
      .returning();

    if (!updatedCharity) {
      return NextResponse.json(
        { error: 'Failed to update charity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Charity updated successfully',
      charity: updatedCharity,
    });
  } catch (error) {
    console.error('Error updating charity:', error);
    return NextResponse.json(
      { error: 'Failed to update charity' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/charities/[id]
 * Delete a charity (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(id);

    // Find charity first to get actual ID
    let charity = null;
    if (isUUID) {
      charity = await db.query.charities.findFirst({
        where: eq(charities.id, id),
      });
    }
    
    if (!charity) {
      charity = await db.query.charities.findFirst({
        where: eq(charities.slug, id),
      });
    }

    if (!charity) {
      return NextResponse.json(
        { error: 'Charity not found' },
        { status: 404 }
      );
    }

    const [deletedCharity] = await db
      .delete(charities)
      .where(eq(charities.id, charity.id))
      .returning();

    if (!deletedCharity) {
      return NextResponse.json(
        { error: 'Failed to delete charity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Charity deleted successfully',
      charity: deletedCharity,
    });
  } catch (error) {
    console.error('Error deleting charity:', error);
    return NextResponse.json(
      { error: 'Failed to delete charity' },
      { status: 500 }
    );
  }
}

