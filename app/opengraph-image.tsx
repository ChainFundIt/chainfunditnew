import { ImageResponse } from "next/og";

export const runtime = "edge";
export const revalidate = 86400;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
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
            borderRadius: 9999,
            background: "rgba(34,197,94,0.18)",
            border: "3px solid rgba(34,197,94,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            marginBottom: 28,
            fontSize: 44,
            fontWeight: 800,
          }}
        >
          C
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


