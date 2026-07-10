import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, users, donations, chainers, notifications } from '@/lib/schema';
import {
  sendCampaignHoldEmail,
  sendCampaignReactivatedEmail,
  sendCampaignVerificationPendingEmail,
} from '@/lib/notifications/campaign-status-emails';
import {
  DEFAULT_PLATFORM_FEE_PERCENT,
  resolveEffectivePlatformFeePercent,
} from '@/lib/payments/payout-fee-config';
import { eq, and, count, sum, desc } from 'drizzle-orm';

/**
 * GET /api/admin/campaigns/[id]
 * Get detailed information about a specific campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Get campaign details with creator info
    const campaign = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        description: campaigns.description,
        creatorId: campaigns.creatorId,
        goalAmount: campaigns.goalAmount,
        currentAmount: campaigns.currentAmount,
        currency: campaigns.currency,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        isActive: campaigns.isActive,
        isVerified: campaigns.isVerified,
        platformFeeOverrideEnabled: campaigns.platformFeeOverrideEnabled,
        platformFeeOverridePercent: campaigns.platformFeeOverridePercent,
        coverImageUrl: campaigns.coverImageUrl,
        creatorName: users.fullName,
        creatorEmail: users.email,
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.creatorId, users.id))
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign[0]) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Get campaign statistics
    const [donationStats] = await db
      .select({
        totalDonations: count(),
        totalAmount: sum(donations.amount),
      })
      .from(donations)
      .where(and(
        eq(donations.campaignId, campaignId),
        eq(donations.paymentStatus, 'completed')
      ));

    const [chainerStats] = await db
      .select({
        totalChainers: count(),
        totalReferrals: sum(chainers.totalReferrals),
        totalRaised: sum(chainers.totalRaised),
      })
      .from(chainers)
      .where(eq(chainers.campaignId, campaignId));

    // Reports not available in current schema
    const reportStats = { totalReports: 0 };

    // Get recent donations
    const recentDonations = await db
      .select({
        id: donations.id,
        amount: donations.amount,
        currency: donations.currency,
        paymentStatus: donations.paymentStatus,
        createdAt: donations.createdAt,
        donorId: donations.donorId,
        chainerId: donations.chainerId,
      })
      .from(donations)
      .where(eq(donations.campaignId, campaignId))
      .orderBy(desc(donations.createdAt))
      .limit(20);

    // Get campaign chainers
    const campaignChainers = await db
      .select({
        id: chainers.id,
        userId: chainers.userId,
        totalReferrals: chainers.totalReferrals,
        totalRaised: chainers.totalRaised,
        commissionEarned: chainers.commissionEarned,
        createdAt: chainers.createdAt,
      })
      .from(chainers)
      .where(eq(chainers.campaignId, campaignId))
      .orderBy(desc(chainers.totalReferrals))
      .limit(20);

    // Reports not available in current schema
    const campaignReportsList: any[] = [];

    const campaignDetails = {
      ...campaign[0],
      stats: {
        totalDonations: donationStats?.totalDonations || 0,
        totalDonationAmount: donationStats?.totalAmount || 0,
        totalChainers: chainerStats?.totalChainers || 0,
        totalReferrals: chainerStats?.totalReferrals || 0,
        totalChainerRaised: chainerStats?.totalRaised || 0,
        totalReports: reportStats?.totalReports || 0,
      },
      recentDonations,
      chainers: campaignChainers,
      reports: campaignReportsList,
    };

    return NextResponse.json(campaignDetails);

  } catch (error) {
    console.error('Error fetching campaign details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/campaigns/[id]
 * Update campaign information or perform actions
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const body = await request.json();
    const { action, ...updateData } = body;

    // Check if campaign exists
    const existingCampaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const creator = await db.query.users.findFirst({
      where: eq(users.id, existingCampaign.creatorId),
    });
    const creatorEmail = creator?.email || '';
    const creatorName =
      creator?.fullName || creatorEmail.split('@')[0] || 'there';
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'https://chainfundit.com';
    const campaignUrl = existingCampaign.slug
      ? `${baseUrl}/campaign/${existingCampaign.slug}`
      : baseUrl;

    let updatedCampaign;
    let skipVerificationPendingOutreach = false;

    switch (action) {
      case 'hold':
        updatedCampaign = await db
          .update(campaigns)
          .set({ 
            status: 'under_review',
            complianceStatus: 'in_review',
            reviewRequired: true,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(campaigns.id, campaignId))
          .returning();
        break;

      case 'activate':
        updatedCampaign = await db
          .update(campaigns)
          .set({ 
            status: 'active',
            complianceStatus: 'approved',
            reviewRequired: false,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(campaigns.id, campaignId))
          .returning();
        break;

      case 'pause':
        updatedCampaign = await db
          .update(campaigns)
          .set({ 
            status: 'paused',
            updatedAt: new Date(),
          })
          .where(eq(campaigns.id, campaignId))
          .returning();
        break;

      case 'resume':
        updatedCampaign = await db
          .update(campaigns)
          .set({ 
            status: 'active',
            updatedAt: new Date(),
          })
          .where(eq(campaigns.id, campaignId))
          .returning();
        break;

      case 'close':
        updatedCampaign = await db
          .update(campaigns)
          .set({ 
            status: 'closed',
            updatedAt: new Date(),
          })
          .where(eq(campaigns.id, campaignId))
          .returning();
        break;

      case 'verify':
        if (existingCampaign.isVerified || existingCampaign.verifiedPendingAt) {
          updatedCampaign = [existingCampaign];
          skipVerificationPendingOutreach = true;
        } else {
          updatedCampaign = await db
            .update(campaigns)
            .set({
              isVerified: false,
              verifiedPendingAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(campaigns.id, campaignId))
            .returning();
        }
        break;

      case 'unverify':
        updatedCampaign = await db
          .update(campaigns)
          .set({
            isVerified: false,
            verifiedPendingAt: null,
            verifiedRulesAcceptedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(campaigns.id, campaignId))
          .returning();
        break;

      case 'update':
        if ('platformFeeOverrideEnabled' in updateData || 'platformFeeOverridePercent' in updateData) {
          const overrideEnabled =
            updateData.platformFeeOverrideEnabled == null
              ? existingCampaign.platformFeeOverrideEnabled
              : Boolean(updateData.platformFeeOverrideEnabled);

          const rawOverridePercent = updateData.platformFeeOverridePercent;
          const parsedOverridePercent =
            rawOverridePercent == null || rawOverridePercent === ''
              ? null
              : Number(rawOverridePercent);

          if (
            parsedOverridePercent != null &&
            (!Number.isFinite(parsedOverridePercent) || parsedOverridePercent < 0)
          ) {
            return NextResponse.json(
              { error: 'Platform fee override must be a valid non-negative number.' },
              { status: 400 }
            );
          }

          if (
            parsedOverridePercent != null &&
            parsedOverridePercent > DEFAULT_PLATFORM_FEE_PERCENT
          ) {
            return NextResponse.json(
              {
                error: `Platform fee override cannot exceed default platform fee (${DEFAULT_PLATFORM_FEE_PERCENT}%).`,
              },
              { status: 400 }
            );
          }

          updateData.platformFeeOverrideEnabled = overrideEnabled;
          updateData.platformFeeOverridePercent = overrideEnabled
            ? resolveEffectivePlatformFeePercent({
                overrideEnabled: true,
                overridePercent:
                  parsedOverridePercent ??
                  existingCampaign.platformFeeOverridePercent,
              }).toString()
            : null;
        }

        updatedCampaign = await db
          .update(campaigns)
          .set({ 
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(campaigns.id, campaignId))
          .returning();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (creatorEmail) {
      try {
        if (action === 'hold') {
          await sendCampaignHoldEmail({
            userEmail: creatorEmail,
            userName: creatorName,
            campaignTitle: existingCampaign.title,
            campaignUrl,
          });
        }

        if (action === 'activate') {
          await sendCampaignReactivatedEmail({
            userEmail: creatorEmail,
            userName: creatorName,
            campaignTitle: existingCampaign.title,
            campaignUrl,
          });
        }

        if (action === 'verify' && !skipVerificationPendingOutreach) {
          const rulesPageUrl = `${baseUrl}/dashboard/campaigns/verified-campaign?campaignId=${campaignId}`;
          await sendCampaignVerificationPendingEmail({
            userEmail: creatorEmail,
            userName: creatorName,
            campaignTitle: existingCampaign.title,
            campaignUrl,
            rulesPageUrl,
          });
        }
      } catch (emailError) {
        console.error('Failed to send campaign status email:', emailError);
      }
    }

    if (action === 'verify' && !skipVerificationPendingOutreach) {
      try {
        await db.insert(notifications).values({
          userId: existingCampaign.creatorId,
          type: 'campaign_verification_pending',
          title: 'Complete verification for your campaign',
          message: `Your campaign "${existingCampaign.title}" is pending verification. Review and accept the verified campaign rules to activate your verified badge.`,
          metadata: JSON.stringify({
            campaignId,
            slug: existingCampaign.slug,
            rulesPath: `/dashboard/campaigns/verified-campaign?campaignId=${campaignId}`,
          }),
          createdAt: new Date(),
        });
      } catch (notifyErr) {
        console.error('Failed to create verification pending notification:', notifyErr);
      }
    }

    return NextResponse.json({
      message: `Campaign ${action} successful`,
      campaign: updatedCampaign[0],
    });

  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/campaigns/[id]
 * Delete a campaign (soft delete by setting status to closed)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Check if campaign exists
    const existingCampaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to closed
    const deletedCampaign = await db
      .update(campaigns)
      .set({ 
        status: 'closed',
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId))
      .returning();

    return NextResponse.json({
      message: 'Campaign deleted successfully',
      campaign: deletedCampaign[0],
    });

  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
