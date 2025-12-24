#!/usr/bin/env tsx
/**
 * Monitor Payout Flow
 * 
 * Usage: npx tsx scripts/monitor-payout.ts <payoutId>
 * 
 * This script monitors a payout request through its entire lifecycle,
 * showing status changes, audit logs, and processing details.
 */

// Load environment variables FIRST, before any other imports
// Use require to ensure this runs synchronously before module imports
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Fallback to .env

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('   Please ensure .env.local or .env file contains DATABASE_URL');
  process.exit(1);
}

interface PayoutStatus {
  id: string;
  status: string;
  reference: string;
  requestedAmount: string;
  netAmount: string;
  fees: string;
  currency: string;
  payoutProvider: string;
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  approvedBy: string | null;
  processedAt: Date | null;
  failureReason: string | null;
  notes: string | null;
}

function parseAuditLogs(notes: string | null): Array<{
  timestamp: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  reason?: string;
}> {
  if (!notes) return [];
  
  const auditEntries: Array<{
    timestamp: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    reason?: string;
  }> = [];
  
  const auditPattern = /\[AUDIT ([^\]]+)\] ([^->]+) -> ([^ ]+) by ([^-]+)(?: - (.+))?/g;
  let match;
  
  while ((match = auditPattern.exec(notes)) !== null) {
    auditEntries.push({
      timestamp: match[1],
      oldStatus: match[2].trim(),
      newStatus: match[3].trim(),
      changedBy: match[4].trim(),
      reason: match[5]?.trim(),
    });
  }
  
  return auditEntries;
}

function formatStatus(status: string): string {
  const statusColors: Record<string, string> = {
    pending: '\x1b[33m',    // Yellow
    approved: '\x1b[36m',   // Cyan
    processing: '\x1b[34m', // Blue
    completed: '\x1b[32m',  // Green
    failed: '\x1b[31m',     // Red
    rejected: '\x1b[35m',   // Magenta
  };
  
  const color = statusColors[status.toLowerCase()] || '\x1b[0m';
  return `${color}${status.toUpperCase()}\x1b[0m`;
}

function formatCurrency(amount: string, currency: string): string {
  const numAmount = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(numAmount);
}

