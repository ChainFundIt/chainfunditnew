import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collectionContributions } from "@/lib/schema/collections";
import { desc, eq } from "drizzle-orm";
import { findCollectionByIdOrSlug } from "@/lib/collections/resolve-collection";

export async function GET(
  request: NextRequest,
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const contributions = await db.query.collectionContributions.findMany({
      where: eq(collectionContributions.collectionId, collection.id),
      orderBy: [desc(collectionContributions.createdAt)],
      limit,
    });

    return NextResponse.json({
      contributions: contributions.filter(
        (entry) => entry.paymentStatus === "completed"
      ),
    });
  } catch (error) {
    console.error("Error fetching collection contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    );
  }
}