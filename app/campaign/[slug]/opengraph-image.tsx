import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function toBase64(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

async function getLogoDataUri() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";
  const logoUrl = new URL("/images/logo.svg", appUrl).toString();
  const svg = await fetch(logoUrl, { cache: "force-cache" }).then((r) => {
    if (!r.ok) throw new Error(`Failed to fetch logo SVG: ${r.status}`);
    return r.text();
  });
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

function normalizeCoverUrl(coverImageUrl: string | null | undefined) {
  if (!coverImageUrl) return null;
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com").replace(
    /\/$/,
    "",
  );

  let u = coverImageUrl.trim();
  if (!u) return null;

  const r2BaseUrl =
    process.env.R2_PUBLIC_ACCESS_KEY ||
    "https://pub-bc49c704eeac4df0a625097110e79d09.r2.dev";

  if (u.startsWith("undefined/")) {
    u = `${r2BaseUrl.replace(/\/$/, "")}/${u.replace(/^undefined\//, "")}`;
  }

  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    u = u.startsWith("/") ? `${baseUrl}${u}` : `${baseUrl}/${u}`;
  }

  return u;
}

export default async function CampaignOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [campaign] = await db
    .select({
      title: campaigns.title,
      subtitle: campaigns.subtitle,
      coverImageUrl: campaigns.coverImageUrl,
    })
    .from(campaigns)
    .where(eq(campaigns.slug, slug))
    .limit(1);

  const title = campaign?.title || "Chainfundit";
  const subtitle = campaign?.subtitle || "Raise funds, support dreams";

  const logoDataUri = await getLogoDataUri().catch(() => null);
  const coverUrl = normalizeCoverUrl(campaign?.coverImageUrl);

  return new ImageResponse(
    (
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
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}

        {/* dark overlay for readability */}
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
            {logoDataUri ? (
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.92)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
                }}
              >
                <img
                  src={logoDataUri}
                  width={66}
                  height={66}
                  alt="Chainfundit logo"
                  style={{ display: "block" }}
                />
              </div>
            ) : null}
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
    ),
    size,
  );
}

