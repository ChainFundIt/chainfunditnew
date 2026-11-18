import { db } from "@/lib/db";
import {
  collectionContributions,
  collections,
} from "@/lib/schema/collections";
import { eq, sql } from "drizzle-orm";

export async function completeCollectionContribution(params: {
  contributionId: string;
  paymentReference: string;
}): Promise<{ contributionId: string; collectionSlug: string }> {
  const [contribution] = await db
    .select({
      id: collectionContributions.id,
      collectionId: collectionContributions.collectionId,
      amount: collectionContributions.amount,
      paymentStatus: collectionContributions.paymentStatus,
    })
    .from(collectionContributions)
    .where(eq(collectionContributions.id, params.contributionId))
    .limit(1);

  if (!contribution) {
    throw new Error("Collection contribution not found");
  }

  const [collection] = await db
    .select({
      id: collections.id,
      slug: collections.slug,
    })
    .from(collections)
    .where(eq(collections.id, contribution.collectionId))
    .limit(1);

  if (!collection) {
    throw new Error("Collection not found");
  }

  if (contribution.paymentStatus !== "completed") {
    await db
      .update(collectionContributions)
      .set({
        paymentStatus: "completed",
        transactionId: params.paymentReference,
        paymentIntentId: params.paymentReference,
        updatedAt: new Date(),
      })
      .where(eq(collectionContributions.id, contribution.id));

    await db
      .update(collections)
      .set({
        totalRaised: sql`${collections.totalRaised} + ${contribution.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, contribution.collectionId));
  }

  return {
    contributionId: contribution.id,
    collectionSlug: collection.slug,
  };
}