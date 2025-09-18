import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema/campaigns';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { closeCampaign, closeEligibleCampaigns, getCampaignClosureStats } from '@/lib/utils/campaign-closure';

/**
 * POST /api/campaigns/close - Close campaigns automatically or manually
 */
export async function POST(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, campaignId } = body;

    if (action === 'close_all') {
      // Close all eligible campaigns automatically
      const result = await closeEligibleCampaigns();
      
      return NextResponse.json({
        success: true,
        message: `Closed ${result.closed.length} campaigns`,
        data: {
          closed: result.closed,
          errors: result.errors,
          summary: {
            totalClosed: result.closed.length,
            totalErrors: result.errors.length
          }
        }
      });

    } else if (action === 'close_single' && campaignId) {
      // Close a specific campaign manually
      const campaign = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, campaignId))
        .limit(1);

      if (!campaign.length) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );
      }

      if (campaign[0].status === 'closed') {
        return NextResponse.json(
          { success: false, error: 'Campaign is already closed' },
          { status: 400 }
        );
      }

      const result = await closeCampaign(campaignId, 'manual', campaign[0].creatorId);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Campaign closed successfully',
          data: result
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "close_all" or "close_single" with campaignId' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in campaign closure API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/campaigns/close - Get campaign closure statistics
 */
export async function GET(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const stats = await getCampaignClosureStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting campaign closure stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
