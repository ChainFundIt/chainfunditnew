import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations, users, campaigns } from '@/lib/schema';
import { count } from 'drizzle-orm';

export async function POST() {
  try {
    // Check if we have users and campaigns
    const [userCount] = await db.select({ count: count() }).from(users);
    const [campaignCount] = await db.select({ count: count() }).from(campaigns);
    
    let createdUsers: any[] = [];
    let createdCampaigns: any[] = [];
    
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
    
    // Create charity-based campaigns if none exist - using charities from virtual mall
    if (campaignCount.count === 0) {
      const charityCampaigns = [
        {
          creatorId: createdUsers[0]?.id || (await db.select().from(users).limit(1))[0]?.id,
          title: 'Support Save the Children',
          slug: 'support-save-the-children',
          description: 'Help Save the Children provide emergency relief, healthcare, and education to children in need around the world. Your donation helps us reach the most vulnerable children in over 120 countries.',
          fundraisingFor: 'Save the Children',
          goalAmount: '15000.00',
          currency: 'USD',
          minimumDonation: '25.00',
          chainerCommissionRate: '5.0',
          currentAmount: '0.00',
          status: 'active',
          coverImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        },
        {
          creatorId: createdUsers[1]?.id || (await db.select().from(users).limit(1))[0]?.id,
          title: 'Doctors Without Borders Emergency Fund',
          slug: 'doctors-without-borders-emergency',
          description: 'Support Doctors Without Borders in providing medical care to people affected by conflict, epidemics, and disasters. Help us deliver life-saving medical assistance where it\'s needed most.',
          fundraisingFor: 'Doctors Without Borders',
          goalAmount: '25000.00',
          currency: 'USD',
          minimumDonation: '50.00',
          chainerCommissionRate: '5.0',
          currentAmount: '0.00',
          status: 'active',
          coverImageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
        },
        {
          creatorId: createdUsers[0]?.id || (await db.select().from(users).limit(1))[0]?.id,
          title: 'World Wildlife Fund Conservation',
          slug: 'wwf-conservation',
          description: 'Join WWF in protecting endangered species and their habitats. Your support helps us combat climate change, protect forests, and ensure a sustainable future for wildlife.',
          fundraisingFor: 'World Wildlife Fund',
          goalAmount: '20000.00',
          currency: 'USD',
          minimumDonation: '30.00',
          chainerCommissionRate: '5.0',
          currentAmount: '0.00',
          status: 'active',
          coverImageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        },
        {
          creatorId: createdUsers[1]?.id || (await db.select().from(users).limit(1))[0]?.id,
          title: 'American Red Cross Disaster Relief',
          slug: 'red-cross-disaster-relief',
          description: 'Support the American Red Cross in providing emergency assistance, disaster relief, and disaster preparedness education to communities in crisis.',
          fundraisingFor: 'American Red Cross',
          goalAmount: '30000.00',
          currency: 'USD',
          minimumDonation: '25.00',
          chainerCommissionRate: '5.0',
          currentAmount: '0.00',
          status: 'active',
          coverImageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=600&fit=crop',
        },
        {
          creatorId: createdUsers[0]?.id || (await db.select().from(users).limit(1))[0]?.id,
          title: 'Clean Water for Communities',
          slug: 'clean-water-communities',
          description: 'Help charity: water bring clean and safe drinking water to people in developing countries. Every dollar donated goes directly to water projects.',
          fundraisingFor: 'Charity: Water',
          goalAmount: '12000.00',
          currency: 'USD',
          minimumDonation: '20.00',
          chainerCommissionRate: '5.0',
          currentAmount: '0.00',
          status: 'active',
          coverImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
        },
        {
          creatorId: createdUsers[1]?.id || (await db.select().from(users).limit(1))[0]?.id,
          title: 'End Hunger with Heifer International',
          slug: 'end-hunger-heifer',
          description: 'Support Heifer International\'s mission to end hunger and poverty while caring for the Earth through sustainable agriculture and livestock programs.',
          fundraisingFor: 'Heifer International',
          goalAmount: '18000.00',
          currency: 'USD',
          minimumDonation: '35.00',
          chainerCommissionRate: '5.0',
          currentAmount: '0.00',
          status: 'active',
          coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop',
        }
      ];
      
      createdCampaigns = await db.insert(campaigns).values(charityCampaigns).returning();
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
