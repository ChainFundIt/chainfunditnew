/**
 * Utility functions for generating and handling URL slugs
 */

/**
 * Generates a URL-friendly slug from a given string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[\s\W-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters
    .substring(0, 100);
}

/**
 * Generates a unique slug by appending a number if the slug already exists
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Validates if a slug is properly formatted
 * @param slug - The slug to validate
 * @returns True if the slug is valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Check if slug contains only lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 255;
}

/**
 * Converts a slug back to a readable title (for display purposes)
 * @param slug - The slug to convert
 * @returns A readable title
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

