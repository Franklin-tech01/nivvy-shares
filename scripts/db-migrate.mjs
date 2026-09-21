// Applies unapplied files in db/migrations in order. Usage: npm run db:migrate
import { readdirSync, readFileSync } from "node:fs";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (put it in .env.local).");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query(
    "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );

  // Databases migrated before this tracker existed already have 0001 applied.
  const { rows: seen } = await client.query("select count(*)::int as n from schema_migrations");
  const { rows: existing } = await client.query("select to_regclass('public.profiles') as t");
  if (seen[0].n === 0 && existing[0].t) {
    await client.query("insert into schema_migrations (name) values ('0001_init.sql')");
  }

  const done = new Set((await client.query("select name from schema_migrations")).rows.map((r) => r.name));
  const files = readdirSync("db/migrations").filter((f) => f.endsWith(".sql")).sort();
  let count = 0;
  for (const f of files) {
    if (done.has(f)) continue;
    await client.query("begin");
    try {
      await client.query(readFileSync(`db/migrations/${f}`, "utf8"));
      await client.query("insert into schema_migrations (name) values ($1)", [f]);
      await client.query("commit");
      console.log(`applied ${f}`);
      count++;
    } catch (e) {
      await client.query("rollback");
      throw new Error(`${f}: ${e.message}`);
    }
  }
  if (!count) console.log("database is up to date");
} catch (e) {
  console.error(`failed: ${e.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
