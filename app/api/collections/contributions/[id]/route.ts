import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collectionContributions, collections } from "@/lib/schema/collections";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contribution = await db.query.collectionContributions.findFirst({
      where: eq(collectionContributions.id, id),
    });

    if (!contribution) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    const collection = await db.query.collections.findFirst({
      where: eq(collections.id, contribution.collectionId),
    });

    return NextResponse.json({
      contribution,
      collection,
    });
  } catch (error) {
    console.error("Error fetching collection contribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch contribution" },
      { status: 500 }
    );
  }
}