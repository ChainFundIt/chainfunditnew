import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactHangoutRegistrations } from "@/lib/schema";
import { eq, and, or, lt, isNull } from "drizzle-orm";
import { sendImpactHangoutReminderEmail } from "@/lib/notifications/impact-hangout-emails";
import { getCronDisabledResponse } from "@/lib/utils/cron-control";
import { requireCronAuth } from "@/lib/utils/cron-auth";

export const runtime = "nodejs";

const FIVE_MIN_MS = 5 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const FIVE_DAYS_MS = 5 * ONE_DAY_MS;

async function runImpactHangoutReminders(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse("impact-hangout-reminders");
  if (disabledResponse) return disabledResponse;

  const authError = requireCronAuth(request);
  if (authError) return authError;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    "https://chainfundit.com";
  const registerUrl = `${baseUrl}/events/register`;

  const results = { sent: 0, failed: 0, errors: [] as string[] };
  const now = new Date();

  try {
    const fiveMinAgo = new Date(now.getTime() - FIVE_MIN_MS);
    const oneDayAgo = new Date(now.getTime() - ONE_DAY_MS);
    const fiveDaysAgo = new Date(now.getTime() - FIVE_DAYS_MS);

    const pending = await db
      .select({
        id: impactHangoutRegistrations.id,
        email: impactHangoutRegistrations.email,
        fullName: impactHangoutRegistrations.fullName,
        hangoutName: impactHangoutRegistrations.hangoutName,
        createdAt: impactHangoutRegistrations.createdAt,
        reminder5minSentAt: impactHangoutRegistrations.reminder5minSentAt,
        reminder1daySentAt: impactHangoutRegistrations.reminder1daySentAt,
        reminder5daysSentAt: impactHangoutRegistrations.reminder5daysSentAt,
      })
      .from(impactHangoutRegistrations)
      .where(
        and(
          eq(impactHangoutRegistrations.paymentStatus, "pending"),
          or(
            and(
              lt(impactHangoutRegistrations.createdAt, fiveDaysAgo),
              isNull(impactHangoutRegistrations.reminder5daysSentAt)
            ),
            and(
              lt(impactHangoutRegistrations.createdAt, oneDayAgo),
              isNull(impactHangoutRegistrations.reminder1daySentAt)
            ),
            and(
              lt(impactHangoutRegistrations.createdAt, fiveMinAgo),
              isNull(impactHangoutRegistrations.reminder5minSentAt)
            )
          )
        )
      );

    for (const row of pending) {
      const createdAt = row.createdAt ? new Date(row.createdAt) : null;
      if (!createdAt) continue;

      if (createdAt <= fiveDaysAgo && !row.reminder5daysSentAt) {
        const sent = await sendImpactHangoutReminderEmail({
          to: row.email,
          hostName: row.fullName,
          hangoutName: row.hangoutName,
          reminderType: "5days",
          registerUrl,
        });
        if (sent && !sent.error) {
          await db
            .update(impactHangoutRegistrations)
            .set({ reminder5daysSentAt: new Date() })
            .where(eq(impactHangoutRegistrations.id, row.id));
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`5days reminder failed for ${row.id}`);
        }
        continue;
      }

      if (createdAt <= oneDayAgo && !row.reminder1daySentAt) {
        const sent = await sendImpactHangoutReminderEmail({
          to: row.email,
          hostName: row.fullName,
          hangoutName: row.hangoutName,
          reminderType: "1day",
          registerUrl,
        });
        if (sent && !sent.error) {
          await db
            .update(impactHangoutRegistrations)
            .set({ reminder1daySentAt: new Date() })
            .where(eq(impactHangoutRegistrations.id, row.id));
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`1day reminder failed for ${row.id}`);
        }
        continue;
      }

      if (createdAt <= fiveMinAgo && !row.reminder5minSentAt) {
        const sent = await sendImpactHangoutReminderEmail({
          to: row.email,
          hostName: row.fullName,
          hangoutName: row.hangoutName,
          reminderType: "5min",
          registerUrl,
        });
        if (sent && !sent.error) {
          await db
            .update(impactHangoutRegistrations)
            .set({ reminder5minSentAt: new Date() })
            .where(eq(impactHangoutRegistrations.id, row.id));
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`5min reminder failed for ${row.id}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Impact Hangout reminders run complete",
      ...results,
    });
  } catch (error) {
    console.error("[cron] impact-hangout-reminders failed", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        ...results,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return runImpactHangoutReminders(request);
}

export async function POST(request: NextRequest) {
  return runImpactHangoutReminders(request);
}
