import { db } from '@/lib/db';
import { notifications, users, campaignPayouts, commissionPayouts, chainers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendPayoutCompletionEmail, sendPayoutFailureEmail } from '../payments/payout-email';

/**
 * Send payout status notification to user
 */
export async function notifyUserOfPayoutStatus(
  payoutId: string,
  type: 'campaign' | 'commission',
  status: 'completed' | 'failed',
  userId: string
) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.email) {
      console.error('User not found for payout notification');
      return { success: false, error: 'User not found' };
    }

    let payoutData: any;
    let campaignTitle = '';

    if (type === 'campaign') {
      payoutData = await db.query.campaignPayouts.findFirst({
        where: eq(campaignPayouts.id, payoutId),
        with: {
          campaign: true,
        },
      });

      if (payoutData) {
        campaignTitle = payoutData.campaign?.title || '';
      }
    } else {
      payoutData = await db.query.commissionPayouts.findFirst({
        where: eq(commissionPayouts.id, payoutId),
        with: {
          campaign: true,
        },
      });

      if (payoutData) {
        campaignTitle = payoutData.campaign?.title || '';
      }
    }

    if (!payoutData) {
      return { success: false, error: 'Payout not found' };
    }

    // Create in-app notification
    await db.insert(notifications).values({
      userId,
      type: status === 'completed' ? 'payout_completed' : 'payout_failed',
      title:
        status === 'completed'
          ? 'Payout Completed'
          : 'Payout Failed',
      message:
        status === 'completed'
          ? `Your ${type === 'campaign' ? 'campaign' : 'commission'} payout of ${payoutData.currency || 'USD'} ${payoutData.amount || payoutData.requestedAmount || payoutData.netAmount} has been completed.`
          : `Your ${type === 'campaign' ? 'campaign' : 'commission'} payout has failed. Please contact support.`,
      metadata: JSON.stringify({
        payoutId,
        type,
        status,
        amount: payoutData.amount || payoutData.requestedAmount || payoutData.netAmount,
        currency: payoutData.currency || 'USD',
      }),
      isRead: false,
    });

    // Send email notification
    if (status === 'completed') {
      try {
        await sendPayoutCompletionEmail({
          userEmail: user.email,
          userName: user.fullName || user.email,
          campaignTitle,
          payoutAmount: parseFloat(
            (payoutData.amount || payoutData.requestedAmount || payoutData.netAmount).toString()
          ),
          currency: payoutData.currency || 'USD',
          netAmount: parseFloat((payoutData.netAmount || payoutData.amount || payoutData.requestedAmount).toString()),
          fees: parseFloat((payoutData.fees || '0').toString()),
          payoutProvider: payoutData.payoutProvider || 'paystack',
          processingTime: '1-3 business days',
          payoutId,
          bankDetails: payoutData.accountName
            ? {
                accountName: payoutData.accountName,
                accountNumber: payoutData.accountNumber || '',
                bankName: payoutData.bankName || '',
              }
            : undefined,
          completionDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      } catch (emailError) {
        console.error('Failed to send completion email:', emailError);
      }
    } else {
      try {
        await sendPayoutFailureEmail({
          userEmail: user.email,
          userName: user.fullName || user.email,
          campaignTitle,
          payoutAmount: parseFloat(
            (payoutData.amount || payoutData.requestedAmount || payoutData.netAmount).toString()
          ),
          currency: payoutData.currency || 'USD',
          failureReason: payoutData.failureReason || 'Unknown error',
          payoutId,
        });
      } catch (emailError) {
        console.error('Failed to send failure email:', emailError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error notifying user of payout status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Poll for payout status updates and send notifications
 * This can be called periodically or via webhooks
 */
export async function checkAndNotifyPayoutStatusUpdates() {
  try {
    // Get recently processed payouts (last 5 minutes)
    const recentTime = new Date(Date.now() - 5 * 60 * 1000);

    // Check campaign payouts
    const recentCampaignPayouts = await db
      .select()
      .from(campaignPayouts)
      .where(
        eq(campaignPayouts.processedAt, recentTime as any) // This is simplified - should use proper date comparison
      );

    // Check commission payouts
    const recentCommissionPayouts = await db
      .select()
      .from(commissionPayouts)
      .where(
        eq(commissionPayouts.processedAt, recentTime as any)
      );

    const notifications = [];

    for (const payout of recentCampaignPayouts) {
      if (payout.status === 'completed' || payout.status === 'failed') {
        await notifyUserOfPayoutStatus(
          payout.id,
          'campaign',
          payout.status,
          payout.userId
        );
        notifications.push({ id: payout.id, type: 'campaign', status: payout.status });
      }
    }

    for (const payout of recentCommissionPayouts) {
      if (payout.status === 'completed' || payout.status === 'failed') {
        // Get chainer's user ID
        const chainer = await db.query.chainers.findFirst({
          where: eq(chainers.id, payout.chainerId),
        });

        if (chainer) {
          await notifyUserOfPayoutStatus(
            payout.id,
            'commission',
            payout.status,
            chainer.userId
          );
          notifications.push({ id: payout.id, type: 'commission', status: payout.status });
        }
      }
    }

    return {
      success: true,
      notificationsSent: notifications.length,
      notifications,
    };
  } catch (error) {
    console.error('Error checking payout status updates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

