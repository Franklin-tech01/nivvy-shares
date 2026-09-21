import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layout/page-header";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import type { Transaction, TxType } from "@/lib/types";

const typeLabel: Record<TxType, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  share_purchase: "Share Purchase",
  bonus: "Bonus",
  reward: "Reward",
};

/** Money leaving the balance is shown negative. */
const isOutflow = (t: TxType) => t === "withdrawal" || t === "share_purchase";

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt />}
        title="No transactions yet"
        description="Deposits, purchases, bonuses and rewards will show up here."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Transaction ID</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-muted/40">
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs">{t.reference}</td>
                <td className="whitespace-nowrap px-4 py-3.5 font-medium">{typeLabel[t.type]}</td>
                <td className="max-w-[260px] truncate px-4 py-3.5 text-muted-foreground">{t.description ?? "—"}</td>
                <td className={cn("tabular whitespace-nowrap px-4 py-3.5 text-right font-semibold", isOutflow(t.type) ? "text-foreground" : "text-success")}>
                  {isOutflow(t.type) ? "−" : "+"}
                  {formatMoney(t.amount)}
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={t.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-muted-foreground">{formatDate(t.created_at, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
