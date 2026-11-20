import { db } from "@/lib/db";
import { collections, type Collection } from "@/lib/schema/collections";
import { eq } from "drizzle-orm";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function findCollectionByIdOrSlug(
  idOrSlug: string
): Promise<Collection | undefined> {
  const isUuid = uuidRegex.test(idOrSlug);

  if (isUuid) {
    const byId = await db.query.collections.findFirst({
      where: eq(collections.id, idOrSlug),
    });
    if (byId) return byId;
  }

  return db.query.collections.findFirst({
    where: eq(collections.slug, idOrSlug),
  });
}