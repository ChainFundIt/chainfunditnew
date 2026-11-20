import { NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { collections } from "@/lib/schema/collections";
import { users } from "@/lib/schema/users";

export async function getDashboardUser(request: NextRequest) {
  const userEmail = await getUserFromRequest(request);
  if (!userEmail) return null;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      accountNumber: users.accountNumber,
      bankCode: users.bankCode,
      bankName: users.bankName,
      accountName: users.accountName,
      accountVerified: users.accountVerified,
      accountChangeRequested: users.accountChangeRequested,
    })
    .from(users)
    .where(sql`LOWER(${users.email}) = LOWER(${userEmail})`)
    .limit(1);

  return user ?? null;
}

export async function getOwnedCollection(userId: string, collectionId: string) {
  const [collection] = await db
    .select()
    .from(collections)
    .where(
      and(eq(collections.id, collectionId), eq(collections.creatorId, userId))
    )
    .limit(1);

  return collection ?? null;
}

export function isMissingCollectionsTable(error: unknown) {
  return (
    error &&
    typeof error === "object" &&
    "cause" in error &&
    error.cause &&
    typeof error.cause === "object" &&
    "code" in error.cause &&
    String((error.cause as { code?: string }).code) === "42P01"
  );
}
