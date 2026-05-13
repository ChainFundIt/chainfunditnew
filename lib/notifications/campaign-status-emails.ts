import { Resend } from "resend";

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

interface CampaignStatusEmailData {
  userEmail: string;
  userName: string;
  campaignTitle: string;
  campaignUrl?: string;
}

interface CampaignVerificationPendingEmailData extends CampaignStatusEmailData {
  rulesPageUrl: string;
}

/** Sent when an admin marks a campaign for verification; creator must accept rules before the badge is active. */
export async function sendCampaignVerificationPendingEmail(
  data: CampaignVerificationPendingEmailData
) {
  try {
    const subject =
      "Action required: complete verified campaign agreement — ChainFundIt";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color: white; padding: 28px 24px; text-align: center; border-radius: 12px 12px 0 0; }
            .logo-img { max-width: 160px; height: auto; margin-bottom: 12px; }
            .content { background: #ffffff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            .info-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; }
            .cta-button { display: inline-block; margin: 24px auto; padding: 14px 28px; background: #1d4ed8; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; }
            .footer { text-align: center; padding: 16px; color: #6b7280; font-size: 14px; }
            p { margin-bottom: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verification pending</h1>
              <p>One quick step to activate your verified badge</p>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Great news: <strong>${data.campaignTitle}</strong> has been selected for a <strong>verified</strong> campaign on ChainFundIt.</p>
              <div class="info-box">
                <strong>Your verified badge is not active yet.</strong>
                <p>Please read the verified campaign rules and confirm your agreement. Until you do, your campaign will show as <em>pending verification</em> on your dashboard.</p>
              </div>
              <p>Use the button below to review the rules and complete this step.</p>
              <div style="text-align:center;">
                <a href="${data.rulesPageUrl}" style="background-color: #1d4ed8; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; padding: 14px 28px; display: inline-block; margin: 24px auto;" class="cta-button">Review rules and accept</a>
              </div>
              ${data.campaignUrl ? `<p style="font-size:14px;color:#6b7280;">Or <a href="${data.campaignUrl}">view your campaign</a>.</p>` : ""}
              <p>Thank you,<br /><strong>The ChainFundIt Team</strong></p>
            </div>
            <div class="footer">
              <p><a href="https://www.chainfundit.com">www.chainfundit.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return null;
    }

    return await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "notifications@chainfundit.com",
      to: data.userEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending verification pending email:", error);
    return null;
  }
}

export async function sendCampaignHoldEmail(
  data: CampaignStatusEmailData
) {
  try {
    const subject =
      "Action Required: Verification Needed for Your ChainFundIt Campaign";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo-img { max-width: 150px; height: auto; margin-bottom: 15px; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .info-box { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${(() => {
                const logoUrl = `/images/logo.svg`;
                return `<img src="${logoUrl}" alt="ChainFundit Logo" class="logo-img" />`;
              })()}
              <h1>Action Required</h1>
              <p>Verification Needed</p>
            </div>

            <div class="content">
              <p>Dear ${data.userName},</p>

              <p>We've noticed that you recently created a campaign on ChainFundIt titled "<strong>${data.campaignTitle}</strong>" — thank you for using the platform to raise support.</p>

              <p>As part of our platform's compliance and trust process, we have placed your campaign under temporary review. This means:</p>
              <ul>
                <li>Your campaign can still receive donations</li>
                <li>However, fund withdrawals will be paused until all compliance checks are complete</li>
              </ul>

              <div class="info-box">
                <strong>To proceed, we require additional information to verify the authenticity of your campaign.</strong>
                <p>Please send an email to <a href="mailto:campaigns@chainfundit.com">campaigns@chainfundit.com</a>, or reach us through WhatsApp at <a href="https://wa.me/+2348090986009?text=Hello, I need to verify my campaign on ChainFundIt">+238090986009</a> with supporting documents or evidence that confirm the legitimacy of the campaign. This could include:</p>
                <ul>
                  <li>Identification or affiliation with the person/cause listed</li>
                  <li>Photos, hospital/school/official letters (if relevant)</li>
                  <li>Screenshots or contact details that can help us validate the need</li>
                </ul>
              </div>

              <p>We take the safety of donors and the integrity of the platform very seriously, and your cooperation is key to keeping ChainFundIt a trusted space for everyone.</p>

              <p>Thank you for your understanding,<br/>
              <strong>The ChainFundIt Team</strong></p>

              ${data.campaignUrl ? `
                <div style="text-align: center;">
                  <a href="${data.campaignUrl}" class="button">View Campaign →</a>
                </div>
              ` : ''}
            </div>

            <div class="footer">
              <p><a href="https://chainfundit.com">www.chainfundit.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return null;
    }

    const result = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "notifications@chainfundit.com",
      to: data.userEmail,
      subject,
      html,
    });

    return result;
  } catch (error) {
    console.error("Error sending campaign hold email:", error);
    return null;
  }
}

export async function sendCampaignReactivatedEmail(
  data: CampaignStatusEmailData
) {
  try {
    const subject = "Your ChainFundIt Campaign Is Active Again";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo-img { max-width: 150px; height: auto; margin-bottom: 15px; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .info-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${(() => {
                const logoUrl = `/images/logo.svg`;
                return `<img src="${logoUrl}" alt="ChainFundit Logo" class="logo-img" />`;
              })()}
              <h1>Campaign Reactivated</h1>
              <p>You're live again</p>
            </div>

            <div class="content">
              <p>Hello ${data.userName},</p>

              <div class="info-box">
                <strong>Good news!</strong>
                <p>Your campaign "<strong>${data.campaignTitle}</strong>" has been reactivated and is now live on ChainFundIt.</p>
              </div>

              <p>You can continue sharing your campaign and receiving donations. If you have any questions or need further assistance, please contact us at <a href="mailto:campaigns@chainfundit.com">campaigns@chainfundit.com</a>.</p>

              ${data.campaignUrl ? `
                <div style="text-align: center;">
                  <a href="${data.campaignUrl}" class="button">View Campaign →</a>
                </div>
              ` : ''}

              <p>Thank you for being part of the ChainFundIt community,<br/>
              <strong>The ChainFundIt Team</strong></p>
            </div>

            <div class="footer">
              <p><a href="https://chainfundit.com">www.chainfundit.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return null;
    }

    const result = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "notifications@chainfundit.com",
      to: data.userEmail,
      subject,
      html,
    });

    return result;
  } catch (error) {
    console.error("Error sending campaign reactivated email:", error);
    return null;
  }
}

