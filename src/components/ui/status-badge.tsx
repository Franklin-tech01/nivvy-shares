import { Badge } from "@/components/ui/badge";
import type { ShareStatus, TxStatus } from "@/lib/types";

const tx: Record<TxStatus, { label: string; tone: "warning" | "success" | "danger" }> = {
  pending: { label: "Pending", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

const share: Record<ShareStatus, { label: string; tone: "success" | "danger" | "warning" | "neutral" }> = {
  available: { label: "Available", tone: "success" },
  sold_out: { label: "Sold out", tone: "danger" },
  coming_soon: { label: "Coming soon", tone: "warning" },
  hidden: { label: "Hidden", tone: "neutral" },
};

export function StatusBadge({
  status,
  kind = "transaction",
}: {
  status: TxStatus | ShareStatus;
  kind?: "transaction" | "share";
}) {
  const m = kind === "share" ? share[status as ShareStatus] : tx[status as TxStatus];
  return (
    <Badge tone={m.tone}>
      <span className="size-1.5 rounded-full bg-current" />
      {m.label}
    </Badge>
  );
}
