export async function shortenLink(longUrl: string): Promise<string | null> {
  const apiKey = process.env.SHORT_IO_SECRET_KEY;
  if (!apiKey) {
    console.warn('SHORT_IO_SECRET_KEY not configured, skipping link shortening');
    return null;
  }

  try {
    const res = await fetch("https://api.dub.co/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: longUrl,
      }),
    });

    if (!res.ok) {
      console.error('Failed to shorten link:', res.status, res.statusText);
      return null;
    }
    
    const data = await res.json();
    return data.shortLink || null;
  } catch (error) {
    console.error('Error shortening link:', error);
    return null;
  }
}