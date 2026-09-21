"use server";
/* eslint-disable @typescript-eslint/no-unused-vars -- inert seams, inputs used once providers are wired */

/**
 * Payment/purchase seams. These are intentionally inert in this phase:
 * they validate nothing, move no money and write no transactions.
 * When a payment provider is added, implement these server-side (using the
 * service role key on the server only) and flip PAYMENTS_ENABLED in
 * `@/lib/config`. The UI already calls these entry points.
 */
import { PAYMENTS_ENABLED } from "@/lib/config";

export type PaymentResult = { ok: false; reason: "not_enabled" } | { ok: true; reference: string };

export async function initiateDeposit(_input: { amount: number; method: string }): Promise<PaymentResult> {
  if (!PAYMENTS_ENABLED) return { ok: false, reason: "not_enabled" };
  throw new Error("Deposit provider not implemented");
}

export async function requestWithdrawal(_input: {
  amount: number;
  method: string;
  destination: string;
}): Promise<PaymentResult> {
  if (!PAYMENTS_ENABLED) return { ok: false, reason: "not_enabled" };
  throw new Error("Withdrawal provider not implemented");
}

export async function purchaseShare(_input: { shareId: string; quantity: number }): Promise<PaymentResult> {
  if (!PAYMENTS_ENABLED) return { ok: false, reason: "not_enabled" };
  throw new Error("Purchase processing not implemented");
}
