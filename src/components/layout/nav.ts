import {
  ArrowDownToLine,
  ArrowUpFromLine,
  HeadphonesIcon,
  LayoutDashboard,
  Receipt,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  /** Items without an href open a modal instead of navigating. */
  action?: "deposit" | "withdraw";
}

export const sidebarNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Deposit", action: "deposit", icon: ArrowDownToLine },
  { label: "Withdraw", action: "withdraw", icon: ArrowUpFromLine },
  { label: "Customer Service", href: "/support", icon: HeadphonesIcon },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export const mobileNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Support", href: "/support", icon: HeadphonesIcon },
  { label: "Profile", href: "/profile", icon: UserRound },
];
