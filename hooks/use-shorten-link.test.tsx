import { renderHook, act } from '@testing-library/react';
import { useShortenLink } from './use-shorten-link';

// Mock fetch globally
global.fetch = jest.fn();

describe('useShortenLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return loading state and error handlers', () => {
    const { result } = renderHook(() => useShortenLink());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.shortenLink).toBe('function');
  });

  it('should successfully shorten a link', async () => {
    const mockResponse = { shortUrl: 'https://dub.co/abc123' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const { result } = renderHook(() => useShortenLink());

    let shortUrl: string | null = null;
    await act(async () => {
      shortUrl = await result.current.shortenLink('https://example.com/very-long-url');
    });

    expect(shortUrl).toBe('https://dub.co/abc123');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledWith('/api/shorten-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://example.com/very-long-url' }),
    });
  });

  it('should handle API errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Failed to shorten link' }),
    });

    const { result } = renderHook(() => useShortenLink());

    let shortUrl: string | null = null;
    await act(async () => {
      shortUrl = await result.current.shortenLink('https://example.com/very-long-url');
    });

    expect(shortUrl).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to shorten link');
  });

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useShortenLink());

    let shortUrl: string | null = null;
    await act(async () => {
      shortUrl = await result.current.shortenLink('https://example.com/very-long-url');
    });

    expect(shortUrl).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Network error');
  });

  it('should handle invalid JSON responses', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    });

    const { result } = renderHook(() => useShortenLink());

    let shortUrl: string | null = null;
    await act(async () => {
      shortUrl = await result.current.shortenLink('https://example.com/very-long-url');
    });

    expect(shortUrl).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Invalid JSON');
  });

  it('should set loading state during API call', async () => {
    const mockResponse = { shortUrl: 'https://dub.co/abc123' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const { result } = renderHook(() => useShortenLink());

    let loadingPromise: Promise<string | null>;
    act(() => {
      loadingPromise = result.current.shortenLink('https://example.com/very-long-url');
    });

    // Check that loading is true during the API call
    expect(result.current.isLoading).toBe(true);

    // Wait for the promise to resolve
    await act(async () => {
      await loadingPromise!;
    });

    expect(result.current.isLoading).toBe(false);
  });
}); 