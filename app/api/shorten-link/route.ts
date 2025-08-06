import { NextRequest, NextResponse } from "next/server";
import { shortenLink } from "@/lib/shorten-link";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const shortUrl = await shortenLink(url);

    if (!shortUrl) {
      return NextResponse.json(
        { error: "Failed to shorten link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ shortUrl });
  } catch (error) {
    console.error("Error shortening link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 