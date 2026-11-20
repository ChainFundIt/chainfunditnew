import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  collectionContributions,
  collectionPayouts,
  collections,
} from "@/lib/schema/collections";
import { getCollectionCategory } from "@/lib/collections/categories";
import {
  getDashboardUser,
  getOwnedCollection,
  isMissingCollectionsTable,
} from "@/lib/collections/owner";
import {
  getActiveCollectionPayouts,
  getCollectionBalances,
  getCollectionPayoutReadiness,
} from "@/lib/collections/payout-balance";

export async function GET(
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

    const [contributions, payouts, balances, activePayouts] = await Promise.all([
      db
        .select()
        .from(collectionContributions)
        .where(eq(collectionContributions.collectionId, collection.id))
        .orderBy(desc(collectionContributions.createdAt)),
      db
        .select()
        .from(collectionPayouts)
        .where(eq(collectionPayouts.collectionId, collection.id))
        .orderBy(desc(collectionPayouts.createdAt)),
      getCollectionBalances([collection.id]),
      getActiveCollectionPayouts([collection.id]),
    ]);

    return NextResponse.json({
      collection,
      contributions,
      payouts,
      balance: balances.get(collection.id),
      activePayout: activePayouts.get(collection.id) ?? null,
      payoutReadiness: getCollectionPayoutReadiness(collection.currency, user),
    });
  } catch (error) {
    console.error("Error loading owner collection:", error);
    if (isMissingCollectionsTable(error)) {
      return NextResponse.json(
        {
          error:
            "Collections database tables are missing. Run: pnpm db:migrate-collections",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to load collection" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const updates: {
      title?: string;
      description?: string | null;
      category?: string;
      organiserName?: string;
      coverImage?: string | null;
      targetAmount?: string | null;
      dueAt?: Date | null;
      isPublic?: boolean;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if ("title" in body) {
      const title = String(body.title || "").trim();
      if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }
      updates.title = title;
    }

    if ("description" in body) {
      updates.description = body.description
        ? String(body.description).trim()
        : null;
    }

    if ("category" in body) {
      const category = String(body.category || "").trim();
      if (!getCollectionCategory(category)) {
        return NextResponse.json(
          { error: "Choose a valid collection category" },
          { status: 400 }
        );
      }
      updates.category = category;
    }

    if ("organiserName" in body) {
      const organiserName = String(body.organiserName || "").trim();
      if (!organiserName) {
        return NextResponse.json(
          { error: "Organiser name is required" },
          { status: 400 }
        );
      }
      updates.organiserName = organiserName;
    }

    if ("coverImage" in body) {
      updates.coverImage = body.coverImage
        ? String(body.coverImage).trim()
        : null;
    }

    if ("targetAmount" in body) {
      if (body.targetAmount == null || body.targetAmount === "") {
        updates.targetAmount = null;
      } else {
        const amount = Number(body.targetAmount);
        if (!Number.isFinite(amount) || amount < 0) {
          return NextResponse.json(
            { error: "Target amount must be zero or greater" },
            { status: 400 }
          );
        }
        updates.targetAmount = amount.toFixed(2);
      }
    }

    if ("dueAt" in body) {
      if (!body.dueAt) {
        updates.dueAt = null;
      } else {
        const dueAt = new Date(body.dueAt);
        if (Number.isNaN(dueAt.getTime())) {
          return NextResponse.json(
            { error: "Closing date is invalid" },
            { status: 400 }
          );
        }
        updates.dueAt = dueAt;
      }
    }

    if ("isPublic" in body) {
      if (typeof body.isPublic !== "boolean") {
        return NextResponse.json(
          { error: "Visibility must be true or false" },
          { status: 400 }
        );
      }
      updates.isPublic = body.isPublic;
    }

    const [updated] = await db
      .update(collections)
      .set(updates)
      .where(eq(collections.id, collection.id))
      .returning();

    return NextResponse.json({ collection: updated });
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}
