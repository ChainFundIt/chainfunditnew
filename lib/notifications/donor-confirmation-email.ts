import { Resend } from 'resend';
import { db } from '@/lib/db';
import { donations, campaigns } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

interface DonorConfirmationData {
  donationId: string;
  campaignId: string;
  campaignTitle: string;
  campaignSlug?: string;
  amount: number | string;
  currency: string;
  donorName: string;
  donorEmail: string;
  message?: string;
  isAnonymous: boolean;
  transactionId?: string;
  createdAt: Date;
}

/**
 * Send confirmation email to donor after successful campaign donation
 */
export async function sendDonorConfirmationEmail(data: DonorConfirmationData) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return { sent: false, reason: 'RESEND_API_KEY not configured' };
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error('RESEND_FROM_EMAIL is not configured');
      return { sent: false, reason: 'RESEND_FROM_EMAIL not configured' };
    }

    if (!data.donorEmail || data.donorEmail.includes('guest_')) {
      // Skip email for guest/anonymous users without real emails
      console.log(`Skipping donor email for ${data.donorEmail}`);
      return { sent: false, reason: 'Invalid or guest email' };
    }

    const currencySymbol = 
      data.currency === 'NGN' ? '₦' :
      data.currency === 'GBP' ? '£' :
      data.currency === 'EUR' ? '€' : '$';

    const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
    const isNGN = data.currency === 'NGN';
    const formattedAmount = isNGN 
      ? Math.round(amount).toLocaleString('en-US')
      : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formattedTotal = `${currencySymbol}${formattedAmount}`;

    const subject = `Thank You for Your Donation to ${data.campaignTitle}!`;

    // Get campaign URL
    const campaignUrl = data.campaignSlug 
      ? `${process.env.NEXT_PUBLIC_APP_URL}campaign/${data.campaignSlug}`
      : `${process.env.NEXT_PUBLIC_APP_URL}campaign/${data.campaignId}`;

    // Get logo URL
    const logoUrl = `/images/logo.svg`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo-img { max-width: 150px; height: auto; margin-bottom: 15px; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .amount { font-size: 36px; font-weight: bold; color: #16a34a; margin: 20px 0; text-align: center; }
            .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #6b7280; }
            .detail-value { color: #111827; }
            .message-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .thank-you { font-size: 24px; color: #16a34a; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="ChainFundit Logo" class="logo-img" />
              <h1>🎉 Thank You for Your Donation!</h1>
            </div>
            
            <div class="content">
              <div class="thank-you">Your generosity makes a difference!</div>
              
              <p>Dear ${data.donorName},</p>
              
              <p>We wanted to take a moment to express our heartfelt gratitude for your generous donation to <strong>${data.campaignTitle}</strong>.</p>
              
              <div class="amount">${formattedTotal}</div>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Campaign:</span>
                  <span class="detail-value">${data.campaignTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount:</span>
                  <span class="detail-value">${formattedTotal} ${data.currency}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Donation ID:</span>
                  <span class="detail-value" style="font-family: monospace;">${data.donationId.substring(0, 8)}...</span>
                </div>
                ${data.transactionId ? `
                <div class="detail-row">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value" style="font-family: monospace;">${data.transactionId.substring(0, 12)}...</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${new Date(data.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                ${data.isAnonymous ? `
                <div class="detail-row">
                  <span class="detail-label">Visibility:</span>
                  <span class="detail-value">Anonymous Donation</span>
                </div>
                ` : ''}
              </div>
              
              ${data.message ? `
                <div class="message-box">
                  <strong>💬 Your Message:</strong><br/>
                  "${data.message}"
                </div>
              ` : ''}
              
              <p>Your contribution will help make a real difference. Every donation, no matter the size, brings us closer to achieving the campaign's goal.</p>
              
              <div style="text-align: center;">
                <a href="${campaignUrl}" class="button">
                  View Campaign →
                </a>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                <strong>Receipt Information:</strong><br/>
                This email serves as your donation receipt. Please keep it for your records. 
                If you have any questions about your donation, please contact our support team.
              </p>
            </div>
            
            <div class="footer">
              <p>ChainFundit Donation Confirmation</p>
              <p>Thank you for supporting this cause!</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}">Visit ChainFundit</a> | 
                <a href="${process.env.NEXT_PUBLIC_APP_URL}support">Support</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'notifications@chainfundit.com',
      to: data.donorEmail,
      subject,
      html,
    });

    console.log(`✅ Donor confirmation email sent to ${data.donorEmail}`);
    return { sent: true, email: data.donorEmail };
  } catch (error) {
    console.error('Error sending donor confirmation email:', error);
    // Don't throw - email failure shouldn't break payment flow
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send donor confirmation email using donation ID
 * Fetches all necessary data from database
 */
export async function sendDonorConfirmationEmailById(donationId: string) {
  try {
    // Get donation with campaign details
    const donation = await db
      .select({
        donation: donations,
        campaign: campaigns,
      })
      .from(donations)
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation.length || !donation[0].campaign) {
      console.error('Donation or campaign not found:', donationId);
      return { sent: false, reason: 'Donation or campaign not found' };
    }

    const donationData = donation[0].donation;
    const campaignData = donation[0].campaign;

    // Get donor email - check if donorId exists and get user email
    let donorEmail = '';
    let donorName = 'Anonymous';

    if (donationData.donorId) {
      const { users } = await import('@/lib/schema');
      const donor = await db.query.users.findFirst({
        where: eq(users.id, donationData.donorId),
      });

      if (donor) {
        donorEmail = donor.email;
        donorName = donor.fullName || 'Donor';
      }
    }

    // If no donor email found, skip sending
    if (!donorEmail || donorEmail.includes('guest_')) {
      return { sent: false, reason: 'No valid donor email found' };
    }

    const confirmationData: DonorConfirmationData = {
      donationId: donationData.id,
      campaignId: campaignData.id,
      campaignTitle: campaignData.title,
      campaignSlug: campaignData.slug,
      amount: donationData.amount,
      currency: donationData.currency,
      donorName: donationData.isAnonymous ? 'Anonymous' : donorName,
      donorEmail,
      message: donationData.message || undefined,
      isAnonymous: donationData.isAnonymous,
      transactionId: donationData.paymentIntentId || undefined,
      createdAt: donationData.createdAt || new Date(),
    };

    return await sendDonorConfirmationEmail(confirmationData);
  } catch (error) {
    console.error('Error sending donor confirmation email by ID:', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

