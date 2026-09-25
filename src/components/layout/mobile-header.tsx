import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { initials } from "@/lib/utils";

/** Sticky top bar shown on mobile only. Admins also get a shortcut to /admin. */
export function MobileHeader({
  name,
  email,
  isAdmin = false,
}: {
  name: string | null;
  email: string | null;
  isAdmin?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur md:hidden">
      <Logo />
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin"
            aria-label="Admin"
            className="grid size-9 place-items-center rounded-full border text-foreground transition-colors hover:bg-muted"
          >
            <ShieldCheck className="size-4" />
          </Link>
        )}
        <Link
          href="/profile"
          aria-label="Profile"
          className="grid size-9 place-items-center rounded-full bg-navy text-xs font-semibold text-primary"
        >
          {initials(name, email)}
        </Link>
      </div>
    </header>
  );
}
