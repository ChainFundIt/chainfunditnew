import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { needsEmojiFallback } from "@/lib/utils/campaign-emojis";

export const runtime = "nodejs";
export const revalidate = 86400;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const R2_BASE =
  process.env.R2_PUBLIC_ACCESS_KEY ||
  "https://pub-bc49c704eeac4df0a625097110e79d09.r2.dev";

function slugToTitle(slug: string) {
  const decoded = decodeURIComponent(slug);
  const words = decoded
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (!words.length) return "Chainfundit";
  const titled = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return titled.join(" ");
}

function normalizeCoverUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;

  let normalized = url.trim();
  const lower = normalized.toLowerCase();

  if (["undefined", "null", "about:blank", "n/a", "na", ""].includes(lower)) {
    return null;
  }

  if (normalized.startsWith("undefined/")) {
    normalized = `${R2_BASE.replace(/\/$/, "")}/${normalized.replace(
      /^undefined\//,
      "",
    )}`;
  }

  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com").replace(
      /\/$/,
      "",
    );
    normalized = normalized.startsWith("/")
      ? `${baseUrl}${normalized}`
      : `${baseUrl}/${normalized}`;
  }

  return normalized;
}

async function fetchImageDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "ChainfunditOG/1.0" },
      signal: AbortSignal.timeout(10000),
      cache: "force-cache",
    });

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function renderFallback(title: string, subtitle: string) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
        background:
          "radial-gradient(circle at 20% 20%, #16a34a 0%, #0f172a 45%, #020617 100%)",
        color: "white",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.65) 55%, rgba(2,6,23,0.35) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 9999,
              background: "rgba(34,197,94,0.18)",
              border: "3px solid rgba(34,197,94,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
              fontSize: 40,
              fontWeight: 900,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, opacity: 0.95 }}>
            chainfundit.com
          </div>
        </div>

        <div style={{ height: 28 }} />

        <div
          style={{
            fontSize: 62,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: -1.2,
            maxWidth: 980,
            textShadow: "0 10px 40px rgba(0,0,0,0.35)",
          }}
        >
          {title}
        </div>
        <div style={{ height: 18 }} />
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            opacity: 0.92,
            maxWidth: 980,
            textShadow: "0 10px 40px rgba(0,0,0,0.35)",
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function renderCoverImage(title: string, subtitle: string, coverSrc: string) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#020617",
        color: "white",
        overflow: "hidden",
      }}
    >
      <img
        src={coverSrc}
        alt={title}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.12) 0%, rgba(2,6,23,0.4) 35%, rgba(2,6,23,0.88) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            fontWeight: 700,
            opacity: 0.96,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: "#22c55e",
              boxShadow: "0 0 20px rgba(34,197,94,0.6)",
            }}
          />
          Chainfundit Campaign
        </div>

        <div style={{ height: 20 }} />

        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -1.6,
            maxWidth: 960,
            textShadow: "0 12px 36px rgba(0,0,0,0.45)",
          }}
        >
          {title}
        </div>

        <div style={{ height: 16 }} />

        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            maxWidth: 920,
            opacity: 0.96,
            textShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

export default async function CampaignOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fallbackTitle = slugToTitle(slug);
  const fallbackSubtitle = "Support this campaign on Chainfundit";

  try {
    const [campaign] = await db
      .select({
        title: campaigns.title,
        subtitle: campaigns.subtitle,
        description: campaigns.description,
        coverImageUrl: campaigns.coverImageUrl,
      })
      .from(campaigns)
      .where(eq(campaigns.slug, slug))
      .limit(1);

    const title = campaign?.title?.trim() || fallbackTitle;
    const subtitle =
      campaign?.subtitle?.trim() ||
      campaign?.description?.replace(/\s+/g, " ").trim().slice(0, 140) ||
      fallbackSubtitle;

    const normalizedCoverUrl = normalizeCoverUrl(campaign?.coverImageUrl);
    const shouldUseCover =
      normalizedCoverUrl && !needsEmojiFallback(campaign?.coverImageUrl ?? undefined);
    const coverSrc = shouldUseCover
      ? await fetchImageDataUrl(normalizedCoverUrl)
      : null;

    return new ImageResponse(
      coverSrc
        ? renderCoverImage(title, subtitle, coverSrc)
        : renderFallback(title, subtitle),
      size,
    );
  } catch {
    return new ImageResponse(
      renderFallback(fallbackTitle, fallbackSubtitle),
      size,
    );
  }
}

