import { ImageResponse } from "next/og";

export const runtime = "edge";
export const revalidate = 86400;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

async function getLogoDataUri() {
  // IMPORTANT: Don't fetch from the public site here (can be flaky and cause preview images to fail).
  // Bundle the SVG with the route and embed it as a data URI.
  const svg = await fetch(new URL("./og-assets/logo.svg", import.meta.url)).then((r) =>
    r.text(),
  );
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default async function TwitterImage() {
  const logoDataUri = await getLogoDataUri();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #052e16 0%, #16a34a 35%, #0f172a 100%)",
          color: "white",
          padding: "64px",
        }}
      >
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: 30,
            background: "rgba(255,255,255,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            marginBottom: 28,
          }}
        >
          <img
            src={logoDataUri}
            width={92}
            height={92}
            alt="Chainfundit logo"
            style={{ display: "block" }}
          />
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 900,
            letterSpacing: -1.8,
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          Chainfundit
        </div>
        <div style={{ height: 18 }} />
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            opacity: 0.94,
            textAlign: "center",
          }}
        >
          Raise funds, support dreams
        </div>
      </div>
    ),
    size,
  );
}


