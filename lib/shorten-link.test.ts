import { shortenLink } from './shorten-link';

// Mock fetch globally
global.fetch = jest.fn();

describe('shortenLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.SHORT_IO_SECRET_KEY;
    delete process.env.SHORT_IO_DOMAIN;
  });

  it('should return null when SHORT_IO_SECRET_KEY is not set', async () => {
    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should return null when SHORT_IO_DOMAIN is not set', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-api-key';
    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should return null when API request fails', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-api-key';
    process.env.SHORT_IO_DOMAIN = 'example.short.io';
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: jest.fn().mockResolvedValue('{"error":"bad request"}'),
    });

    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBeNull();
    expect(fetch).toHaveBeenCalledWith('https://api.short.io/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'test-api-key',
      },
      body: JSON.stringify({
        originalURL: 'https://example.com/very-long-url',
        domain: 'example.short.io',
      }),
    });
  });

  it('should return shortened URL when API request succeeds', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-api-key';
    process.env.SHORT_IO_DOMAIN = 'example.short.io';
    
    const mockResponse = {
      shortURL: 'https://example.short.io/abc123',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBe('https://example.short.io/abc123');
    expect(fetch).toHaveBeenCalledWith('https://api.short.io/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'test-api-key',
      },
      body: JSON.stringify({
        originalURL: 'https://example.com/very-long-url',
        domain: 'example.short.io',
      }),
    });
  });

  it('should return null when API response does not contain shortURL', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-api-key';
    process.env.SHORT_IO_DOMAIN = 'example.short.io';
    
    const mockResponse = {
      // No shortURL/secureShortURL property
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBeNull();
  });

  it('should handle network errors gracefully', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-api-key';
    process.env.SHORT_IO_DOMAIN = 'example.short.io';
    
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBeNull();
  });

  it('should handle JSON parsing errors gracefully', async () => {
    process.env.SHORT_IO_SECRET_KEY = 'test-api-key';
    process.env.SHORT_IO_DOMAIN = 'example.short.io';
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    });

    const result = await shortenLink('https://example.com/very-long-url');
    expect(result).toBeNull();
  });
}); 