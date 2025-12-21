import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/schema/user-preferences';
import { users } from '@/lib/schema/users';
import { eq } from 'drizzle-orm';
import { parse } from 'cookie';
import { verifyUserJWT } from '@/lib/auth';

/**
 * Get user from request (authentication helper)
 */
async function getUserFromRequest(request: NextRequest) {
  const cookie = request.headers.get('cookie') || '';
  const cookies = parse(cookie);
  const token = cookies['auth_token'];
  
  if (!token) return null;
  
  const userPayload = verifyUserJWT(token);
  if (!userPayload || !userPayload.email) return null;
  
  return userPayload.email;
}

/**
 * GET /api/settings/preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const email = await getUserFromRequest(request);
    
    if (!email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user ID from email
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user settings
    let settings = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
    });

    // If no settings exist, create default ones
    if (!settings) {
      const [newSettings] = await db
        .insert(userPreferences)
        .values({
          userId: user.id,
          emailNotificationsEnabled: true,
          notifyOnCharityDonation: true, // Users get notified about their donations
          notifyOnCampaignDonation: true, // Users get notified when their campaign receives donations
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
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings/preferences
 * Update user's notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const email = await getUserFromRequest(request);
    
    if (!email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user ID from email
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate the settings data
    const allowedFields = [
      'emailNotificationsEnabled',
      'notificationEmail',
      'notifyOnCharityDonation',
      'notifyOnCampaignDonation',
      'notifyOnPayoutRequest',
      'notifyOnLargeDonation',
      'largeDonationThreshold',
      'pushNotificationsEnabled',
      'dailySummaryEnabled',
      'weeklySummaryEnabled',
      'summaryTime',
    ];

    // Filter out any fields that are not allowed
    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Find existing settings
    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
    });

    let updatedSettings;

    if (existing) {
      // Update existing settings
      [updatedSettings] = await db
        .update(userPreferences)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, user.id))
        .returning();
    } else {
      // Create new settings
      [updatedSettings] = await db
        .insert(userPreferences)
        .values({
          userId: user.id,
          ...updateData,
        })
        .returning();
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

