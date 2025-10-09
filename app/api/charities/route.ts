import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { charities, type NewCharity } from '@/lib/schema/charities';
import { eq, like, and, desc, asc, sql } from 'drizzle-orm';

/**
 * GET /api/charities
 * Get all charities with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const isVerified = searchParams.get('verified');
    const isActive = searchParams.get('active');
    const country = searchParams.get('country');
    const sortBy = searchParams.get('sortBy') || 'name'; // name, created, donations
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where conditions
    const conditions = [];
    
    if (search) {
      conditions.push(
        sql`(${charities.name} ILIKE ${`%${search}%`} OR ${charities.description} ILIKE ${`%${search}%`})`
      );
    }
    
    if (category) {
      conditions.push(eq(charities.category, category));
    }
    
    if (isVerified !== null && isVerified !== undefined) {
      conditions.push(eq(charities.isVerified, isVerified === 'true'));
    }
    
    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(charities.isActive, isActive === 'true'));
    }
    
    if (country) {
      conditions.push(eq(charities.country, country));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build order by
    let orderByClause;
    const direction = sortOrder === 'desc' ? desc : asc;
    
    switch (sortBy) {
      case 'created':
        orderByClause = direction(charities.createdAt);
        break;
      case 'donations':
        orderByClause = direction(charities.totalReceived);
        break;
      case 'name':
      default:
        orderByClause = direction(charities.name);
        break;
    }

    // Get charities with pagination
    const charitiesList = await db.query.charities.findMany({
      where: whereClause,
      orderBy: orderByClause,
      limit,
      offset,
    });

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(charities)
      .where(whereClause);
    
    const totalCount = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      charities: charitiesList,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching charities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charities' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/charities
 * Create a new charity (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate slug from name if not provided
    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newCharity: NewCharity = {
      ...body,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [charity] = await db.insert(charities).values(newCharity).returning();

    return NextResponse.json({
      message: 'Charity created successfully',
      charity,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating charity:', error);
    return NextResponse.json(
      { error: 'Failed to create charity' },
      { status: 500 }
    );
  }
}

