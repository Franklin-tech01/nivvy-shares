import "server-only";

/**
 * OTPay: used for withdrawal payouts (bank transfer out). Deposits still go
 * through Korapay (`@/lib/korapay`) — the two are unrelated.
 * https://otpay.ng/api/v1
 *
 * NOTE ON TESTING: get_banks and query_bank_account are read-only and safe
 * to call freely. The payout endpoint moves real money and accepts no
 * client-supplied idempotency key, so it is never called from test scripts —
 * only from the admin action, behind the lock in `src/lib/actions/admin.ts`.
 */
const API_BASE = "https://otpay.ng/api/v1";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "api-key": requireEnv("OTPAY_API_KEY"),
    "secret-key": requireEnv("OTPAY_SECRET_KEY"),
  };
}

export interface Bank {
  bank_name: string;
  bank_code: string;
}

let bankCache: { at: number; banks: Bank[] } | null = null;
const BANK_CACHE_MS = 60 * 60 * 1000; // bank lists change essentially never

export async function getBanks(): Promise<Bank[]> {
  if (bankCache && Date.now() - bankCache.at < BANK_CACHE_MS) return bankCache.banks;
  const res = await fetch(`${API_BASE}/get_banks`, {
    headers: { "api-key": requireEnv("OTPAY_API_KEY") },
  });
  const json = await res.json().catch(() => null);
  if (!json?.status || !Array.isArray(json?.data)) {
    throw new Error(json?.desc ?? "Could not load the bank list");
  }
  bankCache = { at: Date.now(), banks: json.data };
  return json.data;
}

export interface VerifiedAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
}

export async function verifyBankAccount(bankAccountNo: string, bankCode: string): Promise<VerifiedAccount> {
  const res = await fetch(`${API_BASE}/query_bank_account`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      business_code: requireEnv("OTPAY_BUSINESS_CODE"),
      bank_account_no: bankAccountNo,
      bank_code: bankCode,
    }),
  });
  const json = await res.json().catch(() => null);
  if (!json?.status) throw new Error(json?.desc ?? "Could not verify this account");
  return { accountNumber: json.account_number, accountName: json.account_name, bankName: json.bank_name };
}

/**
 * Thrown when we genuinely cannot tell whether a payout went through (network
 * error, timeout, unreadable response) — as opposed to a clear failure
 * response from OTPay. Callers must never treat this the same as a normal
 * failure: retrying blind risks a double payout.
 */
export class OtpayAmbiguousError extends Error {}

export interface PayoutResult {
  reference: string;
  fee: number;
  walletBalance: number;
}

export async function payout(input: { bankAccountNo: string; bankCode: string; amount: number }): Promise<PayoutResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/payout`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        business_code: requireEnv("OTPAY_BUSINESS_CODE"),
        bank_account_no: input.bankAccountNo,
        bank_code: input.bankCode,
        amount: input.amount,
      }),
    });
  } catch (e) {
    throw new OtpayAmbiguousError(
      `Network error contacting OTPay — could not confirm the payout result: ${e instanceof Error ? e.message : e}`,
    );
  }

  let json: Record<string, unknown> | null;
  try {
    json = await res.json();
  } catch {
    throw new OtpayAmbiguousError(`OTPay returned an unreadable response (HTTP ${res.status}).`);
  }

  if (json?.status !== true) {
    // A parsed response with a clear false/failure is a definite failure, not
    // an ambiguous one — safe to report as "didn't happen".
    throw new Error((json?.desc as string) || `OTPay payout failed (HTTP ${res.status})`);
  }
  return {
    reference: String(json.reference ?? ""),
    fee: Number(json.fee ?? 0),
    walletBalance: Number(json.wallet_balance ?? 0),
  };
}
