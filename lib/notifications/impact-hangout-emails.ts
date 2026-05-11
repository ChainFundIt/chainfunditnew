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

const FROM = process.env.RESEND_FROM_EMAIL || "notifications@chainfundit.com";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";

const baseStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #15803d 0%, #166534 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
  .progress-box { background: #f0fdf4; border-left: 4px solid #15803d; padding: 15px; margin: 20px 0; }
  .button { display: inline-block; background: #15803d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
`;

export type MilestoneEmailData = {
  to: string;
  hostName: string;
  hangoutName: string;
  milestonePercent: 25 | 50 | 75 | 100;
  amountRaisedNgn: number;
  goalNgn: number;
  pageUrl: string;
};

export async function sendImpactHangoutMilestoneEmail(
  data: MilestoneEmailData
): Promise<{ data?: { id: string } | null; error?: unknown } | null> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return null;
    }

    const subject = `You've hit ${data.milestonePercent}% of your Impact Hangout goal!`;
    const raised = data.amountRaisedNgn.toLocaleString();
    const goal = data.goalNgn.toLocaleString();

    const html = `
      <!DOCTYPE html>
      <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.milestonePercent}% milestone reached!</h1>
              <p>${data.hangoutName}</p>
            </div>
            <div class="content">
              <p>Hi ${data.hostName},</p>
              <p>Great news — your Impact Hangout fundraising has reached <strong>${data.milestonePercent}%</strong> of your goal.</p>
              <div class="progress-box">
                <strong>₦${raised}</strong> raised of <strong>₦${goal}</strong> goal.
              </div>
              <p>Keep sharing your page with friends and family to get even closer.</p>
              <p style="text-align: center;">
                <a href="${data.pageUrl}" class="button">View your page</a>
              </p>
              <p>Thank you for making an impact,<br/><strong>The ChainFundIt Team</strong></p>
            </div>
            <div class="footer">
              <p><a href="${BASE_URL}">www.chainfundit.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await getResendClient().emails.send({
      from: FROM,
      to: data.to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error("Error sending Impact Hangout milestone email:", error);
    return null;
  }
}

export type ReminderEmailData = {
  to: string;
  hostName: string;
  hangoutName: string | null;
  reminderType: "5min" | "1day" | "5days";
  registerUrl: string;
};

function reminderSubject(type: ReminderEmailData["reminderType"]): string {
  switch (type) {
    case "5min":
      return "Complete your Impact Hangout registration";
    case "1day":
      return "You're one step away from hosting your Impact Hangout";
    case "5days":
      return "Your Impact Hangout is waiting — finish in minutes";
    default:
      return "Complete your Impact Hangout registration";
  }
}

function reminderBody(data: ReminderEmailData): { intro: string; cta: string } {
  const pageName = data.hangoutName || "your Impact Hangout";
  switch (data.reminderType) {
    case "5min":
      return {
        intro: `You started registering to host ${pageName} but didn't finish. Complete your registration and pay your kickstart amount to get your fundraising page live.`,
        cta: "Complete registration",
      };
    case "1day":
      return {
        intro: `Yesterday you registered to host an Impact Hangout. You're just one step away: pay your kickstart donation to activate your page and start sharing.`,
        cta: "Finish and go live",
      };
    case "5days":
      return {
        intro: `You signed up to host an Impact Hangout a few days ago. It only takes a minute to complete your kickstart payment and get your page live.`,
        cta: "Complete now",
      };
    default:
      return {
        intro: `Complete your Impact Hangout registration and get your fundraising page live.`,
        cta: "Complete registration",
      };
  }
}

export async function sendImpactHangoutReminderEmail(
  data: ReminderEmailData
): Promise<{ data?: { id: string } | null; error?: unknown } | null> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return null;
    }

    const subject = reminderSubject(data.reminderType);
    const { intro, cta } = reminderBody(data);

    const html = `
      <!DOCTYPE html>
      <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>The Impact Hangout</h1>
              <p>Complete your registration</p>
            </div>
            <div class="content">
              <p>Hi ${data.hostName},</p>
              <p>${intro}</p>
              <p style="text-align: center;">
                <a href="${data.registerUrl}" class="button">${cta}</a>
              </p>
              <p>If you have any questions, reply to this email or contact us.</p>
              <p>Thank you,<br/><strong>The ChainFundIt Team</strong></p>
            </div>
            <div class="footer">
              <p><a href="${BASE_URL}">www.chainfundit.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await getResendClient().emails.send({
      from: FROM,
      to: data.to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error("Error sending Impact Hangout reminder email:", error);
    return null;
  }
}

export type AccessLinkEmailData = {
  to: string;
  hostName: string;
  hangoutName: string;
  pageUrl: string;
};

export async function sendImpactHangoutAccessLinkEmail(
  data: AccessLinkEmailData
): Promise<{ data?: { id: string } | null; error?: unknown } | null> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return null;
    }

    const subject = "Your Impact Hangout — link to your page";
    const html = `
      <!DOCTYPE html>
      <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>The Impact Hangout</h1>
              <p>Access your page</p>
            </div>
            <div class="content">
              <p>Hi ${data.hostName},</p>
              <p>You asked for a link to your Impact Hangout. Here it is:</p>
              <p><strong>${data.hangoutName}</strong></p>
              <p style="text-align: center;">
                <a href="${data.pageUrl}" class="button">View my hangout page</a>
              </p>
              <p>Bookmark this link to come back anytime.</p>
              <p>Thank you,<br/><strong>The ChainFundIt Team</strong></p>
            </div>
            <div class="footer">
              <p><a href="${BASE_URL}">www.chainfundit.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await getResendClient().emails.send({
      from: FROM,
      to: data.to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error("Error sending Impact Hangout access link email:", error);
    return null;
  }
}
