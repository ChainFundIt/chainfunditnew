export async function shortenLink(longUrl: string): Promise<string | null> {
  const apiKey =
    process.env.SHORT_IO_SECRET_KEY ??
    process.env.SHORT_IO_API_KEY ??
    process.env.SHORTIO_API_KEY;
  const domain = process.env.SHORT_IO_DOMAIN ?? process.env.SHORTIO_DOMAIN;

  if (!apiKey) {
    console.warn(
      "Short.io not configured (missing SHORT_IO_SECRET_KEY / SHORT_IO_API_KEY), skipping link shortening"
    );
    return null;
  }

  try {
    if (!domain) {
      console.warn(
        "Short.io domain not configured (missing SHORT_IO_DOMAIN). Attempting link creation without explicit domain."
      );
    }

    const res = await fetch("https://api.short.io/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Short.io uses raw API key (not "Bearer <token>")
        Authorization: apiKey,
      },
      body: JSON.stringify({
        originalURL: longUrl,
        ...(domain ? { domain } : {}),
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      console.error("Failed to shorten link:", res.status, res.statusText, errorBody);
      return null;
    }

    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;

    const maybeShortURL = (data as any).secureShortURL ?? (data as any).shortURL;
    return typeof maybeShortURL === "string" ? maybeShortURL : null;
  } catch (error) {
    console.error("Error shortening link:", error);
    return null;
  }
}