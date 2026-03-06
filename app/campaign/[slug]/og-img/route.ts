import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { needsEmojiFallback } from "@/lib/utils/campaign-emojis";
import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const R2_BASE =
  process.env.R2_PUBLIC_ACCESS_KEY ||
  "https://pub-bc49c704eeac4df0a625097110e79d09.r2.dev";
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const MAX_BYTES = 400 * 1024;

function normalizeCoverUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  let u = url.trim();
  const lower = u.toLowerCase();
  if (["undefined", "null", "about:blank", "n/a", "na", ""].includes(lower))
    return null;
  if (u.startsWith("undefined/"))
    u = `${R2_BASE.replace(/\/$/, "")}/${u.replace(/^undefined\//, "")}`;
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    const base = process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";
    u = u.startsWith("/") ? `${base}${u}` : `${base}/${u}`;
  }
  return u;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) return new NextResponse("Not found", { status: 404 });

    const [row] = await db
      .select({ coverImageUrl: campaigns.coverImageUrl })
      .from(campaigns)
      .where(eq(campaigns.slug, slug))
      .limit(1);

    const coverUrl = normalizeCoverUrl(row?.coverImageUrl ?? null);
    const useCover =
      coverUrl && !needsEmojiFallback(row?.coverImageUrl ?? undefined);

    if (!useCover) {
      return serveFallback();
    }

    const res = await fetch(coverUrl, {
      headers: { "User-Agent": "ChainfunditOG/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return serveFallback();

    const buf = Buffer.from(await res.arrayBuffer());

    const optimized = await sharp(buf)
      .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const body =
      optimized.length > MAX_BYTES
        ? await sharp(optimized).png({ compressionLevel: 9, palette: true }).toBuffer()
        : optimized;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return serveFallback();
  }
}

function serveFallback(): NextResponse {
  const fallbackPath = join(process.cwd(), "public", "og-campaign.png");
  try {
    const body = readFileSync(fallbackPath);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    const base = process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";
    return NextResponse.redirect(`${base.replace(/\/$/, "")}/og-campaign.png`, 302);
  }
}
