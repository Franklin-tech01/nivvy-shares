"use client";

import * as React from "react";
import type { Share } from "@/lib/types";
import { DepositModal } from "./deposit-modal";
import { WithdrawModal } from "./withdraw-modal";
import { BuyShareModal } from "./buy-share-modal";

interface ModalsContextValue {
  openDeposit: () => void;
  openWithdraw: () => void;
  openBuy: (share: Share) => void;
}

const ModalsContext = React.createContext<ModalsContextValue | null>(null);

export function useModals() {
  const ctx = React.useContext(ModalsContext);
  if (!ctx) throw new Error("useModals must be used inside ModalsProvider");
  return ctx;
}

/** Single mount point so Sidebar, dashboard actions and share cards share one modal each. */
export function ModalsProvider({ children }: { children: React.ReactNode }) {
  const [deposit, setDeposit] = React.useState(false);
  const [withdraw, setWithdraw] = React.useState(false);
  const [buy, setBuy] = React.useState<Share | null>(null);

  const value = React.useMemo<ModalsContextValue>(
    () => ({
      openDeposit: () => setDeposit(true),
      openWithdraw: () => setWithdraw(true),
      openBuy: (s) => setBuy(s),
    }),
    [],
  );

  return (
    <ModalsContext.Provider value={value}>
      {children}
      <DepositModal open={deposit} onOpenChange={setDeposit} />
      <WithdrawModal open={withdraw} onOpenChange={setWithdraw} />
      <BuyShareModal share={buy} onOpenChange={(o) => !o && setBuy(null)} />
    </ModalsContext.Provider>
  );
}
