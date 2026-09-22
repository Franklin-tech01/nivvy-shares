"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { query, withTransaction } from "@/lib/db";
import { getCurrentUser } from "@/lib/data";
import { initializeCharge } from "@/lib/korapay";
import { realEmail } from "@/lib/phone";
import { MIN_DEPOSIT_AMOUNT } from "@/lib/config";
import { formatMoney } from "@/lib/utils";

export type PaymentResult =
  | { ok: true; checkoutUrl: string }
  | { ok: true }
  | { ok: false; error: string };

function reference(prefix: string) {
  return `NVY-${prefix}-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

/**
 * Starts a real Korapay deposit: records a pending deposit + transaction,
 * then asks Korapay for a hosted checkout URL for the browser to redirect to.
 * The balance is only credited once the webhook confirms payment
 * (see `src/app/api/webhooks/korapay/route.ts`) — never from this call.
 */
export async function initiateDeposit(input: { amount: number; method: string }): Promise<PaymentResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are signed out." };
  // Mirrors depositSchema's client-side check; enforced again here since a
  // server action can be called directly, bypassing the form.
  if (!(input.amount >= MIN_DEPOSIT_AMOUNT)) {
    return { ok: false, error: `Minimum deposit is ${formatMoney(MIN_DEPOSIT_AMOUNT)}.` };
  }

  const ref = reference("DEP");

  // Split into two try/catches so Vercel's function log says which stage
  // failed (database vs Korapay) instead of one generic message for both.
  // The two inserts run in one transaction so a mid-way failure never
  // leaves a deposit row without its matching transaction row.
  try {
    await withTransaction(async (q) => {
      await q(
        "insert into deposits (user_id, amount, status, payment_reference, payment_method) values ($1, $2, 'pending', $3, $4)",
        [user.id, input.amount, ref, input.method],
      );
      await q(
        "insert into transactions (user_id, type, amount, status, reference, description) values ($1, 'deposit', $2, 'pending', $3, $4)",
        [user.id, input.amount, ref, `Deposit via ${input.method.replace("_", " ")}`],
      );
    });
  } catch (e) {
    console.error("[deposit:db]", e);
    return { ok: false, error: "Could not start the deposit (database). Please try again." };
  }

  try {
    const { checkoutUrl } = await initializeCharge({
      amount: input.amount,
      reference: ref,
      email: realEmail(user.email) ?? user.email,
      name: user.name,
      method: input.method,
    });
    return { ok: true, checkoutUrl };
  } catch (e) {
    console.error("[deposit:korapay]", e);
    return { ok: false, error: "Could not start the deposit (payment provider). Please try again." };
  }
}

/**
 * Buys a share using the user's Nivvy balance only (no external payment).
 * Debit + holding + transaction happen in one DB transaction so a purchase
 * can never charge the balance without recording the holding, or vice versa.
 */
export async function purchaseShare(input: { shareId: string; quantity: number }): Promise<PaymentResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are signed out." };
  const quantity = Math.trunc(input.quantity);
  if (!(quantity >= 1 && quantity <= 99)) return { ok: false, error: "Enter a valid quantity." };

  try {
    const [share] = await query<{ id: string; name: string; price: number; status: string }>(
      "select id, name, price, status from shares where id = $1",
      [input.shareId],
    );
    if (!share || share.status !== "available") {
      return { ok: false, error: "This share is not available right now." };
    }
    const total = share.price * quantity;

    const purchased = await withTransaction(async (q) => {
      // Debit only if the balance covers it; the WHERE guard makes this
      // check-and-debit atomic even under concurrent purchases.
      const updated = await q(
        `update portfolios
            set balance = balance - $1, total_investment = total_investment + $1, total_value = total_value + $1
          where user_id = $2 and balance >= $1
          returning user_id`,
        [total, user.id],
      );
      if (updated.length === 0) return false;

      await q(
        "insert into holdings (user_id, share_id, quantity, purchase_price) values ($1, $2, $3, $4)",
        [user.id, share.id, quantity, share.price],
      );
      await q(
        "insert into transactions (user_id, type, amount, status, description) values ($1, 'share_purchase', $2, 'completed', $3)",
        [user.id, total, `Purchased ${quantity} × ${share.name}`],
      );
      return true;
    });

    if (!purchased) return { ok: false, error: "Insufficient balance. Deposit funds first." };
  } catch (e) {
    console.error("[purchase]", e);
    return { ok: false, error: "Could not complete the purchase. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/marketplace");
  revalidatePath("/transactions");
  return { ok: true };
}

/* eslint-disable @typescript-eslint/no-unused-vars -- inert seam, input used once a payout provider is wired */
/** No payout provider is connected yet, so withdrawals cannot be processed. */
export async function requestWithdrawal(_input: {
  amount: number;
  method: string;
  destination: string;
}): Promise<PaymentResult> {
  return { ok: false, error: "Withdrawal processing will be available soon." };
}
