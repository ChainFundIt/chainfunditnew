import { sql } from "drizzle-orm";

export async function up(db: any) {
  await db.execute(
    sql`ALTER TABLE impact_hangout_registrations ADD COLUMN IF NOT EXISTS total_raised_ngn INTEGER`
  );
  await db.execute(sql`
    UPDATE impact_hangout_registrations
    SET total_raised_ngn = commitment_amount_ngn
    WHERE payment_status = 'completed' AND commitment_amount_ngn IS NOT NULL AND total_raised_ngn IS NULL
  `);
}

export async function down(db: any) {
  await db.execute(
    sql`ALTER TABLE impact_hangout_registrations DROP COLUMN IF EXISTS total_raised_ngn`
  );
}
