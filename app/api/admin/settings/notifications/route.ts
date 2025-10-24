import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminSettings, type NewAdminSettings } from '@/lib/schema/admin-settings';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/settings/notifications
 * Get admin notification settings
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get current admin user ID from session
    // For now, we'll use a placeholder
    const adminUserId = request.headers.get('x-admin-user-id') || 'admin-user-id';

    let settings = await db.query.adminSettings.findFirst({
      where: eq(adminSettings.userId, adminUserId),
    });

    // If no settings exist, create default ones
    if (!settings) {
      const [newSettings] = await db
        .insert(adminSettings)
        .values({
          userId: adminUserId,
          emailNotificationsEnabled: true,
          notifyOnCharityDonation: true,
          notifyOnCampaignDonation: true,
          notifyOnPayoutRequest: true,
          notifyOnLargeDonation: true,
          largeDonationThreshold: '1000',
          pushNotificationsEnabled: false,
          dailySummaryEnabled: false,
          weeklySummaryEnabled: true,
          summaryTime: '09:00',
        })
        .returning();
      
      settings = newSettings;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/settings/notifications
 * Update admin notification settings
 */
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Get current admin user ID from session
    const adminUserId = request.headers.get('x-admin-user-id') || 'admin-user-id';
    const body = await request.json();

    // Find existing settings
    const existing = await db.query.adminSettings.findFirst({
      where: eq(adminSettings.userId, adminUserId),
    });

    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(adminSettings)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(adminSettings.userId, adminUserId))
        .returning();

      return NextResponse.json({
        message: 'Settings updated successfully',
        settings: updated,
      });
    } else {
      // Create new settings
      const [created] = await db
        .insert(adminSettings)
        .values({
          userId: adminUserId,
          ...body,
        })
        .returning();

      return NextResponse.json({
        message: 'Settings created successfully',
        settings: created,
      });
    }
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

