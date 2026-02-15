import { ImageResponse } from "next/og";

export const runtime = "edge";
export const revalidate = 86400;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

export default async function CampaignOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // IMPORTANT: Don't hit the database here. Social scrapers are sensitive to latency/timeouts.
  // We render a deterministic branded image (logo + title) based on the slug.
  const title = slugToTitle(slug);
  const subtitle = "Support this campaign on Chainfundit";

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
        {/* overlay for readability */}
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
    ),
    size,
  );
}

