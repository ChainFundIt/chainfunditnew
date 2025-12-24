import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaignPayouts, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getAdminUser } from '@/lib/admin-auth';
import { sendPayoutApprovalNotification, processCampaignCreatorPayout } from '@/lib/payments/payout-processor';
import { logPayoutStatusChange } from '@/lib/payments/payout-audit';
import { sendPayoutConfirmationEmail, sendPayoutFailureEmail } from '@/lib/payments/payout-email';

/**
 * GET /api/admin/payouts/campaigns/[id]
 * Get a specific campaign payout request
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payout = await db.query.campaignPayouts.findFirst({
      where: eq(campaignPayouts.id, id),
      with: {
        user: true,
        campaign: true,
      },
    });

    if (!payout) {
      return NextResponse.json(
        { error: 'Payout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ payout });
  } catch (error) {
    console.error('Error fetching campaign payout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/payouts/campaigns/[id]
 * Update campaign payout status or perform actions
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, notes, rejectionReason } = body;

    // Check if payout exists
    const existingPayout = await db.query.campaignPayouts.findFirst({
      where: eq(campaignPayouts.id, id),
    });

    if (!existingPayout) {
      return NextResponse.json(
        { error: 'Payout not found' },
        { status: 404 }
      );
    }

    const oldStatus = existingPayout.status;
    let updatedPayout;

    switch (action) {
      case 'approve':
        updatedPayout = await db
          .update(campaignPayouts)
          .set({ 
            status: 'approved',
            approvedBy: adminUser.id,
            approvedAt: new Date(),
            notes: notes || null,
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, id))
          .returning();
        
        // Log audit trail
        await logPayoutStatusChange({
          payoutId: id,
          oldStatus,
          newStatus: 'approved',
          changedBy: adminUser.id,
          reason: notes || 'Payout approved by admin',
        });
        
        // Send approval notification email
        try {
          await sendPayoutApprovalNotification(id, 'campaign');
        } catch (emailError) {
          console.error('Failed to send approval notification:', emailError);
          // Don't fail the approval for email errors
        }
        
        // Automatically process the payout
        try {
          const processResult = await processCampaignCreatorPayout(id);
          
          // Check if processing failed
          if (!processResult.success) {
            const errorMessage = processResult.error || 'Processing failed';
            console.error('Failed to process payout:', errorMessage);
            
            // Update status to failed if processing fails
            await db
              .update(campaignPayouts)
              .set({ 
                status: 'failed',
                failureReason: errorMessage,
                updatedAt: new Date(),
              })
              .where(eq(campaignPayouts.id, id));
            
            // Log audit trail for failure
            await logPayoutStatusChange({
              payoutId: id,
              oldStatus: 'approved',
              newStatus: 'failed',
              changedBy: 'system',
              reason: errorMessage,
            });
          }
        } catch (processError) {
          console.error('Failed to process payout:', processError);
          const errorMessage = processError instanceof Error ? processError.message : 'Processing failed';
          
          // Update status to failed if processing fails
          await db
            .update(campaignPayouts)
            .set({ 
              status: 'failed',
              failureReason: errorMessage,
              updatedAt: new Date(),
            })
            .where(eq(campaignPayouts.id, id));
          
          // Log audit trail for failure
          await logPayoutStatusChange({
            payoutId: id,
            oldStatus: 'approved',
            newStatus: 'failed',
            changedBy: 'system',
            reason: errorMessage,
          });
        }
        break;

      case 'reject':
        if (!rejectionReason) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          );
        }
        updatedPayout = await db
          .update(campaignPayouts)
          .set({ 
            status: 'rejected',
            rejectionReason,
            notes: notes || null,
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, id))
          .returning();
        
        // Log audit trail
        await logPayoutStatusChange({
          payoutId: id,
          oldStatus,
          newStatus: 'rejected',
          changedBy: adminUser.id,
          reason: rejectionReason,
        });
        
        // Send rejection email notification
        try {
          const payout = await db.query.campaignPayouts.findFirst({
            where: eq(campaignPayouts.id, id),
            with: { user: true, campaign: true },
          });
          if (payout && payout.user) {
            await sendPayoutFailureEmail({
              userEmail: payout.user.email!,
              userName: payout.user.fullName || payout.user.email!,
              campaignTitle: payout.campaign.title,
              payoutAmount: parseFloat(payout.requestedAmount),
              currency: payout.currency,
              failureReason: rejectionReason,
              payoutId: id,
            });
          }
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
        }
        break;

      case 'process':
        updatedPayout = await db
          .update(campaignPayouts)
          .set({ 
            status: 'processing',
            notes: notes || null,
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, id))
          .returning();
        break;

      case 'complete':
        // Validate that payout has a transactionId before marking as completed
        // This prevents marking as completed if transfer was never initiated
        if (!existingPayout.transactionId) {
          return NextResponse.json(
            { error: 'Cannot mark payout as completed without a transaction ID. The transfer must be initiated first. Use the "approve" action to automatically process the payout, or ensure a transaction ID exists.' },
            { status: 400 }
          );
        }

        // Log audit trail for manual completion
        await logPayoutStatusChange({
          payoutId: id,
          oldStatus,
          newStatus: 'completed',
          changedBy: adminUser.id,
          reason: notes || 'Manually marked as completed by admin',
        });

        updatedPayout = await db
          .update(campaignPayouts)
          .set({ 
            status: 'completed',
            processedAt: new Date(),
            notes: notes || null,
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, id))
          .returning();
        break;

      case 'fail':
        updatedPayout = await db
          .update(campaignPayouts)
          .set({ 
            status: 'failed',
            failureReason: rejectionReason || 'Payout processing failed',
            notes: notes || null,
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, id))
          .returning();
        break;

      case 'cancel':
        // Only allow cancellation of pending payouts
        if (existingPayout.status !== 'pending') {
          return NextResponse.json(
            { error: `Cannot cancel payout with status: ${existingPayout.status}. Only pending payouts can be cancelled.` },
            { status: 400 }
          );
        }
        updatedPayout = await db
          .update(campaignPayouts)
          .set({ 
            status: 'rejected',
            rejectionReason: rejectionReason || 'Cancelled by admin',
            notes: notes || null,
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, id))
          .returning();
        
        // Log audit trail
        await logPayoutStatusChange({
          payoutId: id,
          oldStatus,
          newStatus: 'rejected',
          changedBy: adminUser.id,
          reason: rejectionReason || 'Cancelled by admin',
        });
        
        // Send cancellation email notification
        try {
          const payout = await db.query.campaignPayouts.findFirst({
            where: eq(campaignPayouts.id, id),
            with: { user: true, campaign: true },
          });
          if (payout && payout.user) {
            await sendPayoutFailureEmail({
              userEmail: payout.user.email!,
              userName: payout.user.fullName || payout.user.email!,
              campaignTitle: payout.campaign.title,
              payoutAmount: parseFloat(payout.requestedAmount),
              currency: payout.currency,
              failureReason: rejectionReason || 'Payout cancelled',
              payoutId: id,
            });
          }
        } catch (emailError) {
          console.error('Failed to send cancellation email:', emailError);
        }
        break;

      case 'retry':
        // Allow retrying payouts that are:
        // 1. Failed, OR
        // 2. Completed but have no transactionId (never actually processed)
        const canRetry = existingPayout.status === 'failed' || 
                        (existingPayout.status === 'completed' && !existingPayout.transactionId);
        
        if (!canRetry) {
          return NextResponse.json(
            { error: `Cannot retry payout with status: ${existingPayout.status}. Only failed payouts or completed payouts without a transaction ID can be retried.` },
            { status: 400 }
          );
        }

        // Reset status to approved and clear any failure reasons
        await db
          .update(campaignPayouts)
          .set({ 
            status: 'approved',
            failureReason: null,
            transactionId: null, // Clear old transaction ID if it exists
            processedAt: null,
            notes: notes ? `${existingPayout.notes || ''}\nRetry initiated by admin: ${notes}` : existingPayout.notes,
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, id));

        // Log audit trail
        await logPayoutStatusChange({
          payoutId: id,
          oldStatus,
          newStatus: 'approved',
          changedBy: adminUser.id,
          reason: notes || 'Retry initiated by admin - resetting to approved status',
        });

        // Process the payout
        try {
          const processResult = await processCampaignCreatorPayout(id);
          
          if (!processResult.success) {
            const errorMessage = processResult.error || 'Processing failed';
            console.error('Failed to process payout on retry:', errorMessage);
            
            // Update status to failed if processing fails
            await db
              .update(campaignPayouts)
              .set({ 
                status: 'failed',
                failureReason: errorMessage,
                updatedAt: new Date(),
              })
              .where(eq(campaignPayouts.id, id));
            
            // Log audit trail for failure
            await logPayoutStatusChange({
              payoutId: id,
              oldStatus: 'approved',
              newStatus: 'failed',
              changedBy: 'system',
              reason: errorMessage,
            });
          }
        } catch (processError) {
          console.error('Failed to process payout on retry:', processError);
          const errorMessage = processError instanceof Error ? processError.message : 'Processing failed';
          
          // Update status to failed if processing fails
          await db
            .update(campaignPayouts)
            .set({ 
              status: 'failed',
              failureReason: errorMessage,
              updatedAt: new Date(),
            })
            .where(eq(campaignPayouts.id, id));
          
          // Log audit trail for failure
          await logPayoutStatusChange({
            payoutId: id,
            oldStatus: 'approved',
            newStatus: 'failed',
            changedBy: 'system',
            reason: errorMessage,
          });
        }

        // Fetch updated payout
        updatedPayout = await db
          .select()
          .from(campaignPayouts)
          .where(eq(campaignPayouts.id, id))
          .limit(1);
        break;

      case 'add_notes':
        if (!notes) {
          return NextResponse.json(
            { error: 'Notes are required' },
            { status: 400 }
          );
        }
        updatedPayout = await db
          .update(campaignPayouts)
          .set({ 
            notes,
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, id))
          .returning();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Payout ${action}ed successfully`,
      payout: updatedPayout[0],
    });

  } catch (error) {
    console.error('Error updating campaign payout:', error);
    return NextResponse.json(
      { error: 'Failed to update payout' },
      { status: 500 }
    );
  }
}

