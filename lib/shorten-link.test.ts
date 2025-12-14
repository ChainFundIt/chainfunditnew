import { shortenLink } from './shorten-link';

// Mock fetch globally
global.fetch = jest.fn();

describe('shortenLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.SHORT_IO_SECRET_KEY;
  });

  it('should return null when SHORT_IO_SECRET_KEY is not set', async () => {
    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should return null when API request fails', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-token';
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBeNull();
    expect(fetch).toHaveBeenCalledWith('https://api.dub.co/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        url: 'https://example.com/very-long-url',
      }),
    });
  });

  it('should return shortened URL when API request succeeds', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-token';
    
    const mockResponse = {
      shortLink: 'https://dub.co/abc123',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBe('https://dub.co/abc123');
    expect(fetch).toHaveBeenCalledWith('https://api.dub.co/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        url: 'https://example.com/very-long-url',
      }),
    });
  });

  it('should return null when API response does not contain shortLink', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-token';
    
    const mockResponse = {
      // No shortLink property
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBeNull();
  });

  it('should handle network errors gracefully', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-token';
    
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(shortenLink('https://example.com/very-long-url')).rejects.toThrow('Network error');
  });

  it('should handle JSON parsing errors gracefully', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-token';
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    });

    await expect(shortenLink('https://example.com/very-long-url')).rejects.toThrow('Invalid JSON');
  });
}); 