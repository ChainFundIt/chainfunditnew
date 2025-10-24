import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations, users, campaigns } from '@/lib/schema';
import { count } from 'drizzle-orm';

export async function GET() {
  try {
    // Check users
    const [userCount] = await db.select({ count: count() }).from(users);
    const usersList = await db.select().from(users).limit(3);
    
    // Check campaigns
    const [campaignCount] = await db.select({ count: count() }).from(campaigns);
    const campaignsList = await db.select().from(campaigns).limit(3);
    
    // Check donations
    const [donationCount] = await db.select({ count: count() }).from(donations);
    const donationsList = await db.select().from(donations).limit(3);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          count: userCount.count,
          sample: usersList.map(u => ({ id: u.id, email: u.email, fullName: u.fullName }))
        },
        campaigns: {
          count: campaignCount.count,
          sample: campaignsList.map(c => ({ id: c.id, title: c.title }))
        },
        donations: {
          count: donationCount.count,
          sample: donationsList.map(d => ({ id: d.id, amount: d.amount, currency: d.currency }))
        }
      }
    });
  } catch (error) {
    console.error('Check data error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
