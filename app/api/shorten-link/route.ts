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

    // Help with debugging/config: if Short.io isn't configured, don't even attempt.
    const apiKey =
      process.env.SHORT_IO_SECRET_KEY ??
      process.env.SHORT_IO_API_KEY ??
      process.env.SHORTIO_API_KEY;
    const domain = process.env.SHORT_IO_DOMAIN ?? process.env.SHORTIO_DOMAIN;

    if (!apiKey) {
      return NextResponse.json({
        shortUrl: url,
        shortened: false,
        reason: "missing_short_io_api_key",
      });
    }

    if (!domain) {
      return NextResponse.json({
        shortUrl: url,
        shortened: false,
        reason: "missing_short_io_domain",
      });
    }

    const shortUrl = await shortenLink(url);
    // Never hard-fail the UX: if shortening fails (misconfig, 3rd-party error, etc),
    // fall back to the original URL.
    return NextResponse.json({
      shortUrl: shortUrl ?? url,
      shortened: !!shortUrl,
      ...(shortUrl ? {} : { reason: "short_io_request_failed" }),
    });
  } catch (error) {
    console.error("Error shortening link:", error);
    // Same fallback in case request parsing fails unexpectedly.
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 