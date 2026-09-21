"use client";

import { ArrowDownToLine, ArrowUpFromLine, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/components/modals/modals-provider";
import { formatMoney } from "@/lib/utils";

export function BalanceCard({ balance }: { balance: number }) {
  const { openDeposit, openWithdraw } = useModals();
  return (
    <div className="relative overflow-hidden rounded-lg bg-navy p-6 text-navy-foreground shadow-card">
      <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full border border-white/5" />
      <div aria-hidden className="absolute -right-4 -top-4 size-36 rounded-full border border-white/5" />
      <p className="flex items-center gap-2 text-sm text-navy-muted">
        <Wallet className="size-4" /> Total Balance
      </p>
      <p className="tabular mt-2 font-display text-4xl font-semibold tracking-tight">
        {formatMoney(balance)}
      </p>
      <p className="mt-1 text-xs text-navy-muted">Available balance</p>
      <div className="relative mt-6 grid grid-cols-2 gap-3 sm:max-w-xs">
        <Button onClick={openDeposit}>
          <ArrowDownToLine /> Deposit
        </Button>
        <Button
          onClick={openWithdraw}
          className="border border-white/15 bg-white/5 text-white hover:bg-white/10"
          variant="ghost"
        >
          <ArrowUpFromLine /> Withdraw
        </Button>
      </div>
    </div>
  );
}
