import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations, users, campaigns, chainers } from '@/lib/schema';
import { eq, and, count, desc, sql } from 'drizzle-orm';
import { updateCampaignAmount } from '@/lib/utils/campaign-amount';
import { calculateAndDistributeCommissions } from '@/lib/utils/commission-calculation';
import { verifyPaystackPayment } from '@/lib/payments/paystack';

/**
 * If donation has no chainerId but the payment provider has chain_code in metadata,
 * attribute the donation to that chainer automatically.
 */
async function tryAttributeDonationFromProvider(donationId: string): Promise<{ attributed: boolean; chainerId?: string }> {
  const [row] = await db
    .select({
      campaignId: donations.campaignId,
      paymentMethod: donations.paymentMethod,
      paymentIntentId: donations.paymentIntentId,
      chainerId: donations.chainerId,
    })
    .from(donations)
    .where(eq(donations.id, donationId))
    .limit(1);

  if (!row || row.chainerId || !row.paymentIntentId) return { attributed: false };

  let chainCode: string | null = null;

  if (row.paymentMethod === 'paystack') {
    try {
      const verification = await verifyPaystackPayment(row.paymentIntentId);
      const meta = verification?.data?.metadata as Record<string, unknown> | undefined;
      if (meta?.custom_fields && Array.isArray(meta.custom_fields)) {
        const field = (meta.custom_fields as Array<{ variable_name?: string; value?: unknown }>).find(
          (f) => f.variable_name === 'chain_code'
        );
        if (field?.value != null) chainCode = String(field.value);
      }
      if (!chainCode && meta?.chain_code != null) chainCode = String(meta.chain_code);
    } catch {
      // ignore
    }
  } else if (row.paymentMethod === 'paypal') {
    // PayPal does not store chain_code in the same way; skip attribution
  }

  if (!chainCode) return { attributed: false };

  const chainerRows = await db
    .select({ id: chainers.id })
    .from(chainers)
    .where(and(eq(chainers.referralCode, chainCode), eq(chainers.campaignId, row.campaignId)))
    .limit(1);

  if (!chainerRows.length) return { attributed: false };
  const chainerId = chainerRows[0].id;

  await db.update(donations).set({ chainerId }).where(eq(donations.id, donationId));
  await calculateAndDistributeCommissions(donationId);
  return { attributed: true, chainerId };
}

