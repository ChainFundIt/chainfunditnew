import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ChainerDonationEmailData {
  chainerEmail: string;
  chainerName: string;
  campaignTitle: string;
  campaignSlug?: string | null;
  donationAmount: number;
  donationCurrency: string;
  donorName?: string | null;
  referralCode?: string | null;
}

export async function sendChainerDonationEmail(
  data: ChainerDonationEmailData
) {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      console.error('Resend email service not fully configured');
      return { sent: false, reason: 'Resend not configured' };
    }

    if (!data.chainerEmail) {
      return { sent: false, reason: 'Missing chainer email' };
    }

    const currencySymbol =
      data.donationCurrency === 'NGN'
        ? '₦'
        : data.donationCurrency === 'GBP'
        ? '£'
        : data.donationCurrency === 'EUR'
        ? '€'
        : '$';

    const formattedAmount = data.donationAmount.toLocaleString('en-US', {
      minimumFractionDigits: data.donationCurrency === 'NGN' ? 0 : 2,
      maximumFractionDigits: 2,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      'https://chainfundit.com';
    const ambassadorHubUrl = `${baseUrl}/dashboard/ambassador`;
    const campaignUrl = data.campaignSlug
      ? `${baseUrl}/campaign/${data.campaignSlug}`
      : `${baseUrl}/campaigns`;

    const donorDisplayName = data.donorName || 'A generous supporter';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; }
            .container { max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; }
            .card { background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); overflow: hidden; }
            .header { background: linear-gradient(135deg, #1d4ed8, #16a34a); color: white; padding: 32px 24px; text-align: center; }
            .header h1 { margin-bottom: 8px; }
            .content { padding: 32px 28px; }
            .amount { font-size: 42px; font-weight: 700; color: #16a34a; text-align: center; margin: 16px 0 24px; }
            .details { background: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
            .details div { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .details div:last-child { border-bottom: none; }
            .details span { font-size: 15px; }
            .cta { text-align: center; margin-top: 24px; }
            .cta a { display: inline-block; padding: 12px 28px; background: #111827; color: #fff; text-decoration: none; border-radius: 999px; font-weight: 600; }
            .footer { margin-top: 24px; text-align: center; font-size: 13px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <h1>You just fueled a campaign 🔗</h1>
                <p>A donation came in through your ChainFundIt chain link.</p>
              </div>
              <div class="content">
                <p>Hi ${data.chainerName},</p>
                <p>${donorDisplayName} just supported <strong>${data.campaignTitle}</strong> using your ambassador chain. Thanks for spreading the word!</p>
                <div class="amount">${currencySymbol}${formattedAmount}</div>
                <div class="details">
                  <div><span>Campaign</span><span>${data.campaignTitle}</span></div>
                  <div><span>Donation Amount</span><span>${currencySymbol}${formattedAmount} ${data.donationCurrency}</span></div>
                  ${
                    data.referralCode
                      ? `<div><span>Chain</span><span>${data.referralCode}</span></div>`
                      : ''
                  }
                  <div><span>Campaign Link</span><span><a href="${campaignUrl}">View campaign</a></span></div>
                </div>
                <p>Keep sharing your link to grow your impact and commission earnings. We’ll keep you posted as more donations arrive.</p>
                <div class="cta">
                  <a href="${ambassadorHubUrl}">Open Ambassador Dashboard</a>
                </div>
              </div>
              <div class="footer">
                <p>Raise funds. Support dreams. Join the movement.</p>
                <p><a href="https://www.chainfundit.com">www.chainfundit.com</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: data.chainerEmail,
      subject: `New donation via your chain for ${data.campaignTitle}`,
      html,
    });

    return { sent: true, email: data.chainerEmail };
  } catch (error) {
    console.error('Error sending chainer donation email:', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}
