import { drizzle } from 'drizzle-orm/neon-server';
import { neon } from '@neondatabase/serverless';

// You should set DATABASE_URL in your .env file
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql); 