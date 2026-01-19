import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { careerOpenings } from "@/lib/schema";
import { eq } from "drizzle-orm";
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);
    const { id } = await context.params;

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
      isActive,
      sortOrder,
    } = body || {};

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof title === "string") updates.title = title.trim();
    if (typeof department === "string") updates.department = department.trim();
    if (typeof location === "string") updates.location = location.trim();
    if (typeof employmentType === "string") {
      updates.employmentType = employmentType.trim();
    }
    if (typeof summary === "string") updates.summary = summary.trim();
    if (responsibilities !== undefined) {
      updates.responsibilities = toList(responsibilities);
    }
    if (requirements !== undefined) {
      updates.requirements = toList(requirements);
    }
    if (typeof applyUrl === "string") updates.applyUrl = applyUrl.trim();
    if (typeof isActive === "boolean") updates.isActive = isActive;
    if (sortOrder !== undefined) {
      updates.sortOrder = Number.isFinite(Number(sortOrder))
        ? Number(sortOrder)
        : 0;
    }

    const [opening] = await db
      .update(careerOpenings)
      .set(updates)
      .where(eq(careerOpenings.id, id))
      .returning();

    if (!opening) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ opening });
  } catch (error) {
    console.error("Error updating career opening:", error);

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
      { error: "Failed to update career opening" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);
    const { id } = await context.params;

    const [deleted] = await db
      .delete(careerOpenings)
      .where(eq(careerOpenings.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting career opening:", error);

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
      { error: "Failed to delete career opening" },
      { status: 500 }
    );
  }
}
