-- Referral links: every profile gets a unique ref_code, and a new profile can
-- record who referred it. This only TRACKS signups — no rewards, commissions
-- or payouts are attached to referrals anywhere in the app.

alter table profiles add column if not exists ref_code text;

create or replace function generate_ref_code() returns text language plpgsql as $$
declare c text;
begin
  loop
    c := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    exit when not exists (select 1 from profiles where ref_code = c);
  end loop;
  return c;
end $$;

update profiles set ref_code = generate_ref_code() where ref_code is null;
alter table profiles alter column ref_code set default generate_ref_code();
alter table profiles alter column ref_code set not null;
create unique index if not exists profiles_ref_code_uidx on profiles (ref_code);

alter table profiles add column if not exists referred_by text references profiles (id) on delete set null;
create index if not exists profiles_referred_by_idx on profiles (referred_by);