async function monitorPayout(payoutId: string) {
  // Dynamic imports to ensure env vars are loaded first
  const { db } = await import('../lib/db');
  const { campaignPayouts } = await import('../lib/schema');
  const { eq } = await import('drizzle-orm');
  console.log('\n🔍 Monitoring Payout Flow\n');
  console.log('=' .repeat(60));
  console.log(`Payout ID: ${payoutId}`);
  console.log('=' .repeat(60));
  
  let lastStatus: string | null = null;
  let checkCount = 0;
  const maxChecks = 300; // Monitor for up to 5 minutes (1 check per second)
  
  const monitorInterval = setInterval(async () => {
    try {
      const payout = await db.query.campaignPayouts.findFirst({
        where: eq(campaignPayouts.id, payoutId),
      });
      
      if (!payout) {
        console.log('\n❌ Payout not found!');
        clearInterval(monitorInterval);
        process.exit(1);
      }
      
      checkCount++;
      
      // Show status change
      if (lastStatus !== payout.status) {
        console.log(`\n📊 Status Update #${checkCount}:`);
        console.log(`   ${formatStatus(payout.status)}`);
        console.log(`   Time: ${new Date().toLocaleString()}`);
        
        if (payout.transactionId) {
          console.log(`   Transaction ID: ${payout.transactionId}`);
        }
        
        if (payout.failureReason) {
          console.log(`   ❌ Failure Reason: ${payout.failureReason}`);
        }
        
        lastStatus = payout.status;
      }
      
      // Show full details every 10 checks or on status change
      if (checkCount % 10 === 0 || lastStatus !== payout.status) {
        console.log('\n📋 Current Payout Details:');
        console.log(`   Reference: ${payout.reference}`);
        console.log(`   Requested: ${formatCurrency(payout.requestedAmount, payout.currency)}`);
        console.log(`   Fees: ${formatCurrency(payout.fees, payout.currency)}`);
        console.log(`   Net Amount: ${formatCurrency(payout.netAmount, payout.currency)}`);
        console.log(`   Provider: ${payout.payoutProvider}`);
        console.log(`   Created: ${new Date(payout.createdAt).toLocaleString()}`);
        
        if (payout.approvedAt) {
          console.log(`   Approved: ${new Date(payout.approvedAt).toLocaleString()}`);
        }
        
        if (payout.processedAt) {
          console.log(`   Processed: ${new Date(payout.processedAt).toLocaleString()}`);
        }
        
        // Show audit trail
        const auditLogs = parseAuditLogs(payout.notes);
        if (auditLogs.length > 0) {
          console.log('\n📜 Audit Trail:');
          auditLogs.forEach((log, index) => {
            console.log(`   ${index + 1}. [${log.timestamp}]`);
            console.log(`      ${log.oldStatus} → ${formatStatus(log.newStatus)}`);
            console.log(`      Changed by: ${log.changedBy}`);
            if (log.reason) {
              console.log(`      Reason: ${log.reason}`);
            }
          });
        }
      }
      
      // Stop monitoring if payout is in final state
      if (['completed', 'failed', 'rejected'].includes(payout.status.toLowerCase())) {
        console.log('\n✅ Payout reached final state. Monitoring complete.');
        console.log('\n📊 Final Summary:');
        console.log(`   Status: ${formatStatus(payout.status)}`);
        console.log(`   Reference: ${payout.reference}`);
        console.log(`   Net Amount: ${formatCurrency(payout.netAmount, payout.currency)}`);
        
        if (payout.transactionId) {
          console.log(`   Transaction ID: ${payout.transactionId}`);
        } else if (payout.status === 'completed') {
          console.log(`   ⚠️  WARNING: Payout marked as completed but no transaction ID!`);
        }
        
        if (payout.failureReason) {
          console.log(`   Failure Reason: ${payout.failureReason}`);
        }
        
        clearInterval(monitorInterval);
        process.exit(0);
      }
      
      // Stop if we've checked too many times
      if (checkCount >= maxChecks) {
        console.log('\n⏱️  Monitoring timeout reached. Stopping...');
        clearInterval(monitorInterval);
        process.exit(0);
      }
      
    } catch (error) {
      console.error('\n❌ Error monitoring payout:', error);
      clearInterval(monitorInterval);
      process.exit(1);
    }
  }, 1000); // Check every second
  
  // Initial check
  const initialPayout = await db.query.campaignPayouts.findFirst({
    where: eq(campaignPayouts.id, payoutId),
  });
  
  if (!initialPayout) {
    console.log('\n❌ Payout not found!');
    process.exit(1);
  }
  
  console.log('\n✅ Payout found. Starting monitoring...');
  console.log(`   Initial Status: ${formatStatus(initialPayout.status)}`);
  console.log(`   Reference: ${initialPayout.reference}`);
  console.log(`   Amount: ${formatCurrency(initialPayout.netAmount, initialPayout.currency)}`);
  console.log('\n💡 Press Ctrl+C to stop monitoring\n');
  
  lastStatus = initialPayout.status;
}

// Get payout ID from command line arguments or find most recent
async function getPayoutId(): Promise<string> {
  // Dynamic imports to ensure env vars are loaded first
  const { db } = await import('../lib/db');
  const { campaignPayouts } = await import('../lib/schema');
  const { desc } = await import('drizzle-orm');
  
  const payoutId = process.argv[2];
  
  if (payoutId) {
    return payoutId;
  }
  
  // If no ID provided, find the most recent payout
  console.log('🔍 No payout ID provided. Finding most recent payout...\n');
  
  const recentPayouts = await db
    .select()
    .from(campaignPayouts)
    .orderBy(desc(campaignPayouts.createdAt))
    .limit(1);
  
  if (recentPayouts.length === 0) {
    console.error('❌ Error: No payouts found in database');
    console.log('\nUsage: npx tsx scripts/monitor-payout.ts <payoutId>');
    console.log('\nExample: npx tsx scripts/monitor-payout.ts abc123-def456-ghi789');
    process.exit(1);
  }
  
  const mostRecent = recentPayouts[0];
  console.log(`✅ Found most recent payout:`);
  console.log(`   ID: ${mostRecent.id}`);
  console.log(`   Reference: ${mostRecent.reference}`);
  console.log(`   Status: ${mostRecent.status}`);
  console.log(`   Amount: ${formatCurrency(mostRecent.netAmount, mostRecent.currency)}`);
  console.log(`   Created: ${new Date(mostRecent.createdAt).toLocaleString()}\n`);
  
  return mostRecent.id;
}

// Start monitoring
getPayoutId().then((payoutId) => {
  monitorPayout(payoutId).catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

