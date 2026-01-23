import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ambassadorApplications } from "@/lib/schema";
import { and, desc, or, sql, count, eq } from "drizzle-orm";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";

const sanitizeFileMeta = (file: any) => {
  if (!file) return null;
  return {
    name: file.name,
    type: file.type,
    size: file.size,
  };
};

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuthWith2FA(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const decision = searchParams.get("decision") || "";
    const sort = searchParams.get("sort") || "createdAt";
    const limit = Number(searchParams.get("limit") || 20);
    const offset = Number(searchParams.get("offset") || 0);

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          sql`${ambassadorApplications.fullName} ILIKE ${`%${search}%`}`,
          sql`${ambassadorApplications.email} ILIKE ${`%${search}%`}`,
          sql`${ambassadorApplications.phone} ILIKE ${`%${search}%`}`
        )
      );
    }
    if (decision && decision !== "all") {
      conditions.push(eq(ambassadorApplications.decision, decision));
    }

    const decisionOrder = sql`CASE ${ambassadorApplications.decision}
      WHEN 'pending' THEN 0
      WHEN 'maybe' THEN 1
      WHEN 'yes' THEN 2
      WHEN 'no' THEN 3
      ELSE 4
    END`;

    const applications = await db
      .select()
      .from(ambassadorApplications)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(
        ...(sort === "decision"
          ? [decisionOrder, desc(ambassadorApplications.createdAt)]
          : [desc(ambassadorApplications.createdAt)])
      )
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ count: count() })
      .from(ambassadorApplications)
      .where(conditions.length ? and(...conditions) : undefined);

    const sanitized = applications.map((application) => ({
      ...application,
      cvFile: sanitizeFileMeta(application.cvFile),
      introVideoFile: sanitizeFileMeta(application.introVideoFile),
      hasCv: Boolean(application.cvFile),
      hasVideoFile: Boolean(application.introVideoFile),
      createdAt:
        application.createdAt instanceof Date
          ? application.createdAt.toISOString()
          : application.createdAt,
    }));

    return NextResponse.json({
      applications: sanitized,
      total: Number(totalResult?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching ambassador applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch ambassador applications" },
      { status: 500 }
    );
  }
}