export async function sendCampaignVerifiedEmail(
  data: CampaignStatusEmailData
) {
  try {
    const subject = "Your Campaign is Now Verified ✅";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #16a34a 100%); color: white; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0; }
            .logo-img { max-width: 160px; height: auto; margin-bottom: 15px; }
            .content { background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            .badge { display: inline-flex; align-items: center; gap: 8px; background: #dcfce7; color: #166534; padding: 10px 16px; border-radius: 999px; font-weight: 600; margin: 20px 0; }
            .cta-button { display: inline-block; margin: 32px auto 24px; padding: 14px 28px; background: #16a34a; color: #fff; border-radius: 999px; text-decoration: none; font-weight: 600; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            p { margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${(() => {
                const logoUrl = `/images/logo.svg`;
                return `<img src="${logoUrl}" alt="ChainFundit Logo" class="logo-img" />`;
              })()}
              <h1>Verified Badge Unlocked</h1>
              <p>Your community can trust this story even more.</p>
            </div>

            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Thank you for creating your campaign on ChainFundIt.</p>
              <p>We’re pleased to share that <strong>${data.campaignTitle}</strong> has officially been given the <strong>“Verified”</strong> tag.</p>

              <div class="badge">✅ Campaign Verified</div>

              <p>This badge adds an extra layer of authenticity to your campaign and helps build trust with donors, which can significantly increase confidence in supporting your cause.</p>

              <p>We’re excited to see your fundraising journey unfold and wish you every success in reaching your goal. Need support promoting your campaign or sharing updates? Reach us anytime at <a href="mailto:campaigns@chainfundit.com">campaigns@chainfundit.com</a>.</p>

              ${data.campaignUrl ? `
              <div style="text-align:center;">
                <a href="${data.campaignUrl}" class="cta-button">View Campaign</a>
              </div>
              ` : ''}

              <p><strong>Raise funds. Support dreams. Join the movement.</strong></p>

              <p>Warm regards,<br />
              The ChainFundIt Team</p>
            </div>

            <div class="footer">
              <p><a href="https://www.chainfundit.com">www.chainfundit.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return null;
    }

    const result = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "notifications@chainfundit.com",
      to: data.userEmail,
      subject,
      html,
    });

    return result;
  } catch (error) {
    console.error("Error sending campaign verified email:", error);
    return null;
  }
}
