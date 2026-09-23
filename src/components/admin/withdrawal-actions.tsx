"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markWithdrawalPaid, rejectWithdrawal } from "@/lib/actions/admin";
import { formatMoney } from "@/lib/utils";

export function WithdrawalActions({ id, amount, name }: { id: string; amount: number; name: string }) {
  const [pending, startTransition] = useTransition();
  const [busyAction, setBusyAction] = useState<"pay" | "reject" | null>(null);

  function pay() {
    if (!window.confirm(`Mark ${formatMoney(amount)} to ${name} as paid?\n\nOnly do this after you have actually sent the money.`)) return;
    setBusyAction("pay");
    startTransition(async () => {
      const res = await markWithdrawalPaid(id);
      if (res.ok) toast.success("Marked as paid.");
      else toast.error(res.error);
    });
  }

  function reject() {
    if (!window.confirm(`Reject this withdrawal and refund ${formatMoney(amount)} to ${name}'s balance?`)) return;
    setBusyAction("reject");
    startTransition(async () => {
      const res = await rejectWithdrawal(id);
      if (res.ok) toast.success("Rejected and refunded.");
      else toast.error(res.error);
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" onClick={reject} disabled={pending}>
        {pending && busyAction === "reject" ? <Loader2 className="animate-spin" /> : <X />} Reject
      </Button>
      <Button size="sm" onClick={pay} disabled={pending}>
        {pending && busyAction === "pay" ? <Loader2 className="animate-spin" /> : <Check />} Mark Paid
      </Button>
    </div>
  );
}
