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

export default async function OpenGraphImage() {
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
            "radial-gradient(circle at 20% 20%, #16a34a 0%, #0f172a 45%, #020617 100%)",
          color: "white",
          padding: "64px",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 28,
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
            width={86}
            height={86}
            alt="Chainfundit logo"
            style={{ display: "block" }}
          />
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -1.5,
            lineHeight: 1.1,
          }}
        >
          Chainfundit
        </div>
        <div style={{ height: 18 }} />
        <div
          style={{
            fontSize: 34,
            fontWeight: 500,
            opacity: 0.92,
          }}
        >
          Raise funds, support dreams
        </div>
        <div style={{ height: 42 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 26,
            fontWeight: 600,
            opacity: 0.9,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 9999,
              background: "#22c55e",
              boxShadow: "0 0 0 6px rgba(34,197,94,0.18)",
            }}
          />
          chainfundit.com
        </div>
      </div>
    ),
    size,
  );
}


