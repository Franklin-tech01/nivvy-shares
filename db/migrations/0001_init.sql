-- Nivvy initial schema for Neon (plain PostgreSQL) + Better Auth.
-- Apply with:  npm run db:migrate
-- Money is numeric(14,2), currency NGN.
--
-- SECURITY MODEL: Neon has no per-user RLS context, so authorization is
-- enforced in server code: every query in `src/lib/data` and `src/lib/actions`
-- filters by the authenticated user's id. The database is never exposed to the
-- browser, and DATABASE_URL is server-only. Financial tables are only ever
-- written by trusted server code.

create extension if not exists pgcrypto;

-- ───────────────────────── Better Auth tables ─────────────────────────
create table if not exists "user" (
  "id" text primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null default false,
  "image" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "session" (
  "id" text primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user" ("id") on delete cascade
);
create index if not exists session_user_idx on "session" ("userId");

create table if not exists "account" (
  "id" text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists account_user_idx on "account" ("userId");

create table if not exists "verification" (
  "id" text primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists verification_identifier_idx on "verification" ("identifier");

-- ───────────────────────── helpers ─────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ───────────────────────── app tables ─────────────────────────
create table profiles (
  id text primary key references "user" ("id") on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  account_status text not null default 'active'
    check (account_status in ('active', 'suspended', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table shares (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  symbol text not null unique,
  description text,
  price numeric(14,2) not null check (price >= 0),
  tier text not null default 'standard' check (tier in ('standard', 'premium', 'vip')),
  badge text,
  image_url text,
  status text not null default 'available'
    check (status in ('available', 'sold_out', 'coming_soon', 'hidden')),
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references "user" ("id") on delete cascade,
  balance numeric(14,2) not null default 0,
  total_investment numeric(14,2) not null default 0,
  total_value numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table holdings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user" ("id") on delete cascade,
  share_id uuid not null references shares (id),
  quantity int not null check (quantity > 0),
  purchase_price numeric(14,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index holdings_user_idx on holdings (user_id);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user" ("id") on delete cascade,
  type text not null check (type in ('deposit', 'withdrawal', 'share_purchase', 'bonus', 'reward')),
  amount numeric(14,2) not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  reference text not null unique default ('NVY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index transactions_user_created_idx on transactions (user_id, created_at desc);

create table deposits (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user" ("id") on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  payment_reference text unique,
  payment_method text,
  created_at timestamptz not null default now()
);

create table withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user" ("id") on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  withdrawal_method text,
  destination text,
  created_at timestamptz not null default now()
);

create table login_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references "user" ("id") on delete cascade,
  current_streak int not null default 0,
  last_login_date date,
  total_rewards numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table welcome_bonuses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references "user" ("id") on delete cascade,
  amount numeric(14,2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'available', 'claimed', 'expired')),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user" ("id") on delete cascade,
  name text,
  email text,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_tickets_user_idx on support_tickets (user_id, created_at desc);

create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger trg_shares_updated before update on shares for each row execute function set_updated_at();
create trigger trg_portfolios_updated before update on portfolios for each row execute function set_updated_at();
create trigger trg_holdings_updated before update on holdings for each row execute function set_updated_at();
create trigger trg_login_rewards_updated before update on login_rewards for each row execute function set_updated_at();
create trigger trg_support_updated before update on support_tickets for each row execute function set_updated_at();

-- ───────────────────────── new-user bootstrap ─────────────────────────
-- Creates zeroed account rows when Better Auth inserts a user. Credits nothing.
create or replace function handle_new_user()
returns trigger language plpgsql as $$
begin
  insert into profiles (id, email, full_name) values (new."id", new."email", new."name");
  insert into portfolios (user_id) values (new."id");
  insert into login_rewards (user_id) values (new."id");
  insert into welcome_bonuses (user_id, status) values (new."id", 'pending');
  return new;
end $$;

create trigger on_user_created
  after insert on "user"
  for each row execute function handle_new_user();

-- ───────────────────────── daily login streak ─────────────────────────
-- Tracks streak only. Does NOT credit any reward. Called from server code.
create or replace function record_daily_login(uid text)
returns login_rewards language plpgsql as $$
declare
  today date := (now() at time zone 'utc')::date;
  r login_rewards;
begin
  insert into login_rewards (user_id) values (uid) on conflict (user_id) do nothing;
  select * into r from login_rewards where user_id = uid for update;

  if r.last_login_date is distinct from today then
    update login_rewards
    set current_streak = case
          when r.last_login_date = today - 1 then
            case when r.current_streak >= 7 then 1 else r.current_streak + 1 end
          else 1
        end,
        last_login_date = today
    where user_id = uid
    returning * into r;
  end if;
  return r;
end $$;
