// Usage: node --env-file=.env.local scripts/db-apply.mjs db/migrations/0001_init.sql [more.sql ...]
import { readFileSync } from "node:fs";
import pg from "pg";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Pass one or more .sql files.");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (put it in .env.local).");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  for (const f of files) {
    await client.query(readFileSync(f, "utf8"));
    console.log(`applied ${f}`);
  }
} catch (e) {
  console.error(`failed: ${e.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
