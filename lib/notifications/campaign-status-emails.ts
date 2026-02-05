import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface CampaignStatusEmailData {
  userEmail: string;
  userName: string;
  campaignTitle: string;
  campaignUrl?: string;
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
                <p>Please send an email to <a href="mailto:campaigns@chainfundit.com">campaigns@chainfundit.com</a> with supporting documents or evidence that confirm the legitimacy of the campaign. This could include:</p>
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

    const result = await resend.emails.send({
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

    const result = await resend.emails.send({
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
