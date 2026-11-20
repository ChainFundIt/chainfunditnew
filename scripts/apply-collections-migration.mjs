/**
 * Applies migration 0041 (collections + collection_contributions) when tables are missing.
 * Safe to run multiple times — skips if tables already exist.
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error("No DATABASE_URL found in .env.local or .env");
  process.exit(1);
}

const sql = neon(databaseUrl);

const migrationPath = path.resolve(
  __dirname,
  "../lib/migrations/0041_groovy_bloodscream.sql"
);
const migration = fs.readFileSync(migrationPath, "utf8");
const statements = migration
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

async function tableExists(name) {
  const rows = await sql`
    SELECT to_regclass(${`public.${name}`}) AS reg
  `;
  return rows[0]?.reg != null;
}

async function main() {
  const hasCollections = await tableExists("collections");
  const hasContributions = await tableExists("collection_contributions");

  if (!hasCollections || !hasContributions) {
    console.log("Applying migration 0041 (collections)...");
    for (const stmt of statements) {
      await sql.query(stmt, []);
    }

    const ok =
      (await tableExists("collections")) &&
      (await tableExists("collection_contributions"));
    if (!ok) {
      throw new Error("Migration finished but tables were not found.");
    }
    console.log("Collections tables created.");
  } else {
    console.log("Collections tables already exist.");
  }

  const categorySql = fs.readFileSync(
    path.resolve(__dirname, "../lib/migrations/0042_collections_category.sql"),
    "utf8"
  );
  await sql.query(categorySql.trim(), []);

  const feesMigration = fs.readFileSync(
    path.resolve(__dirname, "../lib/migrations/0043_collection_contribution_fees.sql"),
    "utf8"
  );
  const feeStatements = feesMigration
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of feeStatements) {
    await sql.query(stmt, []);
  }

  const payoutsMigration = fs.readFileSync(
    path.resolve(__dirname, "../lib/migrations/0044_collection_payouts.sql"),
    "utf8"
  );
  const payoutStatements = payoutsMigration
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of payoutStatements) {
    await sql.query(stmt, []);
  }

  console.log("Collections schema up to date.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});