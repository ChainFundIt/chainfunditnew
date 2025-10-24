import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations, users, campaigns } from '@/lib/schema';

export async function GET() {
  try {
    // Check if donations table exists and has data
    const donationsCount = await db.select().from(donations).limit(1);
    
    return NextResponse.json({
      success: true,
      message: 'Donations API is working',
      donationsCount: donationsCount.length,
      hasData: donationsCount.length > 0
    });
  } catch (error) {
    console.error('Test donations error:', error);
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
