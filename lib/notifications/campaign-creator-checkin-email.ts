import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface CampaignCreatorCheckinEmailData {
  userEmail: string;
  userName: string;
  campaignTitle: string;
  campaignUrl: string;
  day: 2 | 5 | 7;
}

const tipsByDay: Record<CampaignCreatorCheckinEmailData['day'], string[]> = {
  2: [
    'Share your campaign link on social media with a personal story',
    'Ask close friends and family to donate early to build momentum',
    'Add a clear cover image and a short, compelling headline',
    'Post in relevant community groups and forums',
  ],
  5: [
    'Publish a campaign update with progress and thanks to early supporters',
    'Share a short video or photo showing who the funds will help',
    'Reach out to local organizations or influencers who align with your cause',
    'Encourage supporters to reshare your campaign link',
  ],
  7: [
    'Thank donors publicly and privately to deepen engagement',
    'Share a milestone update and set a clear next goal',
    'Post at different times of day to reach new audiences',
    'Ask supporters to tag friends who might help',
  ],
};

export async function sendCampaignCreatorCheckinEmail(
  data: CampaignCreatorCheckinEmailData
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return { sent: false, reason: 'Missing RESEND_API_KEY' };
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error('RESEND_FROM_EMAIL is not configured');
      return { sent: false, reason: 'Missing RESEND_FROM_EMAIL' };
    }

    const tips = tipsByDay[data.day];
    const subject = `Day ${data.day} check-in: reach more supporters`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Campaign Check-in</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .tips { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
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
              <h1>Day ${data.day} Check-in</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName || 'there'},</p>
              <p>Your campaign <strong>"${data.campaignTitle}"</strong> is live. Here are a few ideas to reach a wider audience this week:</p>
              <div class="tips">
                <ul>
                  ${tips.map((tip) => `<li>${tip}</li>`).join('')}
                </ul>
              </div>
              <div style="text-align: center;">
                <a href="${data.campaignUrl}" class="button">View Your Campaign</a>
              </div>
              <p>If you need help, reply to this email or visit our support page.</p>
              <p>Keep going — momentum builds fast!</p>
              <p><strong>The ChainFundIt Team</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.userEmail}</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://chainfundit.com'}">ChainFundIt</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: data.userEmail,
      subject,
      html,
    });

    return { sent: true };
  } catch (error) {
    console.error('Error sending campaign creator check-in email:', error);
    return { sent: false, reason: 'Email send failed' };
  }
}

