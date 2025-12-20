import { db } from '@/lib/db';
import { campaignPayouts } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export interface PayoutAuditLog {
  payoutId: string;
  oldStatus: string;
  newStatus: string;
  changedBy?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Log payout status changes for audit trail
 */
export async function logPayoutStatusChange(log: PayoutAuditLog) {
  try {
    // Store audit log in payout notes field (or create separate audit table if needed)
    const payout = await db.query.campaignPayouts.findFirst({
      where: eq(campaignPayouts.id, log.payoutId),
    });

    if (!payout) {
      console.error(`Payout ${log.payoutId} not found for audit log`);
      return;
    }

    const auditEntry = {
      timestamp: new Date().toISOString(),
      oldStatus: log.oldStatus,
      newStatus: log.newStatus,
      changedBy: log.changedBy || 'system',
      reason: log.reason,
      metadata: log.metadata,
    };

    const auditLog = `\n[AUDIT ${auditEntry.timestamp}] ${log.oldStatus} -> ${log.newStatus} by ${auditEntry.changedBy}${log.reason ? ` - ${log.reason}` : ''}`;
    
    await db
      .update(campaignPayouts)
      .set({
        notes: `${payout.notes || ''}${auditLog}`,
        updatedAt: new Date(),
      })
      .where(eq(campaignPayouts.id, log.payoutId));

    console.log(`Audit log created for payout ${log.payoutId}:`, auditEntry);
  } catch (error) {
    console.error('Error creating payout audit log:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

