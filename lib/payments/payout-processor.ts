import { db } from '@/lib/db';
import { campaignPayouts, commissionPayouts, users, campaigns } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { initiatePaystackTransfer, createPaystackRecipient, verifyPaystackTransfer } from './paystack';
import { getPayoutProvider } from './payout-config';
import { sendPayoutApprovalEmail, sendPayoutCompletionEmail, sendPayoutFailureEmail } from './payout-email';
import { logPayoutStatusChange } from './payout-audit';

export interface PayoutProcessingResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  status: 'processing' | 'completed' | 'failed';
}

/**
 * Process a campaign creator payout
 */
export async function processCampaignCreatorPayout(
  payoutId: string
): Promise<PayoutProcessingResult> {
  try {
    // Get payout details
    const payout = await db.query.campaignPayouts.findFirst({
      where: eq(campaignPayouts.id, payoutId),
      with: {
        user: true,
        campaign: true,
      },
    });

    if (!payout) {
      return {
        success: false,
        error: 'Payout not found',
        status: 'failed',
      };
    }

    if (payout.status !== 'approved') {
      return {
        success: false,
        error: 'Payout is not approved',
        status: 'failed',
      };
    }

    // Determine payout provider based on currency
    const provider = (payout.payoutProvider as 'paystack' | 'paypal' | undefined)
      || getPayoutProvider(payout.currency);
    if (!provider) {
      return {
        success: false,
        error: `No payout provider available for currency ${payout.currency}`,
        status: 'failed',
      };
    }

    // Update status to processing
    await db
      .update(campaignPayouts)
      .set({
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(campaignPayouts.id, payoutId));

    let result: PayoutProcessingResult;

    if (provider === 'paystack') {
      result = await processPaystackPayout(payout, 'campaign');
    } else if (provider === 'paypal') {
      result = await processPayPalPayout(payout, 'campaign');
    } else {
      return {
        success: false,
        error: 'Unsupported payout provider',
        status: 'failed',
      };
    }

    // Get old status for audit log
    const oldStatus = payout.status;

    // Validate that if status is completed or processing, we have a transactionId
    if ((result.status === 'completed' || result.status === 'processing') && !result.transactionId) {
      console.error(`Payout ${payoutId} marked as ${result.status} but no transactionId provided`);
      // Mark as failed if we don't have a transaction ID
      result.status = 'failed';
      result.success = false;
      result.error = result.error || 'Transfer initiated but no transaction ID returned';
    }

    // Only mark processedAt if status is completed (not processing)
    // Processing payouts should have processedAt set when webhook confirms completion
    await db
      .update(campaignPayouts)
      .set({
        status: result.status,
        transactionId: result.transactionId || null,
        failureReason: result.error || null,
        processedAt: (result.success && result.status === 'completed') ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(campaignPayouts.id, payoutId));

    // Log audit trail
    await logPayoutStatusChange({
      payoutId,
      oldStatus,
      newStatus: result.status,
      changedBy: 'payout_processor',
      reason: result.error || 'Payout processed',
    });

    // Send email notifications
    // Only send completion email if status is actually completed (not processing)
    // Processing payouts will get completion email when webhook confirms success
    if (result.success && result.status === 'completed' && result.transactionId) {
      try {
        await sendPayoutCompletionEmail({
          userEmail: payout.user.email!,
          userName: payout.user.fullName || payout.user.email!,
          campaignTitle: payout.campaign.title,
          payoutAmount: parseFloat(payout.requestedAmount),
          currency: payout.currency,
          netAmount: parseFloat(payout.netAmount),
          fees: parseFloat(payout.fees),
          payoutProvider: payout.payoutProvider,
          processingTime: '1-3 business days',
          payoutId: payout.id,
          bankDetails: payout.accountName ? {
            accountName: payout.accountName,
            accountNumber: payout.accountNumber || '',
            bankName: payout.bankName || '',
          } : undefined,
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
        // Don't fail the payout for email errors
      }
    } else if (!result.success && result.status === 'failed') {
      try {
        await sendPayoutFailureEmail({
          userEmail: payout.user.email!,
          userName: payout.user.fullName || payout.user.email!,
          campaignTitle: payout.campaign.title,
          payoutAmount: parseFloat(payout.requestedAmount),
          currency: payout.currency,
          failureReason: result.error || 'Payout processing failed',
          payoutId: payout.id,
        });
      } catch (emailError) {
        console.error('Failed to send failure email:', emailError);
        // Don't fail the payout for email errors
      }
    }

    return result;
  } catch (error) {
    console.error('Error processing campaign creator payout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
    };
  }
}

/**
 * Process an ambassador payout
 */
export async function processAmbassadorPayout(
  payoutId: string
): Promise<PayoutProcessingResult> {
  try {
    // Get payout details
    const payout = await db.query.commissionPayouts.findFirst({
      where: eq(commissionPayouts.id, payoutId),
    });

    if (!payout) {
      return {
        success: false,
        error: 'Payout not found',
        status: 'failed',
      };
    }

    if (payout.status !== 'approved') {
      return {
        success: false,
        error: 'Payout is not approved',
        status: 'failed',
      };
    }

    // Determine payout provider based on currency
    const provider = getPayoutProvider(payout.currency);
    if (!provider) {
      return {
        success: false,
        error: `No payout provider available for currency ${payout.currency}`,
        status: 'failed',
      };
    }

    // Update status to processing
    await db
      .update(commissionPayouts)
      .set({
        status: 'processing',
      })
      .where(eq(commissionPayouts.id, payoutId));

    let result: PayoutProcessingResult;

    if (provider === 'paystack') {
      result = await processPaystackPayout(payout, 'ambassador');
    } else if (provider === 'paypal') {
      result = await processPayPalPayout(payout, 'ambassador');
    } else {
      return {
        success: false,
        error: 'Unsupported payout provider',
        status: 'failed',
      };
    }

    // Validate that if status is completed or processing, we have a transactionId
    if ((result.status === 'completed' || result.status === 'processing') && !result.transactionId) {
      console.error(`Ambassador payout ${payoutId} marked as ${result.status} but no transactionId provided`);
      // Mark as failed if we don't have a transaction ID
      result.status = 'failed';
      result.success = false;
      result.error = result.error || 'Transfer initiated but no transaction ID returned';
    }

    // Only mark processedAt if status is completed (not processing)
    // Processing payouts should have processedAt set when webhook confirms completion
    await db
      .update(commissionPayouts)
      .set({
        status: result.status,
        transactionId: result.transactionId || null,
        processedAt: (result.success && result.status === 'completed') ? new Date() : null,
      })
      .where(eq(commissionPayouts.id, payoutId));

    return result;
  } catch (error) {
    console.error('Error processing ambassador payout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
    };
  }
}

/**
 * Process payout using PayPal
 */
async function processPayPalPayout(
  payout: any,
  type: 'campaign' | 'ambassador'
): Promise<PayoutProcessingResult> {
  try {
    const { createPayPalPayout } = await import('./paypal');
    const { db } = await import('@/lib/db');
    const { users, chainers } = await import('@/lib/schema');
    const { eq } = await import('drizzle-orm');

    const amount = parseFloat(type === 'campaign' ? payout.netAmount : payout.amount);
    const currency = type === 'campaign' ? payout.currency : (payout.currency || 'USD');

    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: 'Invalid payout amount',
        status: 'failed',
      };
    }

    let receiverEmail: string | null = null;
    let recipientName = payout.user?.fullName || 'User';

    if (type === 'campaign') {
      receiverEmail = payout.user?.email || null;
    } else {
      const [chainer] = await db
        .select({
          userId: chainers.userId,
        })
        .from(chainers)
        .where(eq(chainers.id, payout.chainerId))
        .limit(1);

      if (!chainer) {
        return {
          success: false,
          error: 'Chainer not found for ambassador payout',
          status: 'failed',
        };
      }

      const [user] = await db
        .select({
          email: users.email,
          fullName: users.fullName,
        })
        .from(users)
        .where(eq(users.id, chainer.userId))
        .limit(1);

      receiverEmail = user?.email || null;
      recipientName = user?.fullName || recipientName;
    }

    if (!receiverEmail) {
      return {
        success: false,
        error: 'A PayPal payout email is required',
        status: 'failed',
      };
    }

    const senderItemId = `${type === 'campaign' ? 'campaign' : 'ambassador'}:${payout.id}`;
    const paypalPayout = await createPayPalPayout({
      senderItemId,
      receiverEmail,
      amount,
      currency,
      note: `ChainFundit payout for ${recipientName}`,
      emailSubject: 'Your ChainFundit payout is on the way',
    });

    const status = paypalPayout.payoutItemStatus === 'SUCCESS' ? 'completed' : 'processing';

    return {
      success: true,
      transactionId:
        paypalPayout.transactionId ||
        paypalPayout.payoutItemId ||
        paypalPayout.batchId,
      status,
    };
  } catch (error) {
    console.error('Error processing PayPal payout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PayPal payout failed',
      status: 'failed',
    };
  }
}

/**
 * Process payout using Paystack
 */
export async function processPaystackPayout(
  payout: any,
  type: 'campaign' | 'ambassador'
): Promise<PayoutProcessingResult> {
  try {
    if (!payout.accountNumber || !payout.bankCode) {
      return {
        success: false,
        error: 'Bank details required for Paystack payout. Please ensure account number and bank code are provided.',
        status: 'failed',
      };
    }

    if (isNaN(Number(payout.bankCode))) {
      return {
        success: false,
        error: 'Invalid bank code format. Bank code must be a valid numeric code.',
        status: 'failed',
      };
    }

    if (!/^\d{10,}$/.test(payout.accountNumber)) {
      return {
        success: false,
        error: 'Invalid account number format. Account number must be at least 10 digits.',
        status: 'failed',
      };
    }

    let recipientCode = payout.recipientCode;
    if (!recipientCode) {
      try {
        const recipient = await createPaystackRecipient(
          payout.accountName || payout.user?.fullName || 'User',
          payout.accountNumber,
          payout.bankCode,
          payout.currency
        );
        recipientCode = recipient.data.recipient_code;
        
      } catch (recipientError: any) {
        if (recipientError.message?.includes('already exists')) {
          return {
            success: false,
            error: 'Recipient already exists but recipient code not found. Please contact support or try again.',
            status: 'failed',
          };
        }
        throw recipientError;
      }
    }

    // Validate amount
    const amount = parseFloat(payout.netAmount || payout.amount);
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: 'Invalid payout amount. Amount must be greater than zero.',
        status: 'failed',
      };
    }

    // Check minimum amount (Paystack minimum is usually 100 kobo = 1 NGN)
    if (amount < 1) {
      return {
        success: false,
        error: 'Payout amount is too small. Minimum amount is 1 NGN.',
        status: 'failed',
      };
    }

    // Initiate transfer
    const transfer = await initiatePaystackTransfer(
      amount,
      recipientCode,
      `Payout for ${type} - ${payout.campaign?.title || 'Commission'}`,
      payout.currency,
      payout.reference || payout.id
    );

    if (!transfer.data || !transfer.data.transfer_code) {
      return {
        success: false,
        error: 'Transfer initiated but no transfer code returned from Paystack',
        status: 'failed',
      };
    }

    // Check transfer status from Paystack response
    // Possible statuses:
    // - 'otp': Transfer requires OTP approval in Paystack dashboard (when "Confirm transfers before sending" is enabled)
    // - 'pending': Transfer is queued for processing
    // - 'success': Transfer processed successfully (when OTP is disabled, this happens immediately)
    // - 'failed': Transfer failed
    // - 'reversed': Transfer was reversed
    const transferStatus = transfer.data.status;
    
    if (transferStatus === 'failed' || transferStatus === 'reversed') {
      return {
        success: false,
        error: `Paystack transfer ${transferStatus}: ${transfer.data.message || 'Transfer failed'}`,
        status: 'failed',
      };
    }

    const transferCode = transfer.data.transfer_code;
    
    // If status is 'success', transfer completed immediately (OTP disabled in Paystack)
    // If status is 'otp' or 'pending', transfer is waiting for approval/processing
    // In both cases, we mark as 'processing' and wait for webhook to confirm final status
    if (transferStatus === 'success' && transferCode) {
      // Transfer completed immediately (automated mode)
      // Still mark as processing - webhook will confirm and mark as completed
      return {
        success: true,
        transactionId: transferCode,
        status: 'processing', // Webhook will update to 'completed' when transfer finalizes
      };
    }

    // Transfer is pending or requires OTP
    // Mark as processing - webhook will update when transfer completes
    return {
      success: true,
      transactionId: transferCode,
      status: 'processing', // Webhook will update to 'completed' when transfer succeeds
    };
  } catch (error) {
    console.error('Error processing Paystack payout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Paystack payout failed';
    return {
      success: false,
      error: errorMessage,
      status: 'failed',
    };
  }
}

/**
 * Send approval notification email
 */
export async function sendPayoutApprovalNotification(
  payoutId: string,
  type: 'campaign' | 'ambassador'
) {
  try {
    let payout: any;
    let user: { email: string; fullName: string | null } | null = null;
    let campaign: { title: string } | null | undefined = null;

    if (type === 'campaign') {
      payout = await db.query.campaignPayouts.findFirst({
        where: eq(campaignPayouts.id, payoutId),
        with: {
          user: true,
          campaign: true,
        },
      });
      
      if (payout) {
        user = payout.user;
        campaign = payout.campaign;
      }
    } else {
      payout = await db.query.commissionPayouts.findFirst({
        where: eq(commissionPayouts.id, payoutId),
      });
      
      if (payout) {
        // Get user and campaign details for ambassador payouts
        const chainer = await db.query.chainers.findFirst({
          where: eq(commissionPayouts.chainerId, payout.chainerId),
          with: {
            user: true,
          },
        });
        
        if (chainer) {
          user = chainer.user;
          campaign = await db.query.campaigns.findFirst({
            where: eq(campaigns.id, payout.campaignId),
          });
        }
      }
    }

    if (!payout || !user) {
      console.error('Payout or user not found for approval notification');
      return;
    }

    await sendPayoutApprovalEmail({
      userEmail: user.email!,
      userName: user.fullName || user.email!,
      campaignTitle: campaign?.title || 'Commission Payout',
      payoutAmount: parseFloat(payout.requestedAmount || payout.amount),
      currency: payout.currency,
      netAmount: parseFloat(payout.netAmount || payout.amount),
      fees: parseFloat(payout.fees || '0'),
      payoutProvider: payout.payoutProvider || 'paypal',
      processingTime: payout.currency === 'NGN' ? '1-3 business days' : '2-7 business days',
      payoutId: payout.id,
      bankDetails: payout.accountName ? {
        accountName: payout.accountName,
        accountNumber: payout.accountNumber || '',
        bankName: payout.bankName || '',
      } : undefined,
    });
  } catch (error) {
    console.error('Error sending payout approval notification:', error);
  }
}
