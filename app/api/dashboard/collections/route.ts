import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { collections } from "@/lib/schema/collections";
import {
  getDashboardUser,
  isMissingCollectionsTable,
} from "@/lib/collections/owner";
import {
  getActiveCollectionPayouts,
  getCollectionBalances,
} from "@/lib/collections/payout-balance";

export async function GET(request: NextRequest) {
  try {
    const user = await getDashboardUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(collections)
      .where(eq(collections.creatorId, user.id))
      .orderBy(desc(collections.createdAt));

    const ids = rows.map((row) => row.id);
    const [balances, activePayouts] = await Promise.all([
      getCollectionBalances(ids),
      getActiveCollectionPayouts(ids),
    ]);

    return NextResponse.json({
      collections: rows.map((collection) => ({
        ...collection,
        balance: balances.get(collection.id),
        activePayout: activePayouts.get(collection.id) ?? null,
      })),
    });
  } catch (error) {
    console.error("Error listing owner collections:", error);
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
      { error: "Failed to load collections" },
      { status: 500 }
    );
  }
}
