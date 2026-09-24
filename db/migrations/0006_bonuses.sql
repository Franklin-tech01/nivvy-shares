-- Promotional bonuses (welcome + daily login), paid from the operator's own
-- funds and credited to the normal balance, but locked until the user's first
-- share purchase.
--
-- locked_bonus: the part of `balance` that came from bonuses and can't be
--   withdrawn yet. Withdrawable = balance - locked_bonus. Reset to 0 by the
--   user's first completed share purchase. A user's own deposits are never
--   locked, only bonus money.
-- rewarded_on: the (UTC) date the daily login bonus was last credited, so a
--   bonus can only be credited once per day.

alter table portfolios add column if not exists locked_bonus numeric(14,2) not null default 0;
alter table login_rewards add column if not exists rewarded_on date;
