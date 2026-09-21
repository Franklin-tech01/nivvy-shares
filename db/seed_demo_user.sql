-- ─────────────────────────────────────────────────────────────────────
-- DEMO DATA for ONE account, so the dashboard has something to show.
-- Everything here is marked  metadata.demo = true  and "[Demo]" in the
-- description. These are NOT real balances, deposits, or returns.
--
-- Usage: set the phone number below, run in the SQL editor (runs as postgres,
-- bypassing RLS). Never run this against real customer accounts.
-- ─────────────────────────────────────────────────────────────────────
do $$
declare
  demo_phone text := '+2348012345678';   -- <-- change me (international format)
  uid text;
  s record;
  total_inv numeric := 0;
  total_val numeric := 0;
begin
  select id into uid from profiles where phone = demo_phone;
  if uid is null then
    raise exception 'No account with phone %', demo_phone;
  end if;

  delete from public.transactions where user_id = uid and (metadata ->> 'demo') = 'true';
  delete from public.holdings where user_id = uid;

  -- Holdings: first two published shares, quantity 1 and 2 (needs shares seeded first).
  for s in select id, price from public.shares where status = 'available' order by display_order limit 2 loop
    insert into public.holdings (user_id, share_id, quantity, purchase_price)
    values (uid, s.id, case when total_inv = 0 then 1 else 2 end, s.price);
    total_inv := total_inv + s.price * case when total_inv = 0 then 1 else 2 end;
  end loop;
  total_val := total_inv;   -- no fabricated gains: value = cost basis

  update public.portfolios
  set balance = 21200, total_investment = total_inv, total_value = total_val
  where user_id = uid;

  insert into public.transactions (user_id, type, amount, status, description, metadata, created_at) values
    (uid, 'deposit',        50000, 'completed', '[Demo] Wallet deposit',       '{"demo": true}', now() - interval '6 days'),
    (uid, 'share_purchase', total_inv, 'completed', '[Demo] Share purchase',       '{"demo": true}', now() - interval '5 days'),
    (uid, 'bonus',           1000, 'completed', '[Demo] Welcome bonus',        '{"demo": true}', now() - interval '4 days'),
    (uid, 'reward',           200, 'completed', '[Demo] Daily login reward',   '{"demo": true}', now() - interval '2 days'),
    (uid, 'withdrawal',     10000, 'pending',   '[Demo] Withdrawal request',   '{"demo": true}', now() - interval '1 day'),
    (uid, 'deposit',         5000, 'failed',    '[Demo] Deposit (failed)',     '{"demo": true}', now() - interval '12 hours');
end $$;
