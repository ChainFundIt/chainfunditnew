import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations, users, campaigns } from '@/lib/schema';
import { count } from 'drizzle-orm';

export async function POST() {
  try {
    // First, let's check if we have users and campaigns
    const [userCount] = await db.select({ count: count() }).from(users);
    const [campaignCount] = await db.select({ count: count() }).from(campaigns);
    
    if (userCount.count === 0) {
      return NextResponse.json({
        success: false,
        message: 'No users found. Please seed users first.'
      });
    }
    
    if (campaignCount.count === 0) {
      return NextResponse.json({
        success: false,
        message: 'No campaigns found. Please seed campaigns first.'
      });
    }

    // Get some users and campaigns to create donations
    const usersList = await db.select().from(users).limit(5);
    const campaignsList = await db.select().from(campaigns).limit(3);

    const testDonations = [];
    const currencies = ['USD', 'NGN', 'GBP'];
    const statuses = ['completed', 'pending', 'failed'];
    const paymentMethods = ['stripe', 'paystack'];

    for (let i = 0; i < 10; i++) {
      const randomUser = usersList[Math.floor(Math.random() * usersList.length)];
      const randomCampaign = campaignsList[Math.floor(Math.random() * campaignsList.length)];
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
      message: `Successfully seeded ${insertedDonations.length} donations`,
      donations: insertedDonations.slice(0, 3).map(donation => ({
        id: donation.id,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.paymentStatus
      }))
    });

  } catch (error) {
    console.error('Error seeding donations:', error);
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
