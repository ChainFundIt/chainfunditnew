import { db } from '../lib/db';
import { campaigns } from '../lib/schema';
import { eq } from 'drizzle-orm';

/**
 * Script to update any campaigns with "rejected" status to "closed" status
 * This is needed after removing the campaign approval/rejection flow
 */
async function updateRejectedCampaigns() {
  try {
    console.log('🔍 Checking for campaigns with "rejected" status...');
    
    // Find campaigns with rejected status
    const rejectedCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, 'rejected'));
    
    if (rejectedCampaigns.length === 0) {
      console.log('✅ No campaigns with "rejected" status found.');
      return;
    }
    
    console.log(`📋 Found ${rejectedCampaigns.length} campaigns with "rejected" status:`);
    rejectedCampaigns.forEach(campaign => {
      console.log(`  - ${campaign.title} (ID: ${campaign.id})`);
    });
    
    // Update rejected campaigns to closed status
    const updatedCampaigns = await db
      .update(campaigns)
      .set({ 
        status: 'closed',
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(campaigns.status, 'rejected'))
      .returning();
    
    console.log(`✅ Updated ${updatedCampaigns.length} campaigns from "rejected" to "closed" status.`);
    
    // Verify the update
    const remainingRejected = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, 'rejected'));
    
    if (remainingRejected.length === 0) {
      console.log('✅ All "rejected" campaigns have been successfully updated to "closed".');
    } else {
      console.log(`⚠️  Warning: ${remainingRejected.length} campaigns still have "rejected" status.`);
    }
    
  } catch (error) {
    console.error('❌ Error updating rejected campaigns:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updateRejectedCampaigns()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { updateRejectedCampaigns };
