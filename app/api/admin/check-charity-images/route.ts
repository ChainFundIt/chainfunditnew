import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { charities } from '@/lib/schema/charities';
import { requireAdminAuth } from '@/lib/admin-auth';

/**
 * GET /api/admin/check-charity-images
 * Check charity image URLs and identify issues
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdminAuth(request);
    
    console.log('🔍 Checking charity images...');
    
    // Get all charities
    const allCharities = await db.select().from(charities);
    
    const issues = {
      noLogo: [] as any[],
      noCoverImage: [] as any[],
      invalidLogo: [] as any[],
      invalidCoverImage: [] as any[],
      undefinedPrefix: [] as any[],
      validImages: [] as any[],
    };
    
    for (const charity of allCharities) {
      // Check logo
      if (!charity.logo || charity.logo.trim() === '') {
        issues.noLogo.push({ id: charity.id, name: charity.name });
      } else if (charity.logo.includes('undefined/')) {
        issues.undefinedPrefix.push({ 
          id: charity.id, 
          name: charity.name, 
          field: 'logo', 
          url: charity.logo 
        });
      } else if (!charity.logo.startsWith('http://') && !charity.logo.startsWith('https://') && !charity.logo.startsWith('/')) {
        issues.invalidLogo.push({ id: charity.id, name: charity.name, url: charity.logo });
      }
      
      // Check coverImage
      if (!charity.coverImage || charity.coverImage.trim() === '') {
        issues.noCoverImage.push({ id: charity.id, name: charity.name });
      } else if (charity.coverImage.includes('undefined/')) {
        issues.undefinedPrefix.push({ 
          id: charity.id, 
          name: charity.name, 
          field: 'coverImage', 
          url: charity.coverImage 
        });
      } else if (!charity.coverImage.startsWith('http://') && !charity.coverImage.startsWith('https://') && !charity.coverImage.startsWith('/')) {
        issues.invalidCoverImage.push({ id: charity.id, name: charity.name, url: charity.coverImage });
      }
      
      // If no issues, it's valid
      const hasIssues = 
        issues.noLogo.some(c => c.id === charity.id) ||
        issues.noCoverImage.some(c => c.id === charity.id) ||
        issues.invalidLogo.some(c => c.id === charity.id) ||
        issues.invalidCoverImage.some(c => c.id === charity.id) ||
        issues.undefinedPrefix.some(c => c.id === charity.id);
      
      if (!hasIssues && (charity.logo || charity.coverImage)) {
        issues.validImages.push({ 
          id: charity.id, 
          name: charity.name,
          logo: charity.logo,
          coverImage: charity.coverImage,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        total: allCharities.length,
        valid: issues.validImages.length,
        noLogo: issues.noLogo.length,
        noCoverImage: issues.noCoverImage.length,
        invalidLogo: issues.invalidLogo.length,
        invalidCoverImage: issues.invalidCoverImage.length,
        undefinedPrefix: issues.undefinedPrefix.length,
      },
      issues: {
        noLogo: issues.noLogo.slice(0, 10), // Limit to first 10
        noCoverImage: issues.noCoverImage.slice(0, 10),
        invalidLogo: issues.invalidLogo.slice(0, 10),
        invalidCoverImage: issues.invalidCoverImage.slice(0, 10),
        undefinedPrefix: issues.undefinedPrefix.slice(0, 20),
        validExamples: issues.validImages.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error('Error checking charity images:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check charity images',
      },
      { status: 500 }
    );
  }
}
