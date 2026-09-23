"use server";

import { revalidatePath } from "next/cache";
import { withTransaction } from "@/lib/db";
import { requireAdmin } from "@/lib/data/admin";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

/**
 * Marks a pending withdrawal as paid out. The balance was already debited
 * when the user requested it, so this only flips status — it never touches
 * the balance. Paying the user is done manually, outside this app.
 */
export async function markWithdrawalPaid(withdrawalId: string): Promise<AdminActionResult> {
  await requireAdmin();
  try {
    const updated = await withTransaction(async (q) => {
      const rows = await q(
        `update withdrawals set status = 'completed', processed_at = now()
          where id = $1 and status = 'pending' returning id`,
        [withdrawalId],
      );
      if (rows.length === 0) return false;
      await q(
        `update transactions set status = 'completed'
          where type = 'withdrawal' and (metadata ->> 'withdrawal_id') = $1`,
        [withdrawalId],
      );
      return true;
    });
    if (!updated) return { ok: false, error: "This withdrawal was already processed." };
  } catch (e) {
    console.error("[admin:payout]", e);
    return { ok: false, error: "Could not mark this withdrawal as paid." };
  }
  revalidatePath("/admin/withdrawals");
  revalidatePath("/admin");
  return { ok: true };
}

/** Rejects a pending withdrawal and refunds the held amount back to the user's balance. */
export async function rejectWithdrawal(withdrawalId: string): Promise<AdminActionResult> {
  await requireAdmin();
  try {
    const refunded = await withTransaction(async (q) => {
      const rows = await q<{ user_id: string; amount: number }>(
        `update withdrawals set status = 'failed', processed_at = now()
          where id = $1 and status = 'pending' returning user_id, amount`,
        [withdrawalId],
      );
      const withdrawal = rows[0];
      if (!withdrawal) return false;
      await q("update portfolios set balance = balance + $1 where user_id = $2", [
        withdrawal.amount,
        withdrawal.user_id,
      ]);
      await q(
        `update transactions set status = 'failed'
          where type = 'withdrawal' and (metadata ->> 'withdrawal_id') = $1`,
        [withdrawalId],
      );
      return true;
    });
    if (!refunded) return { ok: false, error: "This withdrawal was already processed." };
  } catch (e) {
    console.error("[admin:reject]", e);
    return { ok: false, error: "Could not reject this withdrawal." };
  }
  revalidatePath("/admin/withdrawals");
  revalidatePath("/admin");
  return { ok: true };
}
