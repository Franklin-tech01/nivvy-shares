-- Admin flag + structured bank details for withdrawal requests.

alter table profiles add column if not exists is_admin boolean not null default false;

alter table withdrawals add column if not exists account_name text;
alter table withdrawals add column if not exists account_number text;
alter table withdrawals add column if not exists bank_name text;
alter table withdrawals add column if not exists processed_at timestamptz;

-- One row per withdrawal's matching transaction, used by the admin payout
-- actions to flip both rows together.
create index if not exists withdrawals_status_idx on withdrawals (status, created_at desc);
create index if not exists deposits_status_idx on deposits (status, created_at desc);
