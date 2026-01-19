import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { careerOpenings } from "@/lib/schema";
import { desc, asc } from "drizzle-orm";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";

const toList = (value: unknown) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
};

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuthWith2FA(request);

    const openings = await db
      .select()
      .from(careerOpenings)
      .orderBy(asc(careerOpenings.sortOrder), desc(careerOpenings.createdAt));

    return NextResponse.json({ openings });
  } catch (error) {
    console.error("Error fetching career openings:", error);

    if (error instanceof Error) {
      if (error.message === "Authentication required") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      if (error.message === "2FA verification required") {
        return NextResponse.json(
          { error: "2FA verification required" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch career openings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuthWith2FA(request);

    const body = await request.json();
    const {
      title,
      department,
      location,
      employmentType,
      summary,
      responsibilities,
      requirements,
      applyUrl,
      isActive = true,
      sortOrder = 0,
    } = body || {};

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Role title is required" },
        { status: 400 }
      );
    }

    const [opening] = await db
      .insert(careerOpenings)
      .values({
        title: title.trim(),
        department: department?.trim?.() || null,
        location: location?.trim?.() || null,
        employmentType: employmentType?.trim?.() || null,
        summary: summary?.trim?.() || null,
        responsibilities: toList(responsibilities),
        requirements: toList(requirements),
        applyUrl: applyUrl?.trim?.() || null,
        isActive: Boolean(isActive),
        sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ opening });
  } catch (error) {
    console.error("Error creating career opening:", error);

    if (error instanceof Error) {
      if (error.message === "Authentication required") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      if (error.message === "2FA verification required") {
        return NextResponse.json(
          { error: "2FA verification required" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create career opening" },
      { status: 500 }
    );
  }
}
