import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { charities } from '@/lib/schema/charities';
import { sql, eq } from 'drizzle-orm';
import { requireAdminAuth } from '@/lib/admin-auth';

/**
 * POST /api/admin/fix-charity-image-urls
 * Fix charities with "undefined/" in their image URLs
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdminAuth(request);
    
    console.log('🔍 Searching for charities with undefined/ in URLs...');
    
    // Find all charities with "undefined/" in logo or coverImage
    const affectedCharities = await db
      .select()
      .from(charities)
      .where(
        sql`(
          ${charities.logo} LIKE 'undefined/%' OR
          ${charities.coverImage} LIKE 'undefined/%'
        )`
      );
    
    if (affectedCharities.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No charities found with undefined/ URLs',
        fixed: 0,
        total: 0,
      });
    }
    
    const baseUrl = process.env.R2_PUBLIC_ACCESS_KEY;
    if (!baseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'R2_PUBLIC_ACCESS_KEY environment variable is not set',
        },
        { status: 500 }
      );
    }
    
    // Ensure baseUrl doesn't have a trailing slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    
    let fixedCount = 0;
    const fixedCharities: Array<{ id: string; name: string; fixes: string[] }> = [];
    
    for (const charity of affectedCharities) {
      const fixes: string[] = [];
      const updates: { logo?: string; coverImage?: string } = {};
      
      // Fix logo
      if (charity.logo && charity.logo.includes('undefined/')) {
        const fileName = charity.logo.replace('undefined/', '');
        const fixedUrl = `${cleanBaseUrl}/${fileName}`;
        updates.logo = fixedUrl;
        fixes.push(`logo: ${charity.logo} → ${fixedUrl}`);
      }
      
      // Fix coverImage
      if (charity.coverImage && charity.coverImage.includes('undefined/')) {
        const fileName = charity.coverImage.replace('undefined/', '');
        const fixedUrl = `${cleanBaseUrl}/${fileName}`;
        updates.coverImage = fixedUrl;
        fixes.push(`coverImage: ${charity.coverImage} → ${fixedUrl}`);
      }
      
      if (Object.keys(updates).length > 0) {
        await db
          .update(charities)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(eq(charities.id, charity.id));
        
        fixedCount++;
        fixedCharities.push({
          id: charity.id,
          name: charity.name,
          fixes,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} charity(ies)`,
      fixed: fixedCount,
      total: affectedCharities.length,
      fixedCharities: fixedCharities.slice(0, 20), // Limit response size
    });
  } catch (error: any) {
    console.error('Error fixing charity image URLs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fix charity image URLs',
      },
      { status: 500 }
    );
  }
}
