import { db } from '../lib/db';
import { campaigns } from '../lib/schema';
import { eq, inArray } from 'drizzle-orm';

/**
 * Script to update specific campaigns to active status
 */
async function updateCampaignsToActive() {
  try {
    console.log('🔍 Finding campaigns to update to active status...');
    
    // Get some campaigns that are not already active
    const campaignsToUpdate = await db
      .select()
      .from(campaigns)
      .where(
        inArray(campaigns.status, ['paused', 'closed'])
      )
      .limit(8);
    
    if (campaignsToUpdate.length === 0) {
      console.log('✅ No campaigns found that need to be updated to active status.');
      return;
    }
    
    console.log(`📋 Found ${campaignsToUpdate.length} campaigns to update:`);
    campaignsToUpdate.forEach((campaign, index) => {
      console.log(`  ${index + 1}. ${campaign.title} (ID: ${campaign.id}) - Current Status: ${campaign.status}`);
    });
    
    const campaignIds = campaignsToUpdate.map(campaign => campaign.id);
    
    // Update campaigns to active status
    const updatedCampaigns = await db
      .update(campaigns)
      .set({ 
        status: 'active',
        isActive: true,
        updatedAt: new Date()
      })
      .where(inArray(campaigns.id, campaignIds))
      .returning();
    
    console.log(`\n✅ Successfully updated ${updatedCampaigns.length} campaigns to active status:`);
    updatedCampaigns.forEach((campaign, index) => {
      console.log(`  ${index + 1}. ${campaign.title} (ID: ${campaign.id})`);
    });
    
    // Verify the update
    const activeCampaigns = await db
      .select()
      .from(campaigns)
      .where(inArray(campaigns.id, campaignIds));
    
    const allActive = activeCampaigns.every(campaign => campaign.status === 'active' && campaign.isActive === true);
    
    if (allActive) {
      console.log('\n🎉 All campaigns have been successfully updated to active status!');
    } else {
      console.log('\n⚠️  Warning: Some campaigns may not have been updated correctly.');
    }
    
  } catch (error) {
    console.error('❌ Error updating campaigns to active status:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updateCampaignsToActive()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { updateCampaignsToActive };
