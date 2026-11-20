import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { collections } from "@/lib/schema/collections";
import { getDashboardUser, getOwnedCollection } from "@/lib/collections/owner";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getDashboardUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const collection = await getOwnedCollection(user.id, id);
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (collection.status === "closed") {
      return NextResponse.json({ collection });
    }

    const [updated] = await db
      .update(collections)
      .set({
        status: "closed",
        updatedAt: new Date(),
      })
      .where(eq(collections.id, collection.id))
      .returning();

    return NextResponse.json({ collection: updated });
  } catch (error) {
    console.error("Error closing collection:", error);
    return NextResponse.json(
      { error: "Failed to close collection" },
      { status: 500 }
    );
  }
}
