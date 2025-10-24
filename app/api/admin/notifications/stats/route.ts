import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminNotifications } from '@/lib/schema';
import { eq, count, and, isNull } from 'drizzle-orm';
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

    // Get notification counts by status
    const [unreadResult] = await db
      .select({ count: count() })
      .from(adminNotifications)
      .where(
        and(
          eq(adminNotifications.status, 'unread'),
          isNull(adminNotifications.archivedAt)
        )
      );

    const [readResult] = await db
      .select({ count: count() })
      .from(adminNotifications)
      .where(
        and(
          eq(adminNotifications.status, 'read'),
          isNull(adminNotifications.archivedAt)
        )
      );

    const [urgentResult] = await db
      .select({ count: count() })
      .from(adminNotifications)
      .where(
        and(
          eq(adminNotifications.priority, 'urgent'),
          eq(adminNotifications.status, 'unread'),
          isNull(adminNotifications.archivedAt)
        )
      );

    return NextResponse.json({
      unread: unreadResult?.count || 0,
      read: readResult?.count || 0,
      urgent: urgentResult?.count || 0,
      total: (unreadResult?.count || 0) + (readResult?.count || 0),
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification stats' },
      { status: 500 }
    );
  }
}
