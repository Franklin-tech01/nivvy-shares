"use client";

import { Copy, Send, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Shows the user's invite link and how many accounts signed up through it.
 * Tracking only — no rewards are attached to referrals.
 */
export function ReferralCard({ code, baseUrl, count }: { code: string; baseUrl: string; count: number }) {
  const link = `${baseUrl}/register?ref=${code}`;
  const message = `Join me on Nivvy: ${link}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied.");
    } catch {
      toast.error("Could not copy. Select the link and copy it manually.");
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-md bg-navy text-primary">
            <Share2 className="size-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold">Your Invite Link</h2>
            <p className="text-sm text-muted-foreground">Anyone who signs up with it is linked to your account.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold">
          <Users className="size-3.5" /> {count} {count === 1 ? "signup" : "signups"}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-md border bg-muted/50 p-1.5 pl-3">
        <p className="min-w-0 flex-1 truncate font-mono text-xs sm:text-sm" title={link}>
          {link}
        </p>
        <Button size="sm" onClick={copy}>
          <Copy /> Copy
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" asChild>
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
            <Send /> WhatsApp
          </a>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join me on Nivvy")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Send /> Telegram
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">
          Your code: <span className="font-mono font-semibold text-foreground">{code}</span>
        </p>
      </div>
    </Card>
  );
}
