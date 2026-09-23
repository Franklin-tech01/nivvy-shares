// Grants (or revokes with --revoke) admin access to the account with the
// given phone number.
// Usage: node --env-file=.env.local scripts/set-admin.mjs +2348012345678
//        node --env-file=.env.local scripts/set-admin.mjs +2348012345678 --revoke
import pg from "pg";

const arg = process.argv[2];
const revoke = process.argv.includes("--revoke");
if (!arg) {
  console.error("Usage: node --env-file=.env.local scripts/set-admin.mjs <phone> [--revoke]");
  process.exit(1);
}
const phone = arg.startsWith("+") ? arg : `+${arg.replace(/\D/g, "")}`;

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const { rows } = await client.query(
    "update profiles set is_admin = $1 where phone = $2 returning id, full_name, phone",
    [!revoke, phone],
  );
  if (rows.length === 0) {
    console.error(`No account found with phone ${phone}`);
    process.exitCode = 1;
  } else {
    console.log(`${revoke ? "Revoked" : "Granted"} admin for ${rows[0].full_name} (${rows[0].phone})`);
  }
} finally {
  await client.end();
}
