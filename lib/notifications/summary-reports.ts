import { Resend } from 'resend';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/schema/user-preferences';
import { adminSettings } from '@/lib/schema/admin-settings';
import { users, campaigns, donations } from '@/lib/schema';
import { charityDonations, charities } from '@/lib/schema/charities';
import { eq, and, gte, lte, sum, count, desc, or, inArray } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

interface UserSummaryData {
  userId: string;
  userName: string;
  userEmail: string;
  period: 'daily' | 'weekly';
  startDate: Date;
  endDate: Date;
  stats: {
    totalDonations: number;
    totalAmount: number;
    primaryCurrency: string;
    currencyBreakdown: Record<string, number>;
    activeCampaigns: number;
    newDonations: number;
    newDonationsAmount: number;
    topCampaigns: Array<{
      id: string;
      title: string;
      amount: number;
      currency: string;
      donationCount: number;
    }>;
    recentDonations: Array<{
      amount: number;
      currency: string;
      campaignTitle: string;
      donorName: string | null;
      isAnonymous: boolean;
      createdAt: Date;
    }>;
  };
}

interface AdminSummaryData {
  userId: string;
  userName: string;
  userEmail: string;
  period: 'daily' | 'weekly';
  startDate: Date;
  endDate: Date;
  stats: {
    totalDonations: number;
    totalCharityDonations: number;
    totalCampaignDonations: number;
    totalAmount: number;
    totalCharityAmount: number;
    totalCampaignAmount: number;
    newUsers: number;
    newCampaigns: number;
    activeCampaigns: number;
    pendingPayouts: number;
    currencyBreakdown: Record<string, number>;
    topCampaigns: Array<{
      id: string;
      title: string;
      amount: number;
      currency: string;
    }>;
    topCharities: Array<{
      id: string;
      name: string;
      amount: number;
      currency: string;
    }>;
  };
}

/**
 * Get user summary data for a specific period
 */
export async function getUserSummaryData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<UserSummaryData | null> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return null;
    }

    // Get user's campaigns
    const userCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.creatorId, userId));

    const campaignIds = userCampaigns.map(c => c.id);

    if (campaignIds.length === 0) {
      // User has no campaigns, return empty summary
      return {
        userId: user.id,
        userName: user.fullName || 'User',
        userEmail: user.email,
        period: (endDate.getTime() - startDate.getTime()) <= 86400000 ? 'daily' : 'weekly',
        startDate,
        endDate,
        stats: {
          totalDonations: 0,
          totalAmount: 0,
          primaryCurrency: 'NGN',
          currencyBreakdown: {},
          activeCampaigns: 0,
          newDonations: 0,
          newDonationsAmount: 0,
          topCampaigns: [],
          recentDonations: [],
        },
      };
    }

    // Get all donations for user's campaigns in the period
    const periodDonations = await db
      .select({
        id: donations.id,
        amount: donations.amount,
        currency: donations.currency,
        campaignId: donations.campaignId,
        donorId: donations.donorId,
        isAnonymous: donations.isAnonymous,
        createdAt: donations.createdAt,
        campaignTitle: campaigns.title,
        donorName: users.fullName,
      })
      .from(donations)
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .leftJoin(users, eq(donations.donorId, users.id))
      .where(and(
        eq(donations.paymentStatus, 'completed'),
        inArray(donations.campaignId, campaignIds),
        gte(donations.createdAt, startDate),
        lte(donations.createdAt, endDate)
      ));

    // Calculate stats
    const totalDonations = periodDonations.length;
    const currencyBreakdown: Record<string, number> = {};
    let totalAmount = 0;

    periodDonations.forEach(d => {
      const amount = parseFloat(d.amount);
      totalAmount += amount;
      currencyBreakdown[d.currency] = (currencyBreakdown[d.currency] || 0) + amount;
    });

    const primaryCurrency = Object.keys(currencyBreakdown).reduce((a, b) =>
      currencyBreakdown[a] > currencyBreakdown[b] ? a : b, 'NGN'
    );

    // Get campaign stats
    const campaignStats = await Promise.all(
      campaignIds.map(async (campaignId) => {
        const campaignDonations = periodDonations.filter(d => d.campaignId === campaignId);
        const campaignAmount = campaignDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
        const campaign = userCampaigns.find(c => c.id === campaignId);
        
        return {
          id: campaignId,
          title: campaign?.title || 'Unknown Campaign',
          amount: campaignAmount,
          currency: campaign?.currency || 'NGN',
          donationCount: campaignDonations.length,
        };
      })
    );

    const topCampaigns = campaignStats
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const recentDonations = periodDonations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(d => ({
        amount: parseFloat(d.amount),
        currency: d.currency,
        campaignTitle: d.campaignTitle || 'Unknown Campaign',
        donorName: d.isAnonymous ? null : d.donorName,
        isAnonymous: d.isAnonymous,
        createdAt: new Date(d.createdAt),
      }));

    const activeCampaigns = userCampaigns.filter(c => c.isActive && c.status === 'active').length;

    return {
      userId: user.id,
      userName: user.fullName || 'User',
      userEmail: user.email,
      period: (endDate.getTime() - startDate.getTime()) <= 86400000 ? 'daily' : 'weekly',
      startDate,
      endDate,
      stats: {
        totalDonations,
        totalAmount,
        primaryCurrency,
        currencyBreakdown,
        activeCampaigns,
        newDonations: totalDonations,
        newDonationsAmount: totalAmount,
        topCampaigns,
        recentDonations,
      },
    };
  } catch (error) {
    console.error('Error getting user summary data:', error);
    return null;
  }
}

