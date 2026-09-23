export type ShareTier = "standard" | "premium" | "vip";
export type ShareStatus = "available" | "sold_out" | "coming_soon" | "hidden";
export type TxType = "deposit" | "withdrawal" | "share_purchase" | "bonus" | "reward";
export type TxStatus = "pending" | "completed" | "failed";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  account_status: "active" | "suspended" | "pending";
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  price: number;
  tier: ShareTier;
  badge: string | null;
  image_url: string | null;
  status: ShareStatus;
  display_order: number;
  created_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  balance: number;
  total_investment: number;
  total_value: number;
}

export interface Holding {
  id: string;
  share_id: string;
  quantity: number;
  purchase_price: number;
  shares: Pick<Share, "name" | "symbol" | "tier"> | null;
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  reference: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LoginReward {
  id: string;
  current_streak: number;
  last_login_date: string | null;
  total_rewards: number;
}

export interface WelcomeBonus {
  id: string;
  amount: number;
  status: "pending" | "available" | "claimed" | "expired";
  claimed_at: string | null;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: TxStatus;
  bank_name: string | null;
  bank_code: string | null;
  account_number: string | null;
  account_name: string | null;
  payout_reference: string | null;
  payout_fee: number | null;
  created_at: string;
  processed_at: string | null;
}

/** Admin views: a row flattened with who it belongs to. */
export type AdminDeposit = {
  id: string;
  amount: number;
  status: TxStatus;
  payment_method: string | null;
  created_at: string;
  full_name: string | null;
  phone: string | null;
};
export type AdminPurchase = {
  id: string;
  amount: number;
  description: string | null;
  created_at: string;
  full_name: string | null;
  phone: string | null;
};
export type AdminWithdrawal = Withdrawal & { full_name: string | null; phone: string | null };
