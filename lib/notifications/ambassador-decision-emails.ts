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
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";
const logoUrl = `${appUrl}/images/logo.svg`;

type AmbassadorDecision = "yes" | "no";

interface DecisionEmailPayload {
  fullName: string;
  email: string;
  decision: AmbassadorDecision;
}

const SCHEDULE_LINK =
  "https://chainfundit.setmore.com/chainfundit/service/4ded5ea7-6ef6-4cc4-97b6-369c83f899ca";

export async function sendAmbassadorDecisionEmail({
  fullName,
  email,
  decision,
}: DecisionEmailPayload) {
  const html =
    decision === "yes"
      ? buildApprovalEmail(fullName)
      : buildRejectionEmail(fullName);

  const subject =
    decision === "yes"
      ? "Next steps: ChainFundIt Ambassador application"
      : "Update on your ChainFundIt Ambassador application";

  await getResendClient().emails.send({
    from: process.env.RESEND_FROM_EMAIL || "notifications@chainfundit.com",
    to: email,
    subject,
    html,
  });
}

function buildApprovalEmail(fullName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
          .container { max-width: 600px; margin: 0 auto; padding: 24px; }
          .header { text-align: center; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; }
          .logo-img { max-width: 160px; height: auto; }
          .cta-button { display: inline-block; background: #104901; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="ChainFundIt Logo" class="logo-img" />
          </div>
          <p>Hi ${fullName},</p>
          <p>
            Thank you for applying to the ChainFundIt Ambassador programme -- we really
            enjoyed reviewing your application.
          </p>
          <p>
            We'd be happy to move you to the next stage, which is a short,
            informal conversation to get to know you better, talk through your interests,
            and answer any questions you may have.
          </p>
          <p>
            Please use the link below to schedule a quick call at a time
            that works for you:
          </p>
          <button class="bg-brand-green-dark text-white px-4 py-2 rounded-md">
            <a href="${SCHEDULE_LINK}" class="text-white">Schedule a call</a>
          </button>
          <p>We're looking forward to chatting with you.</p>
          <p>Best wishes,<br />The ChainFundIt Team</p>
        </div>
      </body>
    </html>
  `;
}

function buildRejectionEmail(fullName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
          .container { max-width: 600px; margin: 0 auto; padding: 24px; }
          .header { text-align: center; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; }
          .logo-img { max-width: 160px; height: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="ChainFundIt Logo" class="logo-img" />
          </div>
          <p>Hi ${fullName},</p>
          <p>
            Thank you so much for taking the time to apply to the ChainFundIt Ambassador
            programme and for your interest in the work we're doing.
          </p>
          <p>
            We received a strong number of applications, and after careful consideration,
            we won't be progressing with your application at this stage.
          </p>
          <p>
            That said, we truly appreciate your interest in storytelling and social impact,
            and we encourage you to keep an eye on future opportunities with ChainFundIt.
          </p>
          <p>We wish you all the best in your creative and professional journey.</p>
          <p>Warm regards,<br />The ChainFundIt Team</p>
        </div>
      </body>
    </html>
  `;
}