/**
 * Get admin summary data for a specific period
 */
export async function getAdminSummaryData(
  startDate: Date,
  endDate: Date
): Promise<AdminSummaryData | null> {
  try {
    // This will be used for all admins, so we don't need a specific user
    // Get platform-wide stats

    // Get campaign donations in period
    const campaignDonationsResult = await db
      .select({
        total: sum(donations.amount),
        count: count(),
        currency: donations.currency,
      })
      .from(donations)
      .where(and(
        eq(donations.paymentStatus, 'completed'),
        gte(donations.createdAt, startDate),
        lte(donations.createdAt, endDate)
      ))
      .groupBy(donations.currency);

    // Get charity donations in period
    const charityDonationsResult = await db
      .select({
        total: sum(charityDonations.amount),
        count: count(),
        currency: charityDonations.currency,
      })
      .from(charityDonations)
      .where(and(
        eq(charityDonations.paymentStatus, 'completed'),
        gte(charityDonations.createdAt, startDate),
        lte(charityDonations.createdAt, endDate)
      ))
      .groupBy(charityDonations.currency);

    // Calculate totals
    let totalCampaignAmount = 0;
    let totalCharityAmount = 0;
    let totalCampaignDonations = 0;
    let totalCharityDonations = 0;
    const currencyBreakdown: Record<string, number> = {};

    campaignDonationsResult.forEach(r => {
      const amount = parseFloat(r.total || '0');
      totalCampaignAmount += amount;
      totalCampaignDonations += r.count;
      currencyBreakdown[r.currency] = (currencyBreakdown[r.currency] || 0) + amount;
    });

    charityDonationsResult.forEach(r => {
      const amount = parseFloat(r.total || '0');
      totalCharityAmount += amount;
      totalCharityDonations += r.count;
      currencyBreakdown[r.currency] = (currencyBreakdown[r.currency] || 0) + amount;
    });

    // Get new users
    const newUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        gte(users.createdAt, startDate),
        lte(users.createdAt, endDate)
      ));

    // Get new campaigns
    const newCampaignsResult = await db
      .select({ count: count() })
      .from(campaigns)
      .where(and(
        gte(campaigns.createdAt, startDate),
        lte(campaigns.createdAt, endDate)
      ));

    // Get active campaigns
    const activeCampaignsResult = await db
      .select({ count: count() })
      .from(campaigns)
      .where(and(
        eq(campaigns.isActive, true),
        eq(campaigns.status, 'active')
      ));

    // This is a template - will be filled per admin user
    return {
      userId: '',
      userName: 'Admin',
      userEmail: '',
      period: (endDate.getTime() - startDate.getTime()) <= 86400000 ? 'daily' : 'weekly',
      startDate,
      endDate,
      stats: {
        totalDonations: totalCampaignDonations + totalCharityDonations,
        totalCharityDonations,
        totalCampaignDonations,
        totalAmount: totalCampaignAmount + totalCharityAmount,
        totalCharityAmount,
        totalCampaignAmount,
        newUsers: newUsersResult[0]?.count || 0,
        newCampaigns: newCampaignsResult[0]?.count || 0,
        activeCampaigns: activeCampaignsResult[0]?.count || 0,
        pendingPayouts: 0, // TODO: Get actual pending payouts count
        currencyBreakdown,
        topCampaigns: [], // TODO: Get top campaigns
        topCharities: [], // TODO: Get top charities
      },
    };
  } catch (error) {
    console.error('Error getting admin summary data:', error);
    return null;
  }
}

