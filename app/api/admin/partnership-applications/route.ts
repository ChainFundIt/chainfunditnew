import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partnershipApplications } from "@/lib/schema";
import { and, desc, or, sql, count, eq } from "drizzle-orm";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuthWith2FA(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const decision = searchParams.get("decision") || "";
    const limit = Number(searchParams.get("limit") || 20);
    const offset = Number(searchParams.get("offset") || 0);

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          sql`${partnershipApplications.fullName} ILIKE ${`%${search}%`}`,
          sql`${partnershipApplications.email} ILIKE ${`%${search}%`}`,
          sql`${partnershipApplications.phone} ILIKE ${`%${search}%`}`
        )
      );
    }
    if (decision && decision !== "all") {
      conditions.push(eq(partnershipApplications.decision, decision));
    }

    const applications = await db
      .select()
      .from(partnershipApplications)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(partnershipApplications.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ count: count() })
      .from(partnershipApplications)
      .where(conditions.length ? and(...conditions) : undefined);

    const sanitized = applications.map((application) => ({
      ...application,
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
    console.error("Error fetching partnership applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch partnership applications" },
      { status: 500 }
    );
  }
}
