import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minProgress = Number(searchParams.get("minProgress") || "70");
    const maxProgress = Number(searchParams.get("maxProgress") || "100");
    const sourceLimit = Math.min(
      Math.max(Number(searchParams.get("sourceLimit") || "250"), 20),
      500,
    );
    const take = Math.min(
      Math.max(Number(searchParams.get("take") || "10"), 1),
      20,
    );

    const rows = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        reason: campaigns.reason,
        coverImageUrl: campaigns.coverImageUrl,
        currentAmount: campaigns.currentAmount,
        goalAmount: campaigns.goalAmount,
        createdAt: campaigns.createdAt,
      })
      .from(campaigns)
      .where(and(isNull(campaigns.deletedAt), eq(campaigns.visibility, "public")))
      .orderBy(desc(campaigns.createdAt))
      .limit(sourceLimit);

    const eligible = rows
      .map((row) => {
        const goalAmount = Number(row.goalAmount) || 0;
        const currentAmount = Number(row.currentAmount) || 0;
        const progress =
          goalAmount > 0 ? Math.min(100, Math.round((currentAmount / goalAmount) * 100)) : 0;

        return {
          id: row.id,
          title: row.title || "Featured Campaign",
          label: row.reason || "Urgent Cause",
          imageUrl: row.coverImageUrl || "/images/story-2.png",
          progress,
          createdAt: row.createdAt,
        };
      })
      .filter((row) => row.progress >= minProgress && row.progress <= maxProgress)
      .sort((a, b) => {
        if (b.progress !== a.progress) {
          return b.progress - a.progress;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, take)
      .map(({ createdAt, ...row }) => row);

    return NextResponse.json({
      success: true,
      data: eligible,
      meta: {
        sourceCount: rows.length,
        eligibleCount: eligible.length,
        minProgress,
        maxProgress,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero campaigns" },
      { status: 500 },
    );
  }
}
