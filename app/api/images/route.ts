import { NextRequest, NextResponse } from "next/server";

/**
 * Image proxy route for serving external/R2 images to social media crawlers.
 *
 * Usage: /api/images?url=[encoded-image-url]
 * Example: /api/images?url=https%3A%2F%2Fpub-xxxx.r2.dev%2Fimage.jpg
 *
 * NOTE: We also have a catch-all route at `app/api/images/[...path]/route.ts` for
 * backwards compatibility, but `og:image` commonly uses the query-param form
 * which must be handled at `/api/images` (no path) as well.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrlParam = searchParams.get("url");

    let imageUrl: string | null = imageUrlParam;
    if (imageUrl) {
      try {
        imageUrl = decodeURIComponent(imageUrl);
        if (imageUrl.includes("%")) imageUrl = decodeURIComponent(imageUrl);
      } catch {
        // use as-is
      }
    }

    if (!imageUrl) {
      return new NextResponse("Image URL required", { status: 400 });
    }

    // Validate that it's a valid URL
    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      // If it's not a full URL, it might be a relative path or filename
      // Try to construct the R2 URL
      const r2BaseUrl = process.env.R2_PUBLIC_ACCESS_KEY;
      if (r2BaseUrl) {
        const cleanBaseUrl = r2BaseUrl.replace(/\/$/, "");
        imageUrl = `${cleanBaseUrl}/${imageUrl.replace(/^\//, "")}`;
      } else {
        return new NextResponse("Invalid image URL", { status: 400 });
      }
    }

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChainfunditImageProxy/1.0)",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch image from ${imageUrl}: ${response.status} ${response.statusText}`,
      );
      return new NextResponse("Image not found", { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

