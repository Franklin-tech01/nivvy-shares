import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/data";
import type { AdminDeposit, AdminPurchase, AdminWithdrawal } from "@/lib/types";

/**
 * Admin-only reads. Unlike `@/lib/data`, these intentionally return every
 * user's rows — never import these into user-facing pages. Every exported
 * function here must go through `requireAdmin()` first.
 */

export const isCurrentUserAdmin = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  const rows = await query<{ is_admin: boolean }>("select is_admin from profiles where id = $1", [user.id]);
  return rows[0]?.is_admin ?? false;
});

/** Redirects to /dashboard if the signed-in user is not an admin. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!(await isCurrentUserAdmin())) redirect("/dashboard");
  return user;
}

export interface AdminOverview {
  totalUsers: number;
  depositsCompletedTotal: number;
  depositsPendingCount: number;
  withdrawalsPendingTotal: number;
  withdrawalsPendingCount: number;
  purchasesTotal: number;
  purchasesCount: number;
}

export const getAdminOverview = cache(async (): Promise<AdminOverview> => {
  const [users, deposits, withdrawals, purchases] = await Promise.all([
    query<{ n: number }>(`select count(*)::int as n from "user"`),
    query<{ total: number; pending: number }>(
      `select coalesce(sum(amount) filter (where status = 'completed'), 0) as total,
              count(*) filter (where status = 'pending')::int as pending
         from deposits`,
    ),
    query<{ total: number; pending: number }>(
      `select coalesce(sum(amount) filter (where status = 'pending'), 0) as total,
              count(*) filter (where status = 'pending')::int as pending
         from withdrawals`,
    ),
    query<{ total: number; n: number }>(
      `select coalesce(sum(amount), 0) as total, count(*)::int as n
         from transactions where type = 'share_purchase' and status = 'completed'`,
    ),
  ]);
  return {
    totalUsers: users[0]?.n ?? 0,
    depositsCompletedTotal: deposits[0]?.total ?? 0,
    depositsPendingCount: deposits[0]?.pending ?? 0,
    withdrawalsPendingTotal: withdrawals[0]?.total ?? 0,
    withdrawalsPendingCount: withdrawals[0]?.pending ?? 0,
    purchasesTotal: purchases[0]?.total ?? 0,
    purchasesCount: purchases[0]?.n ?? 0,
  };
});

export const getAdminDeposits = cache(async (limit = 200): Promise<AdminDeposit[]> => {
  return query<AdminDeposit>(
    `select d.id, d.amount, d.status, d.payment_method, d.created_at,
            p.full_name, p.phone
       from deposits d join profiles p on p.id = d.user_id
      order by d.created_at desc
      limit $1`,
    [limit],
  );
});

export const getAdminPurchases = cache(async (limit = 200): Promise<AdminPurchase[]> => {
  return query<AdminPurchase>(
    `select t.id, t.amount, t.description, t.created_at,
            p.full_name, p.phone
       from transactions t join profiles p on p.id = t.user_id
      where t.type = 'share_purchase'
      order by t.created_at desc
      limit $1`,
    [limit],
  );
});

export const getAdminWithdrawals = cache(async (limit = 200): Promise<AdminWithdrawal[]> => {
  return query<AdminWithdrawal>(
    `select w.id, w.user_id, w.amount, w.status, w.bank_name, w.account_number, w.account_name,
            w.created_at, w.processed_at, p.full_name, p.phone
       from withdrawals w join profiles p on p.id = w.user_id
      order by (w.status = 'pending') desc, w.created_at desc
      limit $1`,
    [limit],
  );
});
