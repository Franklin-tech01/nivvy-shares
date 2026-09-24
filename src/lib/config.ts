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
 * Promotional bonuses (NGN), paid from the operator's own funds — not from
 * user deposits. Credited to the balance on the server, but locked until the
 * user's first share purchase (see migration 0006). BONUSES_ENABLED is the
 * kill switch: false stops all new bonus credits immediately.
 */
export const BONUSES_ENABLED = true;
export const WELCOME_BONUS_AMOUNT = 700;
export const DAILY_LOGIN_BONUS = 200;

export const COMMUNITY_POPUP_STORAGE_KEY = "nivvy:community-popup-dismissed";

/**
 * Deposits (Korapay), share purchases and withdrawal requests are all live.
 * Withdrawals still have no automated payout provider — an admin reviews
 * and pays each one out manually (see /admin/withdrawals).
 */
export const WITHDRAWALS_ENABLED = true;

/** Smallest amount a user can deposit in one go (NGN). Enforced client + server side. */
export const MIN_DEPOSIT_AMOUNT = 3000;

/** Smallest withdrawal request (NGN). Enforced client + server side. */
export const MIN_WITHDRAWAL_AMOUNT = 700;
