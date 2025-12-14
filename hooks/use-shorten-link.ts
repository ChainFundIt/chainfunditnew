import { useState } from 'react';

export function useShortenLink() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shortenLink = async (longUrl: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shorten-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: longUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten link');
      }

      // If backend fell back to the long URL, surface a useful message in state (but
      // still return the fallback so the UI works).
      if (data?.shortened === false && typeof data?.reason === 'string') {
        setError(data.reason);
      }

      return data.shortUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to shorten link';
      setError(errorMessage);
      console.error('Error shortening link:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    shortenLink,
    isLoading,
    error,
  };
} 