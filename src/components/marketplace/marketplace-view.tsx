"use client";

import { useMemo, useState } from "react";
import { Layers } from "lucide-react";
import { EmptyState } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import type { Share, ShareTier } from "@/lib/types";
import { ShareCard } from "./share-card";

const filters: { label: string; value: "all" | ShareTier }[] = [
  { label: "All", value: "all" },
  { label: "Standard", value: "standard" },
  { label: "Premium", value: "premium" },
  { label: "VIP", value: "vip" },
];

export function MarketplaceView({ shares }: { shares: Share[] }) {
  const [tier, setTier] = useState<"all" | ShareTier>("all");
  const visible = useMemo(
    () => (tier === "all" ? shares : shares.filter((s) => s.tier === tier)),
    [shares, tier],
  );

  return (
    <div>
      <div role="tablist" aria-label="Filter by tier" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {filters.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={tier === f.value}
            onClick={() => setTier(f.value)}
            className={cn(
              "h-10 shrink-0 rounded-full border px-5 text-sm font-semibold transition-colors",
              tier === f.value
                ? "border-navy bg-navy text-navy-foreground"
                : "bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Layers />}
          title="No shares here yet"
          description={tier === "all" ? "Packages will appear as soon as they are published." : "No packages in this tier right now."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((s) => (
            <ShareCard key={s.id} share={s} />
          ))}
        </div>
      )}
    </div>
  );
}
