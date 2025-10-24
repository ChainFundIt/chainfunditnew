import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

/**
 * PATCH /api/admin/campaigns/bulk
 * Perform bulk actions on multiple campaigns
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignIds, action, ...actionData } = body;

    if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
      return NextResponse.json(
        { error: 'Campaign IDs are required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let updatedCampaigns;
    const updateData = {
      updatedAt: new Date(),
    };

    switch (action) {
      case 'pause':
        updatedCampaigns = await db
          .update(campaigns)
          .set({ 
            ...updateData,
            status: 'paused',
          })
          .where(inArray(campaigns.id, campaignIds))
          .returning();
        break;

      case 'resume':
        updatedCampaigns = await db
          .update(campaigns)
          .set({ 
            ...updateData,
            status: 'active',
          })
          .where(inArray(campaigns.id, campaignIds))
          .returning();
        break;

      case 'close':
        updatedCampaigns = await db
          .update(campaigns)
          .set({ 
            ...updateData,
            status: 'closed',
          })
          .where(inArray(campaigns.id, campaignIds))
          .returning();
        break;

      case 'verify':
        updatedCampaigns = await db
          .update(campaigns)
          .set({ 
            ...updateData,
            isActive: true,
          })
          .where(inArray(campaigns.id, campaignIds))
          .returning();
        break;

      case 'unverify':
        updatedCampaigns = await db
          .update(campaigns)
          .set({ 
            ...updateData,
            isActive: false,
          })
          .where(inArray(campaigns.id, campaignIds))
          .returning();
        break;

      case 'update_category':
        return NextResponse.json(
          { error: 'Category management not supported in current schema' },
          { status: 400 }
        );

      case 'delete':
        // Soft delete by setting status to closed
        updatedCampaigns = await db
          .update(campaigns)
          .set({ 
            ...updateData,
            status: 'closed',
          })
          .where(inArray(campaigns.id, campaignIds))
          .returning();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      updatedCount: updatedCampaigns.length,
        updatedCampaigns: updatedCampaigns.map(campaign => ({
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          isActive: campaign.isActive,
        })),
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
