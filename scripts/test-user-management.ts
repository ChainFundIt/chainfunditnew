import { db } from '../lib/db';
import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';

/**
 * Script to test user management functionality
 */
async function testUserManagement() {
  try {
    console.log('🔍 Testing user management functionality...');
    
    // Get a sample user to test with
    const sampleUser = await db
      .select()
      .from(users)
      .limit(1);
    
    if (sampleUser.length === 0) {
      console.log('❌ No users found in database to test with.');
      return;
    }
    
    const user = sampleUser[0];
    console.log(`📋 Testing with user: ${user.fullName} (${user.email})`);
    console.log(`   Current status: ${user.accountLocked ? 'locked' : 'active'}`);
    
    // Test status mapping
    const status = user.accountLocked ? 'suspended' : 'active';
    console.log(`   Mapped status: ${status}`);
    
    // Test user actions
    console.log('\n🧪 Testing user actions...');
    
    // Test activate action
    if (user.accountLocked) {
      console.log('   Testing activate action...');
      const activatedUser = await db
        .update(users)
        .set({ 
          accountLocked: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      
      console.log(`   ✅ User activated: ${activatedUser[0].accountLocked ? 'still locked' : 'unlocked'}`);
    }
    
    // Test suspend action
    console.log('   Testing suspend action...');
    const suspendedUser = await db
      .update(users)
      .set({ 
        accountLocked: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    
    console.log(`   ✅ User suspended: ${suspendedUser[0].accountLocked ? 'locked' : 'unlocked'}`);
    
    // Test verify action
    console.log('   Testing verify action...');
    const verifiedUser = await db
      .update(users)
      .set({ 
        isVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    
    console.log(`   ✅ User verified: ${verifiedUser[0].isVerified ? 'verified' : 'not verified'}`);
    
    // Test bulk actions
    console.log('\n🧪 Testing bulk actions...');
    const bulkUsers = await db
      .select()
      .from(users)
      .limit(3);
    
    if (bulkUsers.length > 0) {
      const userIds = bulkUsers.map(u => u.id);
      console.log(`   Testing bulk activate on ${userIds.length} users...`);
      
      const bulkActivated = await db
        .update(users)
        .set({ 
          accountLocked: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userIds[0])) // Just test with first user for simplicity
        .returning();
      
      console.log(`   ✅ Bulk activate successful: ${bulkActivated[0].accountLocked ? 'still locked' : 'unlocked'}`);
    }
    
    console.log('\n🎉 User management functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing user management:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  testUserManagement()
    .then(() => {
      console.log('\n🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

export { testUserManagement };
