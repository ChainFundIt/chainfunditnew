import {
  sendAdminEmails,
  sendApplicantEmail,
} from "@/lib/notifications/application-notification-utils";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";

interface PartnershipApplicationEmailData {
  fullName: string;
  email: string;
  cityState: string;
  availability: string;
  applicationId: string;
}

export async function notifyAdminsOfPartnershipApplication(
  data: PartnershipApplicationEmailData
) {
  try {
    await sendAdminEmail(data);
  } catch (error) {
    console.error("Error notifying admins of partnership application:", error);
  }
}

export async function sendPartnershipApplicationConfirmation(
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
                Thanks for applying for the Partnerships & Growth Associate role.
                We have received your application and will review it shortly.
              </p>
              <p style="text-align: center;">
                <a href="${appUrl}/careers" class="button">View Careers</a>
              </p>
            </div>
            <div class="footer">
              <p>ChainFundIt | campaigns@chainfundit.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendApplicantEmail({
      recipientEmail,
      subject: "We received your application",
      html,
    });
  } catch (error) {
    console.error("Error sending partnership confirmation email:", error);
  }
}

async function sendAdminEmail(data: PartnershipApplicationEmailData) {
  const adminUrl = `${appUrl}/admin/partnership-applications`;
  const subject = `New Partnerships & Growth Application: ${data.fullName}`;
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
            <h1>New Partnership Application</h1>
          </div>
          <div class="content">
            <p>A new Partnerships & Growth Associate application has been submitted.</p>
            <div class="details">
              <div class="row"><span class="label">Name:</span><span>${data.fullName}</span></div>
              <div class="row"><span class="label">Email:</span><span>${data.email}</span></div>
              <div class="row"><span class="label">City/State:</span><span>${data.cityState}</span></div>
              <div class="row"><span class="label">Availability:</span><span>${data.availability}</span></div>
            </div>
            <div style="text-align: center;">
              <a href="${adminUrl}" class="button">Review applications</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendAdminEmails({
    subject,
    html,
    respectEmailEnabled: false,
  });
}
