import { Resend } from 'resend';
import { db } from '@/lib/db';
import { adminSettings } from '@/lib/schema/admin-settings';
import { users } from '@/lib/schema';
import { eq, or } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

interface CampaignCreatedData {
  campaignTitle: string;
  campaignSlug: string;
  goalAmount: string;
  currency: string;
  visibility: string;
  isChained: boolean;
  creatorName: string;
  creatorEmail: string;
  campaignUrl: string;
}

/**
 * Send email notification to admins when a new campaign is created
 */
export async function notifyAdminsOfCampaignCreated(data: CampaignCreatedData) {
  try {
    const adminUsers = await db.query.users.findMany({
      where: or(
        eq(users.role, 'admin'),
        eq(users.role, 'super_admin')
      ),
    });

    if (adminUsers.length === 0) {
      return;
    }

    const adminConfigs = await db.query.adminSettings.findMany({
      where: eq(adminSettings.notifyOnCampaignCreated, true),
    });

    const settingsMap = new Map(adminConfigs.map(config => [config.userId, config]));
    let notificationsSent = 0;

    for (const adminUser of adminUsers) {
      const config = settingsMap.get(adminUser.id);
      const shouldNotify = config ? config.notifyOnCampaignCreated : true;
      const emailEnabled = config ? config.emailNotificationsEnabled : true;

      if (!shouldNotify || !emailEnabled) continue;

      const recipientEmail = config?.notificationEmail || adminUser.email;
      if (!recipientEmail) continue;

      await sendCampaignCreatedEmail(recipientEmail, data);
      notificationsSent++;
    }

    if (notificationsSent === 0) {
      console.log('No admins configured for campaign creation notifications');
    } else {
      console.log(`✅ Campaign creation notifications sent to ${notificationsSent} admin(s)`);
    }
  } catch (error) {
    console.error('Error notifying admins of campaign creation:', error);
  }
}

async function sendCampaignCreatedEmail(
  recipientEmail: string,
  data: CampaignCreatedData
) {
  try {
    const currencySymbol =
      data.currency === 'NGN' ? '₦' :
      data.currency === 'GBP' ? '£' :
      data.currency === 'EUR' ? '€' : '$';

    const formattedAmount = `${currencySymbol}${parseFloat(data.goalAmount).toLocaleString()}`;
    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://chainfundit.com'}/admin/campaigns`;

    const subject = `🆕 New Campaign Created: ${data.campaignTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: 600; color: #6b7280; }
            .detail-value { color: #111827; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${(() => {
                const logoUrl = `/images/logo.svg`;
                return `<img src="${logoUrl}" alt="ChainFundit Logo" class="logo-img" />`;
              })()}
              <h1>New Campaign Created</h1>
            </div>
            <div class="content">
              <p>A new campaign has been created on ChainFundIt.</p>
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Campaign:</span>
                  <span class="detail-value">${data.campaignTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Goal:</span>
                  <span class="detail-value">${formattedAmount} ${data.currency}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Visibility:</span>
                  <span class="detail-value">${data.visibility}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Chained:</span>
                  <span class="detail-value">${data.isChained ? 'Yes' : 'No'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Creator:</span>
                  <span class="detail-value">${data.creatorName} (${data.creatorEmail})</span>
                </div>
              </div>
              <div style="text-align: center;">
                <a href="${adminUrl}" class="button">View in Admin Dashboard →</a>
              </div>
              <p style="text-align: center;">
                <a href="${data.campaignUrl}">View Public Campaign</a>
              </p>
            </div>
            <div class="footer">
              <p>ChainFundit Admin Notifications</p>
              <p>Manage preferences at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://chainfundit.com'}/admin/settings">Admin Settings</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'notifications@chainfundit.com',
      to: recipientEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending campaign creation email to admin:', error);
  }
}

