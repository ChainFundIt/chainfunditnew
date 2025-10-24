import { db } from '../lib/db';
import { chainers, users, campaigns } from '../lib/schema';
import { eq } from 'drizzle-orm';

async function seedChainers() {
  try {
    console.log('🌱 Seeding chainers...');

    // First, get some existing users and campaigns
    const existingUsers = await db.select().from(users).limit(5);
    const existingCampaigns = await db.select().from(campaigns).limit(3);

    if (existingUsers.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }

    if (existingCampaigns.length === 0) {
      console.log('❌ No campaigns found. Please create campaigns first.');
      return;
    }

    // Generate test chainers
    const testChainers = [];
    
    for (let i = 0; i < 10; i++) {
      const user = existingUsers[i % existingUsers.length];
      const campaign = existingCampaigns[i % existingCampaigns.length];
      
      testChainers.push({
        userId: user.id,
        campaignId: campaign.id,
        referralCode: `REF${String(i + 1).padStart(3, '0')}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        commissionDestination: 'keep',
        totalRaised: (Math.random() * 5000 + 1000).toFixed(2),
        totalReferrals: Math.floor(Math.random() * 50 + 1),
        clicks: Math.floor(Math.random() * 200 + 10),
        conversions: Math.floor(Math.random() * 20 + 1),
        commissionEarned: (Math.random() * 500 + 50).toFixed(2),
        commissionPaid: Math.random() > 0.5,
      });
    }

    // Insert test chainers
    const insertedChainers = await db.insert(chainers).values(testChainers).returning();

    console.log(`✅ Successfully seeded ${insertedChainers.length} chainers`);
    console.log('📊 Sample chainer data:');
    insertedChainers.slice(0, 3).forEach((chainer, index) => {
      console.log(`  ${index + 1}. Referral Code: ${chainer.referralCode}, Total Raised: $${chainer.totalRaised}, Referrals: ${chainer.totalReferrals}`);
    });

  } catch (error) {
    console.error('❌ Error seeding chainers:', error);
  }
}

// Run the seeder
seedChainers().then(() => {
  console.log('🎉 Chainer seeding completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});
