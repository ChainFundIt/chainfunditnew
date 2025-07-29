// drizzle/migrations/xxxx_add_has_completed_profile_to_users.ts
import { sql } from 'drizzle-orm';

export async function up(db: any): Promise<void> {
  await db.execute(sql`
    ALTER TABLE users
    ADD COLUMN has_completed_profile BOOLEAN DEFAULT FALSE;
  `);
}

export async function down(db: any): Promise<void> {
  await db.execute(sql`
    ALTER TABLE users
    DROP COLUMN has_completed_profile;
  `);
}