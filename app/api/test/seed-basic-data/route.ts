import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations, users, campaigns } from '@/lib/schema';
import { count } from 'drizzle-orm';

export async function POST() {
  try {
    // Check if we have users and campaigns
    const [userCount] = await db.select({ count: count() }).from(users);
    const [campaignCount] = await db.select({ count: count() }).from(campaigns);
    
    let createdUsers = [];
    let createdCampaigns = [];
    
    // Create test users if none exist
    if (userCount.count === 0) {
      const testUsers = [
        {
          email: 'john.doe@example.com',
          fullName: 'John Doe',
          password: 'hashedpassword123',
          accountLocked: false,
          emailVerified: true,
        },
        {
          email: 'jane.smith@example.com',
          fullName: 'Jane Smith',
          password: 'hashedpassword123',
          accountLocked: false,
          emailVerified: true,
        },
        {
          email: 'bob.wilson@example.com',
          fullName: 'Bob Wilson',
          password: 'hashedpassword123',
          accountLocked: false,
          emailVerified: true,
        }
      ];
      
      createdUsers = await db.insert(users).values(testUsers).returning();
    }
    
    // Create test campaigns if none exist
    if (campaignCount.count === 0) {
      const testCampaigns = [
        {
          title: 'Help Save the Environment',
          description: 'Supporting environmental conservation efforts',
          goal: '5000.00',
          raised: '0.00',
          currency: 'USD',
          status: 'active',
          category: 'environment',
          imageUrl: 'https://example.com/environment.jpg',
          createdBy: createdUsers[0]?.id || (await db.select().from(users).limit(1))[0]?.id,
        },
        {
          title: 'Education for All',
          description: 'Providing educational resources to underprivileged children',
          goal: '10000.00',
          raised: '0.00',
          currency: 'USD',
          status: 'active',
          category: 'education',
          imageUrl: 'https://example.com/education.jpg',
          createdBy: createdUsers[1]?.id || (await db.select().from(users).limit(1))[0]?.id,
        }
      ];
      
      createdCampaigns = await db.insert(campaigns).values(testCampaigns).returning();
    }
    
    // Get existing users and campaigns
    const existingUsers = await db.select().from(users).limit(5);
    const existingCampaigns = await db.select().from(campaigns).limit(3);
    
    // Create test donations
    const testDonations = [];
    const currencies = ['USD', 'NGN', 'GBP'];
    const statuses = ['completed', 'pending', 'failed'];
    const paymentMethods = ['stripe', 'paystack'];

    for (let i = 0; i < 15; i++) {
      const randomUser = existingUsers[Math.floor(Math.random() * existingUsers.length)];
      const randomCampaign = existingCampaigns[Math.floor(Math.random() * existingCampaigns.length)];
      const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomPaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      testDonations.push({
        campaignId: randomCampaign.id,
        donorId: randomUser.id,
        amount: (Math.random() * 1000 + 10).toFixed(2),
        currency: randomCurrency,
        paymentStatus: randomStatus,
        paymentMethod: randomPaymentMethod,
        isAnonymous: Math.random() > 0.7,
        message: Math.random() > 0.5 ? `Test donation message ${i + 1}` : null,
      });
    }

    // Insert test donations
    const insertedDonations = await db.insert(donations).values(testDonations).returning();

    return NextResponse.json({
      success: true,
      message: 'Successfully seeded basic data',
      data: {
        usersCreated: createdUsers.length,
        campaignsCreated: createdCampaigns.length,
        donationsCreated: insertedDonations.length,
        sampleDonations: insertedDonations.slice(0, 3).map(donation => ({
          id: donation.id,
          amount: donation.amount,
          currency: donation.currency,
          status: donation.paymentStatus
        }))
      }
    });

  } catch (error) {
    console.error('Error seeding basic data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
