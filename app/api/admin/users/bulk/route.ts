import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { inArray } from 'drizzle-orm';
import { requireAdminAuthWith2FA } from '@/lib/admin-auth';

/**
 * PATCH /api/admin/users/bulk
 * Perform bulk actions on multiple users
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminAuthWith2FA(request);

    const body = await request.json();
    const { userIds, action, ...actionData } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let updatedUsers;
    const updateData = {
      updatedAt: new Date(),
    };

    switch (action) {
      case 'activate':
        updatedUsers = await db
          .update(users)
          .set({ 
            ...updateData,
            suspendedAt: null,
            suspendedReason: null,
          })
          .where(inArray(users.id, userIds))
          .returning();
        break;

      case 'suspend':
        updatedUsers = await db
          .update(users)
          .set({ 
            ...updateData,
            suspendedAt: new Date(),
            suspendedReason: 'Suspended by bulk admin action',
          })
          .where(inArray(users.id, userIds))
          .returning();
        break;

      case 'ban':
        updatedUsers = await db
          .update(users)
          .set({ 
            ...updateData,
            suspendedAt: new Date(),
            suspendedReason: 'Banned by bulk admin action',
          })
          .where(inArray(users.id, userIds))
          .returning();
        break;

      case 'verify':
        updatedUsers = await db
          .update(users)
          .set({ 
            ...updateData,
            isVerified: true,
          })
          .where(inArray(users.id, userIds))
          .returning();
        break;

      case 'unverify':
        updatedUsers = await db
          .update(users)
          .set({ 
            ...updateData,
            isVerified: false,
          })
          .where(inArray(users.id, userIds))
          .returning();
        break;

      case 'update_role':
        return NextResponse.json(
          { error: 'Role management not supported in current schema' },
          { status: 400 }
        );

      case 'delete':
        // Soft delete by suspending accounts
        updatedUsers = await db
          .update(users)
          .set({ 
            ...updateData,
            suspendedAt: new Date(),
            suspendedReason: 'Soft-deleted by bulk admin action',
          })
          .where(inArray(users.id, userIds))
          .returning();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      updatedCount: updatedUsers.length,
      updatedUsers: updatedUsers.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        suspendedAt: user.suspendedAt,
        isVerified: user.isVerified,
      })),
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      if (error.message === '2FA verification required') {
        return NextResponse.json(
          { error: '2FA verification required' },
          { status: 403 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
