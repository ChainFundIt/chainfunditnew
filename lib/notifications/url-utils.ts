const UNSAFE_PROTOCOL_REGEX = /^(javascript:|data:)/i;
const HAS_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
const HTTP_PROTOCOL_REGEX = /^https?:\/\//i;

/**
 * Normalizes action URLs received from notifications so they can be safely rendered.
 * - Trims whitespace
 * - Rejects javascript/data protocols
 * - Ensures relative paths start with a single leading slash
 */
export function normalizeActionUrl(actionUrl?: string): string | null {
  if (!actionUrl) {
    return null;
  }

  const trimmed = actionUrl.trim();

  if (!trimmed || UNSAFE_PROTOCOL_REGEX.test(trimmed)) {
    return null;
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    HAS_SCHEME_REGEX.test(trimmed)
  ) {
    return trimmed;
  }

  // Treat bare paths as app-relative routes.
  return `/${trimmed.replace(/^\/+/, '')}`;
}

export function isInternalActionUrl(actionUrl: string): boolean {
  // Check if it's a relative path
  if (actionUrl.startsWith('/') || actionUrl.startsWith('#')) {
    return true;
  }
  
  // Check if it's a same-domain URL (for client-side navigation)
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(actionUrl, window.location.origin);
      return url.origin === window.location.origin;
    } catch {
      // If URL parsing fails, treat as external
      return false;
    }
  }
  
  // For server-side, check if it matches the expected domain pattern
  if (HTTP_PROTOCOL_REGEX.test(actionUrl)) {
    // Extract path from full URL for same-domain checks
    try {
      const url = new URL(actionUrl);
      // If it's a full URL, we'll handle it as external in the component
      // but extract the path for navigation
      return false;
    } catch {
      return false;
    }
  }
  
  return false;
}

/**
 * Extracts the pathname from a full URL if it's same-domain, otherwise returns the original
 * Also normalizes the path to remove double slashes and ensure clean relative paths
 */
export function extractInternalPath(actionUrl: string): string {
  // If it's already a relative path, normalize it and return
  if (actionUrl.startsWith('/') || actionUrl.startsWith('#')) {
    // Remove double slashes (except after protocol)
    return actionUrl.replace(/([^:]\/)\/+/g, '$1');
  }
  
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(actionUrl, window.location.origin);
      if (url.origin === window.location.origin) {
        // Extract pathname, search, and hash, then normalize
        const path = url.pathname + url.search + url.hash;
        // Remove double slashes in the path
        return path.replace(/\/+/g, '/');
      }
    } catch {
      // If parsing fails, try to extract path manually
      try {
        // Try to extract path from URL string
        const match = actionUrl.match(/https?:\/\/[^\/]+(\/.*)/);
        if (match && match[1]) {
          // Normalize the path
          return match[1].replace(/\/+/g, '/');
        }
      } catch {
        // If all parsing fails, return original
      }
    }
  }
  
  // For server-side or if extraction fails, try to extract path manually
  try {
    const match = actionUrl.match(/https?:\/\/[^\/]+(\/.*)/);
    if (match && match[1]) {
      // Normalize the path - remove double slashes
      return match[1].replace(/\/+/g, '/');
    }
  } catch {
    // If extraction fails, return original
  }
  
  return actionUrl;
}

export function shouldOpenInNewTab(actionUrl: string): boolean {
  return HTTP_PROTOCOL_REGEX.test(actionUrl);
}

