import { ImageResponse } from "next/og";

export const runtime = "edge";
export const revalidate = 86400;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function TwitterImage() {
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
            borderRadius: 9999,
            background: "rgba(34,197,94,0.2)",
            border: "3px solid rgba(34,197,94,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            marginBottom: 28,
            fontSize: 48,
            fontWeight: 900,
          }}
        >
          C
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


