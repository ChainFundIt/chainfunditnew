import { sendApplicantEmail } from "@/lib/notifications/application-notification-utils";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";
const logoUrl = `${appUrl}/images/logo.svg`;

type PartnershipDecision = "yes" | "no";

interface DecisionEmailPayload {
  fullName: string;
  email: string;
  decision: PartnershipDecision;
}

export async function sendPartnershipDecisionEmail({
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
      ? "Next steps: Partnerships & Growth Associate application"
      : "Update on your Partnerships & Growth Associate application";

  await sendApplicantEmail({
    recipientEmail: email,
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="ChainFundIt Logo" class="logo-img" />
          </div>
          <p>Hi ${fullName},</p>
          <p>
            Thank you for applying to the Partnerships & Growth Associate role -- we really
            enjoyed reviewing your application.
          </p>
          <p>
            We'd be happy to move you to the next stage, which is a short, informal
            conversation to get to know you better, talk through your interests, and
            answer any questions you may have.
          </p>
          <p>
            We'll reach out shortly with scheduling details.
          </p>
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
            Thank you so much for taking the time to apply to the Partnerships & Growth
            Associate role and for your interest in the work we're doing.
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
