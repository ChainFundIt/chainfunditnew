import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  await resend.emails.send({
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
        </style>
      </head>
      <body>
        <div class="container">
          <p>Hi ${fullName},</p>
          <p>
            Thank you for applying to the ChainFundIt Ambassador programme -- we really
            enjoyed reviewing your application.
          </p>
          <p>
            We'd be happy to <strong>move you to the next stage</strong>, which is a short,
            informal conversation to get to know you better, talk through your interests,
            and answer any questions you may have.
          </p>
          <p>
            Please use the link below to <strong>schedule a quick call</strong> at a time
            that works for you:
          </p>
          <p>
            <a href="${SCHEDULE_LINK}">${SCHEDULE_LINK}</a>
          </p>
          <p>We're looking forward to chatting with you.</p>
          <p>Best wishes,<br /><strong>The ChainFundIt Team</strong></p>
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
        </style>
      </head>
      <body>
        <div class="container">
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
          <p>Warm regards,<br /><strong>The ChainFundIt Team</strong></p>
        </div>
      </body>
    </html>
  `;
}
