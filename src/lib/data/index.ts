import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import type {
  Holding,
  LoginReward,
  Portfolio,
  Profile,
  ReferralEarnings,
  Share,
  Transaction,
  WelcomeBonus,
} from "@/lib/types";

/**
 * Data-access layer. Every user-owned query filters on the authenticated
 * user's id (this is the authorization boundary; there is no RLS on Neon).
 * Functions are wrapped in React `cache`, so the layout and a page share one
 * query per request. Reads return `{ data, error }` so pages can render error
 * states instead of throwing.
 */
export type Result<T> = { data: T; error: string | null };
const ok = <T,>(data: T): Result<T> => ({ data, error: null });
const fail = <T,>(data: T, err: unknown): Result<T> => {
  console.error("[data]", err);
  return { data, error: "Please try again in a moment." };
};

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

/** Use in protected pages/actions: redirects to /login if there is no valid session. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export const getProfile = cache(async (): Promise<Result<Profile | null>> => {
  const user = await getCurrentUser();
  if (!user) return ok(null);
  try {
    const rows = await query<Profile>("select * from profiles where id = $1", [user.id]);
    return ok(rows[0] ?? null);
  } catch (e) {
    return fail(null, e);
  }
});

export const getShares = cache(async (): Promise<Result<Share[]>> => {
  try {
    return ok(
      await query<Share>(
        "select * from shares where status <> 'hidden' order by display_order asc, created_at asc",
      ),
    );
  } catch (e) {
    return fail([], e);
  }
});

export const getPortfolio = cache(async (): Promise<Result<Portfolio | null>> => {
  const user = await getCurrentUser();
  if (!user) return ok(null);
  try {
    const rows = await query<Portfolio>("select * from portfolios where user_id = $1", [user.id]);
    return ok(rows[0] ?? null);
  } catch (e) {
    return fail(null, e);
  }
});

export const getHoldings = cache(async (): Promise<Result<Holding[]>> => {
  const user = await getCurrentUser();
  if (!user) return ok([]);
  try {
    const rows = await query<Holding>(
      `select h.id, h.share_id, h.quantity, h.purchase_price,
              json_build_object('name', s.name, 'symbol', s.symbol, 'tier', s.tier) as shares
         from holdings h join shares s on s.id = h.share_id
        where h.user_id = $1
        order by h.created_at desc`,
      [user.id],
    );
    return ok(rows);
  } catch (e) {
    return fail([], e);
  }
});

export const getTransactions = cache(async (limit = 100): Promise<Result<Transaction[]>> => {
  const user = await getCurrentUser();
  if (!user) return ok([]);
  try {
    const rows = await query<Transaction>(
      `select id, type, amount, status, reference, description, metadata, created_at
         from transactions where user_id = $1 order by created_at desc limit $2`,
      [user.id, limit],
    );
    return ok(rows);
  } catch (e) {
    return fail([], e);
  }
});

export const getLoginReward = cache(async (): Promise<Result<LoginReward | null>> => {
  const user = await getCurrentUser();
  if (!user) return ok(null);
  try {
    const rows = await query<LoginReward>("select * from login_rewards where user_id = $1", [user.id]);
    return ok(rows[0] ?? null);
  } catch (e) {
    return fail(null, e);
  }
});

/** How many accounts signed up through the current user's referral link. Just a count — no names or numbers. */
export const getReferralCount = cache(async (): Promise<Result<number>> => {
  const user = await getCurrentUser();
  if (!user) return ok(0);
  try {
    const rows = await query<{ n: number }>(
      "select count(*)::int as n from profiles where referred_by = $1",
      [user.id],
    );
    return ok(rows[0]?.n ?? 0);
  } catch (e) {
    return fail(0, e);
  }
});

/** Total and per-deposit breakdown of referral commissions earned by the current user. */
export const getReferralEarnings = cache(async (): Promise<Result<ReferralEarnings>> => {
  const user = await getCurrentUser();
  if (!user) return ok({ total: 0, transactions: [] });
  try {
    const [totRow] = await query<{ total: number }>(
      `select coalesce(sum(amount), 0)::float as total
         from transactions
        where user_id = $1 and type = 'reward' and status = 'completed'
          and metadata->>'referral' = 'true'`,
      [user.id],
    );
    const txRows = await query<{ id: string; amount: number; created_at: string; from_user: string | null }>(
      `select id, amount, created_at, metadata->>'from_user' as from_user
         from transactions
        where user_id = $1 and type = 'reward' and status = 'completed'
          and metadata->>'referral' = 'true'
        order by created_at desc
        limit 50`,
      [user.id],
    );
    return ok({ total: totRow?.total ?? 0, transactions: txRows });
  } catch (e) {
    return fail({ total: 0, transactions: [] }, e);
  }
});

export const getWelcomeBonus = cache(async (): Promise<Result<WelcomeBonus | null>> => {
  const user = await getCurrentUser();
  if (!user) return ok(null);
  try {
    const rows = await query<WelcomeBonus>("select * from welcome_bonuses where user_id = $1", [user.id]);
    return ok(rows[0] ?? null);
  } catch (e) {
    return fail(null, e);
  }
});
