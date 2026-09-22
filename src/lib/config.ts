/**
 * Central app configuration. External links come from env vars so they can be
 * changed per environment without touching components.
 */
export const links = {
  communityGroup: process.env.NEXT_PUBLIC_COMMUNITY_GROUP_URL ?? "",
  communityChannel: process.env.NEXT_PUBLIC_COMMUNITY_CHANNEL_URL ?? "",
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
 * Deposits (Korapay) and share purchases (internal balance) are live.
 * Withdrawals still have no payout provider wired up.
 */
export const WITHDRAWALS_ENABLED = false;
