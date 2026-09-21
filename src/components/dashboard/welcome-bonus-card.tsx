"use client";

import { Check, Gift } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import type { WelcomeBonus } from "@/lib/types";

const steps = ["Joined", "Available", "Claimed"] as const;
const stepIndex: Record<WelcomeBonus["status"], number> = {
  pending: 0,
  available: 1,
  claimed: 2,
  expired: 0,
};
const statusMeta: Record<WelcomeBonus["status"], { label: string; tone: "warning" | "brand" | "success" | "danger" }> = {
  pending: { label: "Pending", tone: "warning" },
  available: { label: "Ready to claim", tone: "brand" },
  claimed: { label: "Claimed", tone: "success" },
  expired: { label: "Expired", tone: "danger" },
};

export function WelcomeBonusCard({ bonus }: { bonus: WelcomeBonus | null }) {
  if (!bonus) return null;
  const meta = statusMeta[bonus.status];
  const current = stepIndex[bonus.status];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-md bg-navy text-primary">
            <Gift className="size-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold">Welcome Bonus</h2>
            <p className="text-sm text-muted-foreground">Get rewarded for joining Nivvy.</p>
          </div>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>

      <div className="px-5">
        <p className="text-xs text-muted-foreground">Bonus amount</p>
        <p className="tabular font-display text-3xl font-semibold">
          {bonus.amount > 0 ? formatMoney(bonus.amount) : "To be announced"}
        </p>
      </div>

      <ol className="mt-5 grid grid-cols-3 gap-2 px-5" aria-label="Bonus progress">
        {steps.map((s, i) => (
          <li key={s} className="space-y-1.5">
            <div className={cn("h-1.5 rounded-full", i <= current ? "bg-primary" : "bg-muted")} />
            <p className={cn("flex items-center gap-1 text-xs", i <= current ? "font-medium" : "text-muted-foreground")}>
              {i < current && <Check className="size-3 text-success" />} {s}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-center justify-between gap-3 border-t bg-muted/40 px-5 py-3">
        <p className="text-xs text-muted-foreground">
          {bonus.status === "claimed" ? `Claimed ${formatDate(bonus.claimed_at)}` : "Crediting is not enabled yet."}
        </p>
        {bonus.status === "available" && (
          <Button size="sm" onClick={() => toast.info("Bonus claiming will open soon. Nothing was credited.")}>
            Claim
          </Button>
        )}
      </div>
    </Card>
  );
}
