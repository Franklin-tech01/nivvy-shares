/**
 * Central app configuration. External links can be overridden per environment
 * with env vars without touching components. The Telegram community links are
 * public invite links (not secrets), so they're the defaults; `||` (not `??`)
 * so an env var set to an empty string still falls back to them.
 */
export const links = {
  communityGroup:
    process.env.NEXT_PUBLIC_COMMUNITY_GROUP_URL || "https://t.me/+9BGUvcCUo-4xZmJk",
  communityChannel:
    process.env.NEXT_PUBLIC_COMMUNITY_CHANNEL_URL || "https://t.me/+pgJpPYRODtswNzQ0",
  whatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL ?? "",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",
};

/**
 * Daily login reward display values for day 1..7 (in NGN).
 * Left null until the real amounts are decided. This is display-only:
 * nothing is credited to any balance in this phase.
 */
export const DAILY_REWARD_AMOUNTS: (number | null)[] = [
  null, null, null, null, null, null, null,
];

export const COMMUNITY_POPUP_STORAGE_KEY = "nivvy:community-popup-dismissed";

/**
 * Deposits (Korapay), share purchases and withdrawal requests are all live.
 * Withdrawals still have no automated payout provider — an admin reviews
 * and pays each one out manually (see /admin/withdrawals).
 */
export const WITHDRAWALS_ENABLED = true;

/** Smallest amount a user can deposit in one go (NGN). Enforced client + server side. */
export const MIN_DEPOSIT_AMOUNT = 3000;
