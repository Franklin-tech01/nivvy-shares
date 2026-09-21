"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { useModals } from "@/components/modals/modals-provider";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { sidebarNav, type NavItem } from "./nav";

/** Rail (icons only) on tablet, full sidebar on desktop, hidden on mobile. */
export function Sidebar() {
  const pathname = usePathname();
  const { openDeposit, openWithdraw } = useModals();

  const itemClass = (active: boolean) =>
    cn(
      "group relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors md:justify-center lg:justify-start",
      active
        ? "bg-white/10 text-white"
        : "text-navy-muted hover:bg-white/5 hover:text-white",
    );

  function renderItem(item: NavItem) {
    const active = !!item.href && pathname.startsWith(item.href);
    const content = (
      <>
        {active && <span className="absolute left-0 h-5 w-1 rounded-r bg-primary" />}
        <item.icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
        <span className="md:hidden lg:inline">{item.label}</span>
      </>
    );
    if (item.href) {
      return (
        <Link key={item.label} href={item.href} title={item.label} className={itemClass(active)} aria-current={active ? "page" : undefined}>
          {content}
        </Link>
      );
    }
    return (
      <button
        key={item.label}
        type="button"
        title={item.label}
        onClick={item.action === "deposit" ? openDeposit : openWithdraw}
        className={cn(itemClass(false), "w-full text-left")}
      >
        {content}
      </button>
    );
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-[76px] shrink-0 flex-col bg-navy p-3 md:flex lg:w-64 lg:p-4">
      <div className="flex h-12 items-center justify-center px-1 lg:justify-start lg:px-2">
        <Logo tone="light" className="hidden lg:inline-flex" />
        <LogoMark className="lg:hidden" />
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Main">
        {sidebarNav.map(renderItem)}
      </nav>

      <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
        <Link href="/settings" title="Settings" className={itemClass(pathname.startsWith("/settings"))}>
          <Settings className="size-[18px]" />
          <span className="md:hidden lg:inline">Settings</span>
        </Link>
        <form action={signOut}>
          <button type="submit" title="Logout" className={cn(itemClass(false), "w-full text-left")}>
            <LogOut className="size-[18px]" />
            <span className="md:hidden lg:inline">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
