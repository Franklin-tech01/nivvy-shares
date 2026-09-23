-- OTPay payout support.
-- bank_code: OTPay's own bank code (from GET /get_banks) — required to call
--   the payout API; not the same code space as any other provider.
-- payout_reference / payout_fee: OTPay's response once a payout succeeds.
-- locked_at: short-lived advisory lock so two admin actions (or two accidental
--   clicks) can't both call the payout API for the same withdrawal at once.
--   No idempotency key is accepted by OTPay's payout endpoint, so this lock is
--   the only guard against a double payout from a race.

alter table withdrawals add column if not exists bank_code text;
alter table withdrawals add column if not exists payout_reference text;
alter table withdrawals add column if not exists payout_fee numeric(14,2);
alter table withdrawals add column if not exists locked_at timestamptz;
