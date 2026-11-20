import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  collectionContributions,
  collections,
} from "@/lib/schema/collections";
import { eq, sql } from "drizzle-orm";
import { findCollectionByIdOrSlug } from "@/lib/collections/resolve-collection";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await findCollectionByIdOrSlug(id);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    if (!collection.isPublic) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    const stats = await db
      .select({
        totalContributions: sql<number>`COUNT(*)`,
        totalRaised: sql<number>`COALESCE(SUM(CAST(${collectionContributions.amount} AS NUMERIC)), 0)`,
        successfulContributions: sql<number>`COUNT(*) FILTER (WHERE ${collectionContributions.paymentStatus} = 'completed')`,
      })
      .from(collectionContributions)
      .where(eq(collectionContributions.collectionId, collection.id));

    const raised = stats[0]?.totalRaised ?? 0;
    const normalized = {
      ...collection,
      totalRaised: String(raised),
    };

    return NextResponse.json({
      collection: normalized,
      stats: stats[0] || {
        totalContributions: 0,
        totalRaised: 0,
        successfulContributions: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}