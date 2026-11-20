import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  collectionContributions,
  collectionPayouts,
  collections,
} from "@/lib/schema/collections";
import { users } from "@/lib/schema/users";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";
import { getCollectionBalances } from "@/lib/collections/payout-balance";

function adminAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error.message === "2FA verification required") {
      return NextResponse.json(
        { error: "2FA verification required" },
        { status: 403 }
      );
    }
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);
    const { id } = await params;

    const [collection] = await db
      .select({
        id: collections.id,
        title: collections.title,
        slug: collections.slug,
        description: collections.description,
        category: collections.category,
        organiserName: collections.organiserName,
        coverImage: collections.coverImage,
        currency: collections.currency,
        targetAmount: collections.targetAmount,
        status: collections.status,
        isPublic: collections.isPublic,
        dueAt: collections.dueAt,
        createdAt: collections.createdAt,
        creatorName: users.fullName,
        creatorEmail: users.email,
      })
      .from(collections)
      .leftJoin(users, eq(collections.creatorId, users.id))
      .where(eq(collections.id, id))
      .limit(1);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const [contributions, payouts, balances] = await Promise.all([
      db
        .select()
        .from(collectionContributions)
        .where(eq(collectionContributions.collectionId, id))
        .orderBy(desc(collectionContributions.createdAt))
        .limit(50),
      db
        .select({
          id: collectionPayouts.id,
          requestedAmount: collectionPayouts.requestedAmount,
          netAmount: collectionPayouts.netAmount,
          currency: collectionPayouts.currency,
          status: collectionPayouts.status,
          payoutProvider: collectionPayouts.payoutProvider,
          rejectionReason: collectionPayouts.rejectionReason,
          failureReason: collectionPayouts.failureReason,
          createdAt: collectionPayouts.createdAt,
        })
        .from(collectionPayouts)
        .where(eq(collectionPayouts.collectionId, id))
        .orderBy(desc(collectionPayouts.createdAt)),
      getCollectionBalances([id]),
    ]);

    return NextResponse.json({
      collection,
      contributions,
      payouts,
      balance: balances.get(id),
    });
  } catch (error) {
    const authResponse = adminAuthError(error);
    if (authResponse) return authResponse;
    console.error("Error fetching admin collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);
    const { id } = await params;
    const body = await request.json();
    const action = body.action as string;

    const [existing] = await db
      .select({ id: collections.id, status: collections.status, isPublic: collections.isPublic })
      .from(collections)
      .where(eq(collections.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const updates: {
      status?: string;
      isPublic?: boolean;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (action === "close") {
      updates.status = "closed";
    } else if (action === "reopen") {
      updates.status = "active";
    } else if (action === "hide") {
      updates.isPublic = false;
    } else if (action === "show") {
      updates.isPublic = true;
    } else {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    const [updated] = await db
      .update(collections)
      .set(updates)
      .where(eq(collections.id, id))
      .returning();

    return NextResponse.json({
      message:
        action === "close"
          ? "Collection closed"
          : action === "reopen"
            ? "Collection reopened"
            : action === "hide"
              ? "Collection hidden"
              : "Collection is public again",
      collection: updated,
    });
  } catch (error) {
    const authResponse = adminAuthError(error);
    if (authResponse) return authResponse;
    console.error("Error updating admin collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}