/**
 * Send daily summary email to a user
 */
export async function sendUserDailySummary(userId: string) {
  try {
    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (!preferences || !preferences.dailySummaryEnabled || !preferences.emailNotificationsEnabled) {
      return { sent: false, reason: 'Daily summary disabled or email notifications disabled' };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { sent: false, reason: 'User not found' };
    }

    // Get yesterday's date range
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 1);

    const summaryData = await getUserSummaryData(userId, startDate, endDate);
    if (!summaryData) {
      return { sent: false, reason: 'Failed to get summary data' };
    }

    const recipientEmail = preferences.notificationEmail || user.email;
    await sendUserSummaryEmail(recipientEmail, summaryData);

    return { sent: true, email: recipientEmail };
  } catch (error) {
    console.error('Error sending daily summary:', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send weekly summary email to a user
 */
export async function sendUserWeeklySummary(userId: string) {
  try {
    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (!preferences || !preferences.weeklySummaryEnabled || !preferences.emailNotificationsEnabled) {
      return { sent: false, reason: 'Weekly summary disabled or email notifications disabled' };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { sent: false, reason: 'User not found' };
    }

    // Get last week's date range
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    const summaryData = await getUserSummaryData(userId, startDate, endDate);
    if (!summaryData) {
      return { sent: false, reason: 'Failed to get summary data' };
    }

    const recipientEmail = preferences.notificationEmail || user.email;
    await sendUserSummaryEmail(recipientEmail, summaryData);

    return { sent: true, email: recipientEmail };
  } catch (error) {
    console.error('Error sending weekly summary:', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send daily summary email to an admin
 */
export async function sendAdminDailySummary(adminUserId: string) {
  try {
    const settings = await db.query.adminSettings.findFirst({
      where: eq(adminSettings.userId, adminUserId),
    });

    if (!settings || !settings.dailySummaryEnabled || !settings.emailNotificationsEnabled) {
      return { sent: false, reason: 'Daily summary disabled or email notifications disabled' };
    }

    const admin = await db.query.users.findFirst({
      where: eq(users.id, adminUserId),
    });

    if (!admin) {
      return { sent: false, reason: 'Admin not found' };
    }

    // Get yesterday's date range
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 1);

    const summaryData = await getAdminSummaryData(startDate, endDate);
    if (!summaryData) {
      return { sent: false, reason: 'Failed to get summary data' };
    }

    // Update with admin-specific info
    summaryData.userId = admin.id;
    summaryData.userName = admin.fullName || 'Admin';
    summaryData.userEmail = admin.email;

    const recipientEmail = settings.notificationEmail || admin.email;
    await sendAdminSummaryEmail(recipientEmail, summaryData);

    return { sent: true, email: recipientEmail };
  } catch (error) {
    console.error('Error sending admin daily summary:', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send weekly summary email to an admin
 */
export async function sendAdminWeeklySummary(adminUserId: string) {
  try {
    const settings = await db.query.adminSettings.findFirst({
      where: eq(adminSettings.userId, adminUserId),
    });

    if (!settings || !settings.weeklySummaryEnabled || !settings.emailNotificationsEnabled) {
      return { sent: false, reason: 'Weekly summary disabled or email notifications disabled' };
    }

    const admin = await db.query.users.findFirst({
      where: eq(users.id, adminUserId),
    });

    if (!admin) {
      return { sent: false, reason: 'Admin not found' };
    }

    // Get last week's date range
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    const summaryData = await getAdminSummaryData(startDate, endDate);
    if (!summaryData) {
      return { sent: false, reason: 'Failed to get summary data' };
    }

    // Update with admin-specific info
    summaryData.userId = admin.id;
    summaryData.userName = admin.fullName || 'Admin';
    summaryData.userEmail = admin.email;

    const recipientEmail = settings.notificationEmail || admin.email;
    await sendAdminSummaryEmail(recipientEmail, summaryData);

    return { sent: true, email: recipientEmail };
  } catch (error) {
    console.error('Error sending admin weekly summary:', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send user summary email
 */
async function sendUserSummaryEmail(recipientEmail: string, data: UserSummaryData) {
  try {
    const periodLabel = data.period === 'daily' ? 'Daily' : 'Weekly';
    const dateRange = `${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}`;
    
    const currencySymbol = 
      data.stats.primaryCurrency === 'NGN' ? '₦' :
      data.stats.primaryCurrency === 'GBP' ? '£' :
      data.stats.primaryCurrency === 'EUR' ? '€' : '$';

    const formattedAmount = currencySymbol + data.stats.totalAmount.toLocaleString('en-US', {
      minimumFractionDigits: data.stats.primaryCurrency === 'NGN' ? 0 : 2,
      maximumFractionDigits: data.stats.primaryCurrency === 'NGN' ? 0 : 2,
    });

    const subject = `${periodLabel} Campaign Summary - ${dateRange}`;

    const topCampaignsHtml = data.stats.topCampaigns.length > 0
      ? data.stats.topCampaigns.map(campaign => {
          const symbol = campaign.currency === 'NGN' ? '₦' : campaign.currency === 'GBP' ? '£' : campaign.currency === 'EUR' ? '€' : '$';
          return `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${campaign.title}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${symbol}${campaign.amount.toLocaleString()}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${campaign.donationCount}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="3" style="padding: 20px; text-align: center; color: #6b7280;">No donations this period</td></tr>';

    const recentDonationsHtml = data.stats.recentDonations.length > 0
      ? data.stats.recentDonations.map(donation => {
          const symbol = donation.currency === 'NGN' ? '₦' : donation.currency === 'GBP' ? '£' : donation.currency === 'EUR' ? '€' : '$';
          return `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${donation.isAnonymous ? 'Anonymous' : donation.donorName || 'Unknown'}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${donation.campaignTitle}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${symbol}${donation.amount.toLocaleString()}</td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="3" style="padding: 20px; text-align: center; color: #6b7280;">No recent donations</td></tr>';

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
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
            .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #16a34a; margin: 10px 0; }
            .stat-label { color: #6b7280; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f9fafb; padding: 10px; text-align: left; font-weight: 600; color: #111827; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${(() => {
                const logoUrl = `/images/logo.svg`;
                return `<img src="${logoUrl}" alt="ChainFundit Logo" class="logo-img" />`;
              })()}
              <h1>📊 ${periodLabel} Campaign Summary</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${dateRange}</p>
            </div>
            
            <div class="content">
              <h2 style="color: #111827; margin-top: 0;">Hello ${data.userName}!</h2>
              <p>Here's your ${periodLabel.toLowerCase()} campaign performance summary:</p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${data.stats.totalDonations}</div>
                  <div class="stat-label">Total Donations</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${formattedAmount}</div>
                  <div class="stat-label">Total Raised</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.activeCampaigns}</div>
                  <div class="stat-label">Active Campaigns</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.newDonations}</div>
                  <div class="stat-label">New This Period</div>
                </div>
              </div>

              ${data.stats.topCampaigns.length > 0 ? `
                <h3 style="color: #111827; margin-top: 30px;">Top Performing Campaigns</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th style="text-align: right;">Amount</th>
                      <th style="text-align: center;">Donations</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topCampaignsHtml}
                  </tbody>
                </table>
              ` : ''}

              ${data.stats.recentDonations.length > 0 ? `
                <h3 style="color: #111827; margin-top: 30px;">Recent Donations</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Donor</th>
                      <th>Campaign</th>
                      <th style="text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recentDonationsHtml}
                  </tbody>
                </table>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}dashboard" class="button">
                  View Dashboard →
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>ChainFundit Campaign Summary</p>
              <p>To manage your notification preferences, visit <a href="${process.env.NEXT_PUBLIC_APP_URL}settings/preferences">Settings</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'notifications@chainfundit.com',
      to: recipientEmail,
      subject,
      html,
    });

    console.log(`✅ ${periodLabel} summary sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending user summary email:', error);
    throw error;
  }
}

/**
 * Send admin summary email
 */
async function sendAdminSummaryEmail(recipientEmail: string, data: AdminSummaryData) {
  try {
    const periodLabel = data.period === 'daily' ? 'Daily' : 'Weekly';
    const dateRange = `${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}`;
    
    const currencySymbol = '₦'; // Default, could be calculated from breakdown
    const formattedAmount = currencySymbol + data.stats.totalAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    const subject = `${periodLabel} Platform Summary - ${dateRange}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo-img { max-width: 150px; height: auto; margin-bottom: 15px; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
            .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; margin: 10px 0; }
            .stat-label { color: #6b7280; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${(() => {
                const logoUrl = `/images/logo.svg`;
                return `<img src="${logoUrl}" alt="ChainFundit Logo" class="logo-img" />`;
              })()}
              <h1>📊 ${periodLabel} Platform Summary</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${dateRange}</p>
            </div>
            
            <div class="content">
              <h2 style="color: #111827; margin-top: 0;">Hello ${data.userName}!</h2>
              <p>Here's your ${periodLabel.toLowerCase()} platform activity summary:</p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${data.stats.totalDonations}</div>
                  <div class="stat-label">Total Donations</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${formattedAmount}</div>
                  <div class="stat-label">Total Amount</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.totalCampaignDonations}</div>
                  <div class="stat-label">Campaign Donations</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.totalCharityDonations}</div>
                  <div class="stat-label">Charity Donations</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.newUsers}</div>
                  <div class="stat-label">New Users</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.newCampaigns}</div>
                  <div class="stat-label">New Campaigns</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.activeCampaigns}</div>
                  <div class="stat-label">Active Campaigns</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.pendingPayouts}</div>
                  <div class="stat-label">Pending Payouts</div>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}admin/dashboard" class="button">
                  View Admin Dashboard →
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>ChainFundit Admin Summary</p>
              <p>To manage your notification preferences, visit <a href="${process.env.NEXT_PUBLIC_APP_URL}admin/settings">Admin Settings</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'notifications@chainfundit.com',
      to: recipientEmail,
      subject,
      html,
    });

    console.log(`✅ Admin ${periodLabel} summary sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending admin summary email:', error);
    throw error;
  }
}

