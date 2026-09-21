-- Phone-number login. Accounts created from a phone number get an internal
-- placeholder email (<digits>@phone.nivvy.invalid); the profile stores the
-- phone and leaves email empty.

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
  return new;
end $$;

create unique index if not exists profiles_phone_uidx on profiles (phone) where phone is not null;

alter table support_tickets add column if not exists phone text;
