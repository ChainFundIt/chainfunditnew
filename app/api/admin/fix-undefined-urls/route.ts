import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { requireAdminAuth } from '@/lib/admin-auth';

/**
 * POST /api/admin/fix-undefined-urls
 * Fix campaigns with "undefined/" in their image URLs
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdminAuth(request);
    
    console.log('🔍 Searching for campaigns with undefined/ in URLs...');
    
    // Find all campaigns with "undefined/" in any of the image URL fields
    const affectedCampaigns = await db
      .select()
      .from(campaigns)
      .where(
        sql`(
          ${campaigns.coverImageUrl} LIKE 'undefined/%' OR
          ${campaigns.galleryImages} LIKE '%undefined/%' OR
          ${campaigns.documents} LIKE '%undefined/%'
        )`
      );
    
    if (affectedCampaigns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No campaigns found with undefined/ URLs',
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
    const fixedCampaigns: Array<{ id: string; title: string; fixes: string[] }> = [];
    
    for (const campaign of affectedCampaigns) {
      const updates: any = {
        updatedAt: new Date(),
      };
      
      const fixes: string[] = [];
      
      // Fix coverImageUrl
      if (campaign.coverImageUrl && campaign.coverImageUrl.startsWith('undefined/')) {
        const fileName = campaign.coverImageUrl.replace('undefined/', '');
        updates.coverImageUrl = `${cleanBaseUrl}/${fileName}`;
        fixes.push('coverImageUrl');
      }
      
      // Fix galleryImages (JSON stringified array)
      if (campaign.galleryImages) {
        try {
          const galleryArray = JSON.parse(campaign.galleryImages);
          if (Array.isArray(galleryArray)) {
            const fixedGallery = galleryArray.map((url: string) => {
              if (typeof url === 'string' && url.startsWith('undefined/')) {
                const fileName = url.replace('undefined/', '');
                return `${cleanBaseUrl}/${fileName}`;
              }
              return url;
            });
            
            // Only update if something changed
            if (JSON.stringify(fixedGallery) !== JSON.stringify(galleryArray)) {
              updates.galleryImages = JSON.stringify(fixedGallery);
              fixes.push('galleryImages');
            }
          }
        } catch (e) {
          console.warn(`Could not parse galleryImages for campaign "${campaign.title}": ${e}`);
        }
      }
      
      // Fix documents (JSON stringified array)
      if (campaign.documents) {
        try {
          const documentsArray = JSON.parse(campaign.documents);
          if (Array.isArray(documentsArray)) {
            const fixedDocuments = documentsArray.map((url: string) => {
              if (typeof url === 'string' && url.startsWith('undefined/')) {
                const fileName = url.replace('undefined/', '');
                return `${cleanBaseUrl}/${fileName}`;
              }
              return url;
            });
            
            // Only update if something changed
            if (JSON.stringify(fixedDocuments) !== JSON.stringify(documentsArray)) {
              updates.documents = JSON.stringify(fixedDocuments);
              fixes.push('documents');
            }
          }
        } catch (e) {
          console.warn(`Could not parse documents for campaign "${campaign.title}": ${e}`);
        }
      }
      
      // Update the campaign if there are any changes
      if (Object.keys(updates).length > 1) { // More than just updatedAt
        await db
          .update(campaigns)
          .set(updates)
          .where(sql`${campaigns.id} = ${campaign.id}`);
        
        fixedCount++;
        fixedCampaigns.push({
          id: campaign.id,
          title: campaign.title,
          fixes,
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully fixed ${fixedCount} out of ${affectedCampaigns.length} campaign(s)`,
      fixed: fixedCount,
      total: affectedCampaigns.length,
      campaigns: fixedCampaigns,
    });
    
  } catch (error) {
    console.error('Error fixing undefined image URLs:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fix undefined URLs',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/fix-undefined-urls
 * Check how many campaigns have undefined/ URLs (dry run)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdminAuth(request);
    const affectedCampaigns = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        coverImageUrl: campaigns.coverImageUrl,
        galleryImages: campaigns.galleryImages,
        documents: campaigns.documents,
      })
      .from(campaigns)
      .where(
        sql`(
          ${campaigns.coverImageUrl} LIKE 'undefined/%' OR
          ${campaigns.galleryImages} LIKE '%undefined/%' OR
          ${campaigns.documents} LIKE '%undefined/%'
        )`
      );
    
    const issues: Array<{
      id: string;
      title: string;
      coverImageUrl?: string;
      hasGalleryIssues: boolean;
      hasDocumentIssues: boolean;
    }> = [];
    
    for (const campaign of affectedCampaigns) {
      const campaignIssues: any = {
        id: campaign.id,
        title: campaign.title,
        hasGalleryIssues: false,
        hasDocumentIssues: false,
      };
      
      if (campaign.coverImageUrl?.startsWith('undefined/')) {
        campaignIssues.coverImageUrl = campaign.coverImageUrl;
      }
      
      if (campaign.galleryImages) {
        try {
          const galleryArray = JSON.parse(campaign.galleryImages);
          if (Array.isArray(galleryArray)) {
            campaignIssues.hasGalleryIssues = galleryArray.some(
              (url: string) => typeof url === 'string' && url.startsWith('undefined/')
            );
          }
        } catch {}
      }
      
      if (campaign.documents) {
        try {
          const documentsArray = JSON.parse(campaign.documents);
          if (Array.isArray(documentsArray)) {
            campaignIssues.hasDocumentIssues = documentsArray.some(
              (url: string) => typeof url === 'string' && url.startsWith('undefined/')
            );
          }
        } catch {}
      }
      
      issues.push(campaignIssues);
    }
    
    return NextResponse.json({
      success: true,
      count: affectedCampaigns.length,
      campaigns: issues,
      baseUrl: process.env.R2_PUBLIC_ACCESS_KEY || 'NOT SET',
    });
    
  } catch (error) {
    console.error('Error checking undefined URLs:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check undefined URLs',
      },
      { status: 500 }
    );
  }
}

