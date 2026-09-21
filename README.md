# Nivvy

Share marketplace built with Next.js (App Router), TypeScript, Tailwind v4, Better Auth and Neon (PostgreSQL).
No landing page: `/` sends signed-out users to `/login`, signed-in users to `/dashboard`.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and set `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET`
   (`npx @better-auth/cli secret`), and the community links.
3. `npm run db:migrate` creates the auth + app tables, triggers and the streak function.
4. Fill in prices in `db/seed_shares.sql` (**taken from your reference image; none are invented**), then `npm run db:seed`.
5. Optional demo data for one account: edit the email in `db/seed_demo_user.sql` and run
   `node --env-file=.env.local scripts/db-apply.mjs db/seed_demo_user.sql`. Rows are marked `[Demo]`.
6. `npm run dev`

## Where things live

- Design tokens: `src/app/globals.css`
- Links/config: `src/lib/config.ts` (env-driven community/support links, daily reward amounts, `PAYMENTS_ENABLED`)
- Auth: `src/lib/auth.ts` (server), `src/lib/auth-client.ts` (browser), `src/proxy.ts` (optimistic redirect)
- Data access: `src/lib/data/index.ts` (cached server reads, all scoped by the signed-in user)
- Payment seams: `src/lib/actions/payments.ts`. Deposits, withdrawals and purchases are inert until implemented.

## Security model

Neon has no per-user RLS, so authorization lives in server code:

- The database is only reachable from the server (`DATABASE_URL` is never `NEXT_PUBLIC_`).
- Every user-owned query filters by the authenticated user id; `requireUser()` validates the session in the app layout.
- Users can only edit `full_name` and `phone`. Balances, transactions, bonuses and status are never writable from the browser.
- Password reset emails are not wired up yet: reset links are logged on the server (`src/lib/auth.ts`). Add a mail provider before launch.
