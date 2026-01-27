import { Resend } from "resend";
import { db } from "@/lib/db";
import { adminSettings } from "@/lib/schema/admin-settings";
import { users } from "@/lib/schema";
import { eq, or } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";

interface AmbassadorApplicationEmailData {
  fullName: string;
  email: string;
  stateOfResidence: string;
  hasCv: boolean;
  hasVideo: boolean;
  videoLink?: string | null;
  applicationId: string;
}

export async function notifyAdminsOfAmbassadorApplication(
  data: AmbassadorApplicationEmailData
) {
  try {
    const adminUsers = await db.query.users.findMany({
      where: or(eq(users.role, "admin"), eq(users.role, "super_admin")),
    });

    if (adminUsers.length === 0) {
      return;
    }

    const adminConfigs = await db.query.adminSettings.findMany();
    const settingsMap = new Map(
      adminConfigs.map((config) => [config.userId, config])
    );

    const recipients = adminUsers
      .map((adminUser) => {
        const config = settingsMap.get(adminUser.id);
        return config?.notificationEmail || adminUser.email;
      })
      .filter(Boolean);

    await Promise.allSettled(
      recipients.map((recipientEmail) =>
        sendAdminEmail(recipientEmail as string, data)
      )
    );
  } catch (error) {
    console.error("Error notifying admins of ambassador application:", error);
  }
}

export async function sendAmbassadorApplicationConfirmation(
  recipientEmail: string,
  fullName: string
) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #104901; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #104901; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; }
            .footer { text-align: center; padding: 16px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Received</h1>
            </div>
            <div class="content">
              <p>Hello ${fullName},</p>
              <p>
                Thanks for applying to become a ChainFundIt Ambassador. We have
                received your application and will review it shortly.
              </p>
              <p>
                If we need any additional information, we'll reach out to you.
              </p>
              <p class="text-center text-white">
                <a href="${appUrl}/doinggood" class="bg-brand-green-dark text-white px-4 py-2 rounded-md">Learn More</a>
              </p>
            </div>
            <div class="footer">
              <p>ChainFundIt | campaigns@chainfundit.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "notifications@chainfundit.com",
      to: recipientEmail,
      subject: "We received your ambassador application",
      html,
    });
  } catch (error) {
    console.error("Error sending ambassador confirmation email:", error);
  }
}

async function sendAdminEmail(
  recipientEmail: string,
  data: AmbassadorApplicationEmailData
) {
  const adminUrl = `${appUrl}/admin/ambassador-applications`;
  const subject = `New Ambassador Application: ${data.fullName}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #104901; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; }
          .details { background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; }
          .label { font-weight: 600; color: #6b7280; }
          .button { display: inline-block; background: #104901; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Ambassador Application</h1>
          </div>
          <div class="content">
            <p>A new ambassador application has been submitted.</p>
            <div class="details">
              <div class="row"><span class="label">Name:</span><span>${data.fullName}</span></div>
              <div class="row"><span class="label">Email:</span><span>${data.email}</span></div>
              <div class="row"><span class="label">State:</span><span>${data.stateOfResidence}</span></div>
              <div class="row"><span class="label">CV:</span><span>${data.hasCv ? "Yes" : "No"}</span></div>
              <div class="row"><span class="label">Video:</span><span>${data.hasVideo ? "Yes" : "No"}</span></div>
              ${
                data.videoLink
                  ? `<div class="row"><span class="label">Video link:</span><span>${data.videoLink}</span></div>`
                  : ""
              }
            </div>
            <div style="text-align: center;">
              <a href="${adminUrl}" class="button">View Applications</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "notifications@chainfundit.com",
    to: recipientEmail,
    subject,
    html,
  });
}