/**
 * GET /api/admin/donations/[id]
 * Get detailed information about a specific donation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: donationId } = await params;

    // Get donation details with donor, campaign, and chainer info
    const donation = await db
      .select({
        id: donations.id,
        campaignId: donations.campaignId,
        donorId: donations.donorId,
        amount: donations.amount,
        currency: donations.currency,
        paymentStatus: donations.paymentStatus,
        paymentMethod: donations.paymentMethod,
        chainerId: donations.chainerId,
        createdAt: donations.createdAt,
        processedAt: donations.processedAt,
        paymentIntentId: donations.paymentIntentId,
        failureReason: donations.failureReason,
        isAnonymous: donations.isAnonymous,
        donorName: donations.donorName,
        donorEmail: donations.donorEmail,
        donorUserName: users.fullName,
        donorUserEmail: users.email,
        campaignTitle: campaigns.title,
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation[0]) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Auto-attribute to chainer from payment provider metadata when possible (e.g. chain_code stored on Stripe/Paystack)
    if (!donation[0].chainerId && donation[0].paymentIntentId) {
      const attr = await tryAttributeDonationFromProvider(donationId);
      if (attr.attributed && attr.chainerId) {
        donation[0].chainerId = attr.chainerId;
      }
    }

    // Get chainer info if applicable
    let chainerInfo = null;
    if (donation[0].chainerId) {
      const [chainerData] = await db
        .select({
          id: chainers.id,
          userId: chainers.userId,
          referralCode: chainers.referralCode,
          totalReferrals: chainers.totalReferrals,
          totalRaised: chainers.totalRaised,
          commissionEarned: chainers.commissionEarned,
          chainerName: users.fullName,
        })
        .from(chainers)
        .leftJoin(users, eq(chainers.userId, users.id))
        .where(eq(chainers.id, donation[0].chainerId))
        .limit(1);

      chainerInfo = chainerData;
    }

    // Get donor's donation history
    const donorHistory = await db
      .select({
        id: donations.id,
        amount: donations.amount,
        currency: donations.currency,
        paymentStatus: donations.paymentStatus,
        createdAt: donations.createdAt,
        campaignTitle: campaigns.title,
      })
      .from(donations)
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .where(eq(donations.donorId, donation[0].donorId))
      .orderBy(desc(donations.createdAt))
      .limit(10);

    // Calculate fraud score
    let fraudScore = 0;
    let suspiciousActivity = false;

    // High amount donations
    if (Number(donation[0].amount) > 1000) fraudScore += 20;
    if (Number(donation[0].amount) > 5000) fraudScore += 30;

    // Multiple donations from same donor
    const [donationCount] = await db
      .select({ count: count() })
      .from(donations)
      .where(and(
        eq(donations.donorId, donation[0].donorId),
        sql`${donations.createdAt} >= NOW() - INTERVAL '24 hours'`
      ));

    if (donationCount.count > 5) {
      fraudScore += 25;
      suspiciousActivity = true;
    }

    // Failed payment attempts
    const [failedCount] = await db
      .select({ count: count() })
      .from(donations)
      .where(and(
        eq(donations.donorId, donation[0].donorId),
        eq(donations.paymentStatus, 'failed')
      ));

    if (failedCount.count > 3) {
      fraudScore += 20;
      suspiciousActivity = true;
    }

    // Recent account creation
    const [donorAccount] = await db
      .select({ createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, donation[0].donorId))
      .limit(1);

    if (donorAccount) {
      const accountAge = Date.now() - new Date(donorAccount.createdAt).getTime();
      const hoursOld = accountAge / (1000 * 60 * 60);
      if (hoursOld < 24 && Number(donation[0].amount) > 100) {
        fraudScore += 30;
        suspiciousActivity = true;
      }
    }

    const donationDetails = {
      ...donation[0],
      donorName: donation[0].isAnonymous ? 'Anonymous' : (donation[0].donorName || donation[0].donorUserName || 'Unknown'),
      donorEmail: donation[0].isAnonymous ? null : (donation[0].donorEmail || donation[0].donorUserEmail || null),
      chainerInfo,
      fraudScore: Math.min(100, fraudScore),
      suspiciousActivity,
      donorHistory,
    };

    return NextResponse.json(donationDetails);

  } catch (error) {
    console.error('Error fetching donation details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation details' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/donations/[id]
 * Update donation information or perform actions
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: donationId } = await params;
    const body = await request.json();
    const { action, ...updateData } = body;

    // Check if donation exists
    const existingDonation = await db.query.donations.findFirst({
      where: eq(donations.id, donationId),
    });

    if (!existingDonation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    let updatedDonation;

    switch (action) {
      case 'refund':
        if (!updateData.reason) {
          return NextResponse.json(
            { error: 'Refund reason is required' },
            { status: 400 }
          );
        }
        updatedDonation = await db
          .update(donations)
          .set({ 
            paymentStatus: 'refunded',
          })
          .where(eq(donations.id, donationId))
          .returning();
        break;

      case 'retry':
        updatedDonation = await db
          .update(donations)
          .set({ 
            paymentStatus: 'pending',
          })
          .where(eq(donations.id, donationId))
          .returning();
        break;

      case 'mark_completed':
        updatedDonation = await db
          .update(donations)
          .set({ 
            paymentStatus: 'completed',
            processedAt: new Date(),
            lastStatusUpdate: new Date(),
          })
          .where(eq(donations.id, donationId))
          .returning();
        
        // Update campaign amount if donation was marked as completed
        if (updatedDonation[0]) {
          await updateCampaignAmount(updatedDonation[0].campaignId);
        }
        break;

      case 'mark_failed':
        if (!updateData.reason) {
          return NextResponse.json(
            { error: 'Failure reason is required' },
            { status: 400 }
          );
        }
        updatedDonation = await db
          .update(donations)
          .set({ 
            paymentStatus: 'failed',
          })
          .where(eq(donations.id, donationId))
          .returning();
        break;

      case 'add_notes':
        if (!updateData.notes) {
          return NextResponse.json(
            { error: 'Notes are required' },
            { status: 400 }
          );
        }
        updatedDonation = await db
          .update(donations)
          .set({ 
            // No notes field available in donations schema
          })
          .where(eq(donations.id, donationId))
          .returning();
        break;

      case 'update':
        updatedDonation = await db
          .update(donations)
          .set({ 
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(donations.id, donationId))
          .returning();
        break;

      case 'attribute_chainer': {
        if (process.env.NODE_ENV !== 'development') {
          return NextResponse.json(
            { error: 'Manual attribute is only available in development' },
            { status: 403 }
          );
        }
        const { referralCode } = updateData;
        if (!referralCode || typeof referralCode !== 'string') {
          return NextResponse.json(
            { error: 'referralCode is required to attribute donation to a chainer' },
            { status: 400 }
          );
        }
        if (existingDonation.chainerId) {
          return NextResponse.json(
            { error: 'Donation is already attributed to a chainer' },
            { status: 400 }
          );
        }
        const [chainer] = await db
          .select()
          .from(chainers)
          .where(and(
            eq(chainers.referralCode, referralCode.trim()),
            eq(chainers.campaignId, existingDonation.campaignId)
          ))
          .limit(1);
        if (!chainer) {
          return NextResponse.json(
            { error: 'Chainer not found for this campaign with that referral code' },
            { status: 404 }
          );
        }
        updatedDonation = await db
          .update(donations)
          .set({ chainerId: chainer.id })
          .where(eq(donations.id, donationId))
          .returning();
        if (updatedDonation[0]) {
          await calculateAndDistributeCommissions(donationId);
        }
        return NextResponse.json({
          message: 'Donation attributed to chainer successfully',
          donation: updatedDonation[0],
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Donation ${action} successful`,
      donation: updatedDonation[0],
    });

  } catch (error) {
    console.error('Error updating donation:', error);
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/donations/[id]
 * Delete a donation (soft delete by marking as failed)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: donationId } = await params;

    // Check if donation exists
    const existingDonation = await db.query.donations.findFirst({
      where: eq(donations.id, donationId),
    });

    if (!existingDonation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Soft delete by marking as failed
    const deletedDonation = await db
      .update(donations)
      .set({ 
        paymentStatus: 'failed',
      })
      .where(eq(donations.id, donationId))
      .returning();

    return NextResponse.json({
      message: 'Donation deleted successfully',
      donation: deletedDonation[0],
    });

  } catch (error) {
    console.error('Error deleting donation:', error);
    return NextResponse.json(
      { error: 'Failed to delete donation' },
      { status: 500 }
    );
  }
}
