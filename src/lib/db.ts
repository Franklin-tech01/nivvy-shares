import "server-only";
import { Pool, types } from "pg";

// numeric -> number, timestamptz -> ISO string, date -> "YYYY-MM-DD" string,
// so rows match the types in `@/lib/types` and serialize cleanly to the client.
types.setTypeParser(1700, (v) => parseFloat(v));
types.setTypeParser(1184, (v) => new Date(v).toISOString());
types.setTypeParser(1082, (v) => v);

const globalForPg = globalThis as unknown as { nivvyPool?: Pool };

/** One pool per server process (cached across dev hot reloads). */
export const pool =
  globalForPg.nivvyPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

if (process.env.NODE_ENV !== "production") globalForPg.nivvyPool = pool;

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
