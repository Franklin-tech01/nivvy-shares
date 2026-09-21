-- ─────────────────────────────────────────────────────────────────────
-- SHARE PACKAGES SEED — FILL THIS IN FROM THE REFERENCE IMAGE
--
-- Prices were intentionally NOT invented. Replace each `null` price with the
-- exact value from your reference image, then run this file in the Supabase
-- SQL editor. The insert is idempotent (keyed on symbol), so re-running it
-- after price edits is safe.
--
-- tier:   'standard' | 'premium' | 'vip'
-- status: 'available' | 'sold_out' | 'coming_soon' | 'hidden'
-- badge:  optional short label shown on the row/card, e.g. 'Popular'
--
-- Rows with a null price are skipped so nothing incomplete is published.
-- ─────────────────────────────────────────────────────────────────────

insert into public.shares (name, symbol, description, price, tier, badge, status, display_order)
select v.name, v.symbol, v.description, v.price, v.tier, v.badge, v.status, v.display_order
from (values
  --  name      symbol    description    price          tier        badge        status       order
  ('NVVY 1',  'NVVY1',  'Nivvy Share', null::numeric, 'standard', null::text,  'available',  1),
  ('NVVY 2',  'NVVY2',  'Nivvy Share', null,          'standard', null,        'available',  2),
  ('NVVY 3',  'NVVY3',  'Nivvy Share', null,          'standard', null,        'available',  3),
  ('NVVY 4',  'NVVY4',  'Nivvy Share', null,          'premium',  null,        'available',  4),
  ('NVVY 5',  'NVVY5',  'Nivvy Share', null,          'premium',  null,        'available',  5),
  -- add the remaining NVVY rows here, matching the image ...
  ('VIP 1',   'VIP1',   'Nivvy VIP Share', null,      'vip',      null,        'available', 99)
) as v(name, symbol, description, price, tier, badge, status, display_order)
where v.price is not null
on conflict (symbol) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  tier = excluded.tier,
  badge = excluded.badge,
  status = excluded.status,
  display_order = excluded.display_order;
