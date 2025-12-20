import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, sql } from 'drizzle-orm';
import * as schema from './schema';
import { users } from './schema/users';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure Neon with optimized settings for better reliability
const neonSql = neon(process.env.DATABASE_URL, {
  // Disable array mode for better compatibility
  arrayMode: false,
  // Optimize for single queries
  fullResults: false,
});

export const db = drizzle(neonSql, { schema });

// Database query wrapper with retry logic and exponential backoff
export async function withRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to individual queries
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 30 seconds')), 30000);
      });
      
      return await Promise.race([queryFn(), timeoutPromise]);
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a connection-related error that should be retried
      const isRetryableError = error instanceof Error && (
        error.message.includes('timeout') || 
        error.message.includes('fetch failed') ||
        error.message.includes('ConnectTimeoutError') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('Query timeout')
      );
      
      if (isRetryableError && attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`Database query failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      
      // For non-retryable errors or final attempt, throw immediately
      throw error;
    }
  }
  
  throw lastError!;
}

/**
 * Normalize email to lowercase for consistent storage and lookup
 * Email addresses are case-insensitive per RFC 5321
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Case-insensitive email comparison using SQL LOWER() function
 * This ensures emails like "User@Example.com" and "user@example.com" match
 */
export function emailEquals(email1: string, email2: string) {
  return sql`LOWER(${users.email}) = LOWER(${email2})`;
}

// Optimized query helper for common patterns with case-insensitive email lookup
export async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return withRetry(async () => {
    return await db
      .select({ id: users.id })
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${normalizedEmail})`)
      .limit(1);
  });
}

export async function findUserByPhone(phone: string) {
  return withRetry(async () => {
    return await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
  });
}

export * from './schema'; 