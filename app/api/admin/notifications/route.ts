import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminNotifications } from '@/lib/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { getAdminUser } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'unread';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const conditions = [isNull(adminNotifications.archivedAt)];
    
    if (status !== 'all') {
      conditions.push(eq(adminNotifications.status, status as any));
    }
    
    if (type) {
      conditions.push(eq(adminNotifications.type, type));
    }

    // Get notifications
    const notifications = await db
      .select()
      .from(adminNotifications)
      .where(and(...conditions))
      .orderBy(desc(adminNotifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [totalResult] = await db
      .select({ count: adminNotifications.id })
      .from(adminNotifications)
      .where(and(...conditions));

    return NextResponse.json({
      notifications,
      total: totalResult?.count || 0,
      hasMore: notifications.length === limit,
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, message, type, priority, actionUrl, actionLabel, metadata } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Title, message, and type are required' },
        { status: 400 }
      );
    }

    // Create notification
    const [notification] = await db
      .insert(adminNotifications)
      .values({
        title,
        message,
        type,
        priority: priority || 'medium',
        actionUrl,
        actionLabel,
        metadata,
      })
      .returning();

    return NextResponse.json({
      success: true,
      notification,
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
