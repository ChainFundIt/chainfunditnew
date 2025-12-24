import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy route for serving R2 images to social media crawlers
 * This ensures Open Graph images are accessible to Twitter, Facebook, etc.
 * 
 * Usage: /api/images?url=[encoded-r2-url]
 * Example: /api/images?url=https%3A%2F%2Fpub-bc49c704eeac4df0a625097110e79d09.r2.dev%2Fimage.jpg
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrlParam = searchParams.get('url');
    
    // If no URL param, try to reconstruct from path (backward compatibility)
    let imageUrl: string | null = imageUrlParam;
    
    if (!imageUrl) {
      const { path: pathArray } = await params;
      if (pathArray && pathArray.length > 0) {
        const encodedPath = pathArray.join('/');
        try {
          imageUrl = decodeURIComponent(encodedPath);
          if (imageUrl.includes('%')) {
            imageUrl = decodeURIComponent(imageUrl);
          }
        } catch (e) {
          imageUrl = encodedPath;
        }
      }
    } else {
      // Decode the URL parameter
      try {
        imageUrl = decodeURIComponent(imageUrl);
        if (imageUrl.includes('%')) {
          imageUrl = decodeURIComponent(imageUrl);
        }
      } catch (e) {
        // Use as-is if decoding fails
      }
    }
    
    if (!imageUrl) {
      return new NextResponse('Image URL required', { status: 400 });
    }

    // Validate that it's a valid URL
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      // If it's not a full URL, it might be a relative path or filename
      // Try to construct the R2 URL
      const r2BaseUrl = process.env.R2_PUBLIC_ACCESS_KEY;
      if (r2BaseUrl) {
        const cleanBaseUrl = r2BaseUrl.replace(/\/$/, '');
        imageUrl = `${cleanBaseUrl}/${imageUrl.replace(/^\//, '')}`;
      } else {
        return new NextResponse('Invalid image URL', { status: 400 });
      }
    }

    // Fetch the image from R2
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ChainfunditImageProxy/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch image from ${imageUrl}: ${response.status} ${response.statusText}`);
      return new NextResponse('Image not found', { status: response.status });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers for social media crawlers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

