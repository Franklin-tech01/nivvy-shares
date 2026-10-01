-- Daily share earnings: every plan pays a fixed daily amount per share held
-- (see db/seed_shares.sql), credited once per UTC day based on the user's
-- current holdings — see record_daily_login's caller in
-- src/lib/actions/account.ts. Unlike the promotional bonuses (migration
-- 0006), this money is never locked: the user already made a share purchase,
-- so it's a straight addition to `balance`.
--
-- share_earnings mirrors login_rewards: last_earned_on is the (UTC) date
-- earnings were last credited, so a user can only be credited once per day.

alter table shares add column if not exists daily_earning numeric(14,2) not null default 0;

update shares set daily_earning = case symbol
  when 'NVVY1'  then 900
  when 'NVVY2'  then 1500
  when 'NVVY3'  then 3000
  when 'NVVY4'  then 6000
  when 'NVVY5'  then 9000
  when 'NVVY6'  then 12000
  when 'NVVY7'  then 15000
  when 'NVVY8'  then 24000
  when 'NVVY9'  then 30000
  when 'NVVY10' then 60000
  when 'NVVY11' then 150000
  else daily_earning
end
where symbol in ('NVVY1','NVVY2','NVVY3','NVVY4','NVVY5','NVVY6','NVVY7','NVVY8','NVVY9','NVVY10','NVVY11');

create table if not exists share_earnings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references "user" ("id") on delete cascade,
  last_earned_on date,
  total_earned numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_share_earnings_updated before update on share_earnings
  for each row execute function set_updated_at();

insert into share_earnings (user_id)
select id from "user"
on conflict (user_id) do nothing;

create or replace function handle_new_user()
returns trigger language plpgsql as $$
declare
  is_phone boolean := new."email" like '%@phone.nivvy.invalid';
begin
  insert into profiles (id, email, full_name, phone)
  values (
    new."id",
    case when is_phone then null else new."email" end,
    new."name",
    case when is_phone then '+' || split_part(new."email", '@', 1) end
  );
  insert into portfolios (user_id) values (new."id");
  insert into login_rewards (user_id) values (new."id");
  insert into welcome_bonuses (user_id, status) values (new."id", 'pending');
  insert into share_earnings (user_id) values (new."id");
  return new;
end $$;

-- ───────────────────────── one-time catch-up ─────────────────────────
-- Share earnings were never credited before this migration, so backfill
-- today's payout for everyone who already holds shares. Guarded by the same
-- "not already credited today" check the daily job uses, so re-running this
-- migration (it won't — schema_migrations tracks it) or a future deploy on
-- the same day could never double-credit it.
do $$
declare
  r record;
begin
  for r in
    select h.user_id, sum(h.quantity * s.daily_earning)::numeric(14,2) as amount
      from holdings h
      join shares s on s.id = h.share_id
     group by h.user_id
    having sum(h.quantity * s.daily_earning) > 0
  loop
    update share_earnings
       set last_earned_on = (now() at time zone 'utc')::date,
           total_earned = total_earned + r.amount
     where user_id = r.user_id
       and last_earned_on is distinct from (now() at time zone 'utc')::date;

    if found then
      update portfolios set balance = balance + r.amount where user_id = r.user_id;
      insert into transactions (user_id, type, amount, status, description, metadata)
      values (r.user_id, 'reward', r.amount, 'completed', 'Daily share earnings',
              '{"share_earning": true, "backfill": true}'::jsonb);
    end if;
  end loop;
end $$;
