import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface CampaignCreationEmailData {
  userEmail: string;
  userName: string;
  campaignTitle: string;
  campaignSlug: string;
  goalAmount: string;
  currency: string;
  campaignUrl: string;
  visibility: string;
  isChained: boolean;
}

export async function sendCampaignCreationEmail(data: CampaignCreationEmailData) {
  try {
    const {
      userEmail,
      userName,
      campaignTitle,
      campaignSlug,
      goalAmount,
      currency,
      campaignUrl,
      visibility,
      isChained,
    } = data;

    // Format currency symbol
    const currencySymbols: Record<string, string> = {
      GBP: '£',
      USD: '$',
      NGN: '₦',
      EUR: '€',
      CAD: 'C$',
    };
    const currencySymbol = currencySymbols[currency] || currency;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campaign Created Successfully - ChainFundIt</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #104901;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #104901;
            margin-bottom: 10px;
          }
          .success-icon {
            width: 60px;
            height: 60px;
            background-color: #10b981;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
          }
          .success-icon::before {
            content: "✓";
            color: white;
            font-size: 30px;
            font-weight: bold;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #104901;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 16px;
            color: #666;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #104901;
          }
          .info-card {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #104901;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
          }
          .info-row:last-child {
            margin-bottom: 0;
          }
          .info-label {
            font-weight: 600;
            color: #555;
          }
          .info-value {
            font-weight: 500;
            color: #333;
          }
          .campaign-highlight {
            background-color: #e8f5e8;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
            text-align: center;
          }
          .campaign-title {
            font-size: 20px;
            font-weight: bold;
            color: #104901;
            margin-bottom: 10px;
          }
          .campaign-goal {
            font-size: 18px;
            color: #5F8555;
            margin-top: 10px;
          }
          .cta-button {
            display: inline-block;
            background-color: #104901;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .cta-button:hover {
            background-color: #0d3d00;
          }
          .tips-section {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
          }
          .tips-title {
            font-weight: bold;
            color: #0c5460;
            margin-bottom: 10px;
          }
          .tips-list {
            margin: 0;
            padding-left: 20px;
            color: #0c5460;
          }
          .tips-list li {
            margin-bottom: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .footer a {
            color: #104901;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            .container {
              padding: 20px;
            }
            .info-row {
              flex-direction: column;
              gap: 5px;
            }
            .campaign-title {
              font-size: 18px;
            }
            .campaign-goal {
              font-size: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon"></div>
            <div class="logo">ChainFundIt</div>
            <div class="title">Campaign Created Successfully!</div>
            <div class="subtitle">Your fundraising campaign is now live</div>
          </div>

          <div class="content">
            <div class="greeting">Hello ${userName || 'there'},</div>
            
            <p>Congratulations! Your campaign <strong>"${campaignTitle}"</strong> has been successfully created and is now live on ChainFundIt.</p>

            <div class="campaign-highlight">
              <div class="campaign-title">${campaignTitle}</div>
              <div class="campaign-goal">Goal: ${currencySymbol}${parseFloat(goalAmount).toLocaleString()}</div>
            </div>

            <div class="info-card">
              <div class="info-row">
                <span class="info-label">Campaign URL:</span>
                <span class="info-value">${campaignUrl}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Visibility:</span>
                <span class="info-value">${visibility === 'public' ? 'Public' : 'Private'}</span>
              </div>
              ${isChained ? `
              <div class="info-row">
                <span class="info-label">Chained Campaign:</span>
                <span class="info-value">Yes</span>
              </div>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${campaignUrl}" class="cta-button">View Your Campaign</a>
            </div>

            <div class="tips-section">
              <div class="tips-title">💡 Tips to Maximize Your Campaign Success:</div>
              <ul class="tips-list">
                <li>Share your campaign link on social media platforms</li>
                <li>Reach out to friends, family, and your network</li>
                <li>Update your campaign story regularly with progress updates</li>
                <li>Engage with donors by responding to messages and comments</li>
                <li>Share milestones and achievements to keep momentum going</li>
                ${isChained ? '<li>Your campaign is chained - ambassadors can help promote it and earn commissions</li>' : ''}
              </ul>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Share your campaign link with your network</li>
              <li>Monitor your campaign progress from your dashboard</li>
              <li>Keep your supporters updated with campaign updates</li>
            </ul>

            <p>If you have any questions or need assistance, please don't hesitate to contact our support team. We're here to help make your fundraising journey successful!</p>

            <p>Best of luck with your campaign!</p>
            <p><strong>The ChainFundIt Team</strong></p>
          </div>

          <div class="footer">
            <p>This email was sent to ${userEmail}</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://chainfundit.com'}">ChainFundIt</a> | 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://chainfundit.com'}/support">Support</a> | 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://chainfundit.com'}/privacy">Privacy Policy</a>
            </p>
            <p>© ${new Date().getFullYear()} ChainFundIt. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Check if Resend is properly configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return null;
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error('RESEND_FROM_EMAIL is not configured');
      return null;
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: userEmail,
      subject: `Campaign Created: ${campaignTitle} - ChainFundIt`,
      html: emailHtml,
    });

    return result;
  } catch (error) {
    console.error('Error sending campaign creation email:', error);
    // Don't throw error - we don't want to fail campaign creation if email fails
    return null;
  }
}


