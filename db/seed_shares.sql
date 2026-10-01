-- ─────────────────────────────────────────────────────────────────────
-- SHARE PACKAGES SEED. Run with:  npm run db:seed
-- Idempotent (keyed on symbol): edit a price here and re-run to update it.
--
-- tier:   'standard' | 'premium' | 'vip'
-- status: 'available' | 'sold_out' | 'coming_soon' | 'hidden'
-- badge:  optional short label shown next to the name, e.g. 'Popular'
--
-- Prices are the ones supplied in the project's share table.
-- Tiers below are a default split and can be changed freely.
-- ─────────────────────────────────────────────────────────────────────

insert into public.shares (name, symbol, description, price, daily_earning, tier, badge, status, display_order)
values
  ('Nivvy 1',  'NVVY1',  'Nivvy Share',     3000,   900,    'standard', null, 'available',  1),
  ('Nivvy 2',  'NVVY2',  'Nivvy Share',     5000,   1500,   'standard', null, 'available',  2),
  ('Nivvy 3',  'NVVY3',  'Nivvy Share',     10000,  3000,   'standard', null, 'available',  3),
  ('Nivvy 4',  'NVVY4',  'Nivvy Share',     20000,  6000,   'standard', null, 'available',  4),
  ('Nivvy 5',  'NVVY5',  'Nivvy Share',     30000,  9000,   'standard', null, 'available',  5),
  ('Nivvy 6',  'NVVY6',  'Nivvy Share',     40000,  12000,  'premium',  null, 'available',  6),
  ('Nivvy 7',  'NVVY7',  'Nivvy Share',     50000,  15000,  'premium',  null, 'available',  7),
  ('Nivvy 8',  'NVVY8',  'Nivvy Share',     80000,  24000,  'premium',  null, 'available',  8),
  ('Nivvy 9',  'NVVY9',  'Nivvy Share',     100000, 30000,  'premium',  null, 'available',  9),
  ('Nivvy 10', 'NVVY10', 'Nivvy Share',     200000, 60000,  'premium',  null, 'available', 10),
  ('Nivvy 11', 'NVVY11', 'Nivvy VIP Share', 500000, 150000, 'vip',      null, 'available', 11)
on conflict (symbol) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  daily_earning = excluded.daily_earning,
  tier = excluded.tier,
  badge = excluded.badge,
  status = excluded.status,
  display_order = excluded.display_order;
