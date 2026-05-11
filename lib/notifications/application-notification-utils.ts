import { Resend } from "resend";
import { db } from "@/lib/db";
import { adminNotifications, adminSettings } from "@/lib/schema";
import { users } from "@/lib/schema/users";
import { eq, or } from "drizzle-orm";

let resendClient: Resend | null = null;

function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

interface AdminRecipient {
  userId: string;
  email: string;
}

export async function getAdminRecipients(
  options: { respectEmailEnabled?: boolean } = {}
): Promise<AdminRecipient[]> {
  const { respectEmailEnabled = false } = options;
  const adminUsers = await db.query.users.findMany({
    where: or(eq(users.role, "admin"), eq(users.role, "super_admin")),
  });

  if (adminUsers.length === 0) return [];

  const adminConfigs = await db.query.adminSettings.findMany();
  const settingsMap = new Map(
    adminConfigs.map((config) => [config.userId, config])
  );

  return adminUsers
    .map((adminUser) => {
      const config = settingsMap.get(adminUser.id);
      if (respectEmailEnabled && config?.emailNotificationsEnabled === false) {
        return null;
      }
      const email = config?.notificationEmail || adminUser.email;
      return email ? { userId: adminUser.id, email } : null;
    })
    .filter((recipient): recipient is AdminRecipient => Boolean(recipient));
}

export async function sendAdminEmails({
  subject,
  html,
  respectEmailEnabled = false,
}: {
  subject: string;
  html: string;
  respectEmailEnabled?: boolean;
}) {
  const recipients = await getAdminRecipients({ respectEmailEnabled });
  await Promise.all(
    recipients.map((recipient) =>
      getResendClient().emails.send({
        from: process.env.RESEND_FROM_EMAIL || "notifications@chainfundit.com",
        to: recipient.email,
        subject,
        html,
      })
    )
  );
}

export async function sendApplicantEmail({
  recipientEmail,
  subject,
  html,
}: {
  recipientEmail: string;
  subject: string;
  html: string;
}) {
  await getResendClient().emails.send({
    from: process.env.RESEND_FROM_EMAIL || "notifications@chainfundit.com",
    to: recipientEmail,
    subject,
    html,
  });
}

export async function sendApplicationNotifications({
  adminEmail,
  applicantEmail,
  adminNotification,
}: {
  adminEmail: { subject: string; html: string };
  applicantEmail: { recipientEmail: string; subject: string; html: string };
  adminNotification: {
    title: string;
    message: string;
    type: "system" | "user" | "campaign" | "donation" | "payout" | "security";
    priority?: "low" | "medium" | "high" | "urgent";
    actionUrl?: string;
    actionLabel?: string;
    metadata?: Record<string, unknown>;
  };
}) {
  await Promise.all([
    createAdminNotification(adminNotification),
    sendAdminEmails({
      subject: adminEmail.subject,
      html: adminEmail.html,
      respectEmailEnabled: false,
    }),
    sendApplicantEmail(applicantEmail),
  ]);
}
export async function createAdminNotification(data: {
  title: string;
  message: string;
  type: "system" | "user" | "campaign" | "donation" | "payout" | "security";
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(adminNotifications).values({
    title: data.title,
    message: data.message,
    type: data.type,
    priority: data.priority || "medium",
    actionUrl: data.actionUrl,
    actionLabel: data.actionLabel,
    metadata: data.metadata,
  });
}
