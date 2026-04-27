import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { careerApplications, careerOpenings } from "@/lib/schema";
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
    const limit = Number(searchParams.get("limit") || 50);
    const offset = Number(searchParams.get("offset") || 0);

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          sql`${careerApplications.fullName} ILIKE ${`%${search}%`}`,
          sql`${careerApplications.email} ILIKE ${`%${search}%`}`,
          sql`${careerApplications.phone} ILIKE ${`%${search}%`}`,
          sql`${careerOpenings.title} ILIKE ${`%${search}%`}`
        )
      );
    }
    if (decision && decision !== "all") {
      conditions.push(eq(careerApplications.decision, decision));
    }

    const applications = await db
      .select({
        id: careerApplications.id,
        careerOpeningId: careerApplications.careerOpeningId,
        fullName: careerApplications.fullName,
        email: careerApplications.email,
        phone: careerApplications.phone,
        cityState: careerApplications.cityState,
        linkedInUrl: careerApplications.linkedInUrl,
        portfolioUrl: careerApplications.portfolioUrl,
        coverLetter: careerApplications.coverLetter,
        additionalInfo: careerApplications.additionalInfo,
        consentToContact: careerApplications.consentToContact,
        decision: careerApplications.decision,
        createdAt: careerApplications.createdAt,
        resumeFile: careerApplications.resumeFile,
        roleTitle: careerOpenings.title,
      })
      .from(careerApplications)
      .innerJoin(
        careerOpenings,
        eq(careerApplications.careerOpeningId, careerOpenings.id)
      )
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(careerApplications.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ count: count() })
      .from(careerApplications)
      .innerJoin(
        careerOpenings,
        eq(careerApplications.careerOpeningId, careerOpenings.id)
      )
      .where(conditions.length ? and(...conditions) : undefined);

    return NextResponse.json({
      applications: applications.map((application) => ({
        ...application,
        resumeFile: sanitizeFileMeta(application.resumeFile),
        hasResume: Boolean(application.resumeFile),
        createdAt:
          application.createdAt instanceof Date
            ? application.createdAt.toISOString()
            : application.createdAt,
      })),
      total: Number(totalResult?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching career applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch career applications" },
      { status: 500 }
    );
  }
}
