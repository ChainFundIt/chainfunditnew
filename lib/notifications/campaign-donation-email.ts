import { Resend } from 'resend';
import { db } from '@/lib/db';
import { users, chainers } from '@/lib/schema';
import { recurringDonationPayments, recurringDonations } from '@/lib/schema/recurring-donations';
import { eq } from 'drizzle-orm';

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

interface CampaignDonationEmailData {
  campaignCreatorEmail: string;
  campaignCreatorName: string;
  campaignTitle: string;
  campaignSlug?: string;
  donationAmount: number | string;
  donationCurrency: string;
  donorName?: string;
  isAnonymous: boolean;
  message?: string;
  isLargeDonation: boolean;
  donationId: string;
  referralAmbassadorName?: string;
  referralAmbassadorCode?: string;
  referralLink?: string;
  /** When set, donation is from a recurring gift; copy says "Monthly/Quarterly/Yearly donation" instead of "New donation" */
  recurringPeriod?: 'monthly' | 'quarterly' | 'yearly';
}

/**
 * Send email to campaign creator when they receive a donation
 */
export async function sendCampaignDonationEmail(data: CampaignDonationEmailData) {
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

    if (!data.campaignCreatorEmail || data.campaignCreatorEmail.includes('guest_')) {
      console.log(`Skipping campaign creator email for ${data.campaignCreatorEmail}`);
      return { sent: false, reason: 'Invalid or guest email' };
    }

    const currencySymbol = 
      data.donationCurrency === 'NGN' ? '₦' :
      data.donationCurrency === 'GBP' ? '£' :
      data.donationCurrency === 'EUR' ? '€' : '$';

    const amount = typeof data.donationAmount === 'string' ? parseFloat(data.donationAmount) : data.donationAmount;
    const isNGN = data.donationCurrency === 'NGN';
    const formattedAmount = isNGN 
      ? Math.round(amount).toLocaleString('en-US')
      : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formattedTotal = `${currencySymbol}${formattedAmount}`;

    const recurringLabel = data.recurringPeriod
      ? data.recurringPeriod === 'monthly'
        ? 'Monthly donation'
        : data.recurringPeriod === 'quarterly'
          ? 'Quarterly donation'
          : data.recurringPeriod === 'yearly'
            ? 'Yearly donation'
            : 'Recurring donation'
      : null;

    const subject = data.isLargeDonation
      ? `🎉 Large Donation Received: ${formattedTotal} for ${data.campaignTitle}!`
      : recurringLabel
        ? `${recurringLabel} received: ${formattedTotal} for ${data.campaignTitle}!`
        : `New Donation Received: ${formattedTotal} for ${data.campaignTitle}!`;

    // Get campaign URL
    const campaignUrl = data.campaignSlug 
      ? `${process.env.NEXT_PUBLIC_APP_URL}campaign/${data.campaignSlug}`
      : `${process.env.NEXT_PUBLIC_APP_URL}campaigns`;

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
            .ambassador-box { background: #ecfeff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .ambassador-box strong { color: #0f172a; }
            .ambassador-link { color: #0369a1; text-decoration: none; font-weight: 600; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .large-donation-badge { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="ChainFundit Logo" class="logo-img" />
              <h1>${data.isLargeDonation ? '🎉 Large Donation Received!' : recurringLabel ? `✨ ${recurringLabel} Received!` : '✨ New Donation Received!'}</h1>
            </div>
            
            <div class="content">
              <p>Hello ${data.campaignCreatorName},</p>
              
              <p>Great news! Your campaign <strong>${data.campaignTitle}</strong> just received ${data.isLargeDonation ? 'a large' : recurringLabel ? `a ${recurringLabel.toLowerCase()}` : 'a new'} donation!</p>
              
              ${data.isLargeDonation ? `
                <div class="large-donation-badge">
                  <strong>🌟 Large Donation Alert!</strong><br/>
                  This donation exceeds your large donation threshold.
                </div>
              ` : ''}
              
              <div class="amount">${formattedTotal}</div>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Campaign:</span>
                  <span class="detail-value">${data.campaignTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Donation Amount:</span>
                  <span class="detail-value">${formattedTotal} ${data.donationCurrency}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Donor:</span>
                  <span class="detail-value">${data.isAnonymous ? 'Anonymous' : (data.donorName || 'Anonymous')}</span>
                </div>
                ${data.message ? `
                <div class="detail-row">
                  <span class="detail-label">Message:</span>
                  <span class="detail-value">${data.message}</span>
                </div>
                ` : ''}
              </div>
              
              ${data.message ? `
                <div class="message-box">
                  <strong>💬 Donor Message:</strong><br/>
                  "${data.message}"
                </div>
              ` : ''}
              
              ${data.referralAmbassadorName ? `
                <div class="ambassador-box">
                  <strong>Referral Spotlight:</strong><br/>
                  This gift arrived through ambassador ${data.referralAmbassadorName}${data.referralAmbassadorCode ? ` (code: ${data.referralAmbassadorCode})` : ''}.
                  ${data.referralLink ? `<div style="margin-top: 8px;"><a href="${data.referralLink}" class="ambassador-link">View the referral chain →</a></div>` : ''}
                </div>
              ` : ''}
              
              <p>This donation brings you closer to your campaign goal. Keep up the great work!</p>
              
              <div style="text-align: center;">
                <a href="${campaignUrl}" class="button">
                  View Campaign →
                </a>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                <strong>Tip:</strong> Consider sending a thank you message to your donor through the campaign dashboard to show your appreciation!
              </p>
            </div>
            
            <div class="footer">
              <p>ChainFundit Campaign Notifications</p>
              <p>To manage your notification preferences, visit <a href="${process.env.NEXT_PUBLIC_APP_URL}dashboard/settings">Settings</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: data.campaignCreatorEmail,
      subject,
      html,
    });

    console.log(`✅ Campaign donation email sent to ${data.campaignCreatorEmail}`);
    return { sent: true, email: data.campaignCreatorEmail };
  } catch (error) {
    console.error('Error sending campaign donation email:', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send campaign donation email using donation ID
 * Fetches all necessary data from database
 */
export async function sendCampaignDonationEmailById(
  donationId: string,
  campaignCreatorId: string,
  isLargeDonation: boolean = false
) {
  try {
    // Get donation with campaign details
    const { donations, campaigns } = await import('@/lib/schema');
    
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

    // Get campaign creator details
    const creator = await db.query.users.findFirst({
      where: eq(users.id, campaignCreatorId),
    });

    if (!creator || !creator.email) {
      console.error('Campaign creator not found or has no email:', campaignCreatorId);
      return { sent: false, reason: 'Campaign creator not found or has no email' };
    }

    // Get donor name if not anonymous
    let donorName: string | undefined;
    if (!donationData.isAnonymous && donationData.donorId) {
      const donor = await db.query.users.findFirst({
        where: eq(users.id, donationData.donorId),
      });
      if (donor) {
        donorName = donor.fullName || undefined;
      }
    }

    let referralAmbassadorName: string | undefined;
    let referralAmbassadorCode: string | undefined;
    let referralLink: string | undefined;

    if (donationData.chainerId) {
      const ambassador = await db
        .select({
          referralCode: chainers.referralCode,
          ambassadorName: users.fullName,
        })
        .from(chainers)
        .leftJoin(users, eq(chainers.userId, users.id))
        .where(eq(chainers.id, donationData.chainerId))
        .limit(1);

      if (ambassador.length) {
        referralAmbassadorName =
          ambassador[0].ambassadorName || 'Chain Ambassador';
        referralAmbassadorCode = ambassador[0].referralCode || undefined;

        if (referralAmbassadorCode) {
          const baseAppUrl =
            process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
            'https://chainfundit.com';
          referralLink = `${baseAppUrl}/c/${referralAmbassadorCode}`;
        }
      }
    }

    // Check if this donation is from a recurring (subscription) payment
    let recurringPeriod: 'monthly' | 'quarterly' | 'yearly' | undefined;
    const paymentLink = await db
      .select({
        period: recurringDonations.period,
      })
      .from(recurringDonationPayments)
      .innerJoin(recurringDonations, eq(recurringDonationPayments.recurringDonationId, recurringDonations.id))
      .where(eq(recurringDonationPayments.donationId, donationId))
      .limit(1);
    if (paymentLink.length && ['monthly', 'quarterly', 'yearly'].includes(paymentLink[0].period)) {
      recurringPeriod = paymentLink[0].period as 'monthly' | 'quarterly' | 'yearly';
    }

    const emailData: CampaignDonationEmailData = {
      campaignCreatorEmail: creator.email,
      campaignCreatorName: creator.fullName || 'Campaign Creator',
      campaignTitle: campaignData.title,
      campaignSlug: campaignData.slug,
      donationAmount: donationData.amount,
      donationCurrency: donationData.currency,
      donorName,
      isAnonymous: donationData.isAnonymous,
      message: donationData.message || undefined,
      isLargeDonation,
      donationId: donationData.id,
      referralAmbassadorName,
      referralAmbassadorCode,
      referralLink,
      recurringPeriod,
    };

    return await sendCampaignDonationEmail(emailData);
  } catch (error) {
    console.error('Error sending campaign donation email by ID:', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}
