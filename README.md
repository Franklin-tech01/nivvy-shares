# Nivvy

Share marketplace built with Next.js (App Router), TypeScript, Tailwind v4, Better Auth and Neon (PostgreSQL).
Users sign up and log in with a **phone number + password** (no email).
No landing page: `/` sends signed-out users to `/login`, signed-in users to `/dashboard`.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and set `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET`
   (`npx @better-auth/cli secret`), and the community links.
3. `npm run db:migrate` applies any unapplied files in `db/migrations` (tracked in `schema_migrations`).
4. Fill in prices in `db/seed_shares.sql` (**taken from your reference image; none are invented**), then `npm run db:seed`.
5. Optional demo data for one account: edit the phone number in `db/seed_demo_user.sql` and run
   `node --env-file=.env.local scripts/db-apply.mjs db/seed_demo_user.sql`. Rows are marked `[Demo]`.
6. Set `KORAPAY_SECRET_KEY` (deposits won't work without it — see below).
7. Grant yourself admin access: `node --env-file=.env.local scripts/set-admin.mjs +2348012345678`
   (use the phone number you registered with). Revoke with `--revoke`.
8. `npm run dev`

## Where things live

- Design tokens: `src/app/globals.css`
- Links/config: `src/lib/config.ts` (env-driven community/support links, daily reward amounts,
  `WITHDRAWALS_ENABLED`, `MIN_DEPOSIT_AMOUNT`)
- Auth: `src/lib/auth.ts` (server), `src/lib/auth-client.ts` (browser), `src/proxy.ts` (optimistic redirect)
- Data access: `src/lib/data/index.ts` (cached server reads, all scoped by the signed-in user);
  `src/lib/data/admin.ts` is the one place that intentionally reads across all users — never import it
  into user-facing pages
- Payments: `src/lib/actions/payments.ts`, `src/lib/korapay.ts`. Deposits, share purchases and withdrawal
  *requests* are all live. Payout itself is manual — see Admin below.

## Admin (`/admin`)

Gated by `profiles.is_admin` (`requireAdmin()` in `src/lib/data/admin.ts`), checked server-side on every
admin page — there's no client-side-only gate to bypass. Grant it with `scripts/set-admin.mjs`.

- **Overview** — totals: users, deposits completed, deposits pending, withdrawals awaiting payout, share
  purchases.
- **Deposits** / **Purchases** — read-only history across all users.
- **Withdrawals** — every request with the user's bank details (account name/number, bank). Pending ones
  get **Mark Paid** and **Reject** buttons:
  - **Mark Paid**: flips the withdrawal + its transaction to `completed`. It does **not** move any money —
    pay the user from your own bank or Korapay dashboard first, then mark it here.
  - **Reject**: flips both to `failed` and refunds the held amount back to the user's balance.

The balance is held (debited) the moment a user **requests** a withdrawal, not when it's paid out — so a
user can never request more than they have or double-spend a pending request across two withdrawals.

## Payments (Korapay)

Deposits use Korapay's hosted checkout. The flow:

1. `initiateDeposit` (server action) records a **pending** `deposits` + `transactions` row, then asks
   Korapay for a checkout URL. The browser is redirected there — no balance is touched yet.
2. Korapay calls `POST /api/webhooks/korapay` when the charge succeeds or fails. That route verifies
   `x-korapay-signature` (HMAC-SHA256 of the `data` object, signed with `KORAPAY_SECRET_KEY`) and is the
   **only** place a deposit ever credits `portfolios.balance`. It's idempotent: a retried webhook for an
   already-completed deposit updates nothing.
3. In the Korapay dashboard, set the webhook URL to `<your deployed URL>/api/webhooks/korapay`.

Share purchases spend the user's Nivvy balance directly (no external payment): `purchaseShare` debits the
balance, inserts the holding, and inserts the transaction in one DB transaction
(`src/lib/db.ts:withTransaction`), so a purchase can't charge without recording it or vice versa. It
fails cleanly on insufficient balance.

Withdrawal *requests* are real (see Admin below for payout); `WITHDRAWALS_ENABLED` in `src/lib/config.ts`
is a kill switch to pause new requests without a code change if needed.

`KORAPAY_PUBLIC_KEY` and `KORAPAY_ENCRYPTION_KEY` are captured in `.env.local` but unused — they're only
needed for an inline widget or direct card charges, neither implemented here.

## Security model

Neon has no per-user RLS, so authorization lives in server code:

- The database is only reachable from the server (`DATABASE_URL` is never `NEXT_PUBLIC_`).
- Every user-owned query filters by the authenticated user id; `requireUser()` validates the session in the app layout.
- Users can only edit their `full_name` (the phone number is their login). Balances, transactions, bonuses and status are never writable from the browser.
- Phone login: Better Auth needs an email, so a phone maps to an internal `<digits>@phone.nivvyusers.com` address (`src/lib/phone.ts`) that is never sent mail — it only satisfies email-shaped fields (Better Auth, Korapay's `customer.email`). It intentionally isn't on a reserved TLD like `.invalid`: Korapay's own email validator rejects those. Numbers are normalized (default country code +234). Self-service password reset needs an SMS provider (not connected); until then support resets passwords and `/forgot-password` points to support.
