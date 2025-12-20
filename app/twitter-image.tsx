import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

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


