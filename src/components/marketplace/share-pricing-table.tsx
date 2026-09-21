"use client";

import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoMark } from "@/components/brand/logo";
import { StatusBadge } from "@/components/ui/status-badge";
import { useModals } from "@/components/modals/modals-provider";
import { EmptyState } from "@/components/layout/page-header";
import { formatMoney } from "@/lib/utils";
import type { Share } from "@/lib/types";

export function SharePricingTable({ shares, showAllLink }: { shares: Share[]; showAllLink?: boolean }) {
  const { openBuy } = useModals();

  return (
    <section aria-labelledby="pricing-title">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 id="pricing-title" className="font-display text-xl font-semibold">
            Nivvy Share Packages
          </h2>
          <p className="text-sm text-muted-foreground">Choose a package that fits you.</p>
        </div>
        {showAllLink && (
          <Link href="/marketplace" className="flex items-center gap-1 text-sm font-semibold text-warning hover:underline">
            View marketplace <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      {shares.length === 0 ? (
        <EmptyState
          icon={<Layers />}
          title="No share packages yet"
          description="Packages will appear here as soon as they are published."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-navy text-left text-xs uppercase tracking-wide text-navy-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Package</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shares.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <LogoMark className="size-9" />
                        <div>
                          <p className="flex items-center gap-2 font-semibold">
                            {s.name}
                            {s.badge && <Badge tone="brand">{s.badge}</Badge>}
                          </p>
                          <p className="text-xs capitalize text-muted-foreground">{s.tier}</p>
                        </div>
                      </div>
                    </td>
                    <td className="tabular px-4 py-3.5 font-display font-semibold">{formatMoney(s.price)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge kind="share" status={s.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button size="sm" disabled={s.status !== "available"} onClick={() => openBuy(s)}>
                        Buy
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}
