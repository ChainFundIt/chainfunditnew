import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { charities } from '@/lib/schema/charities';
import { sql } from 'drizzle-orm';

/**
 * GET /api/charities/categories
 * Get all unique charity categories with counts
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await db
      .select({
        category: charities.category,
        count: sql<number>`COUNT(*)`,
      })
      .from(charities)
      .where(sql`${charities.category} IS NOT NULL AND ${charities.isActive} = true`)
      .groupBy(charities.category)
      .orderBy(sql`COUNT(*) DESC`);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching charity categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

