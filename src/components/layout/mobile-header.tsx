import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { initials } from "@/lib/utils";

/** Sticky top bar shown on mobile only. */
export function MobileHeader({ name, email }: { name: string | null; email: string | null }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur md:hidden">
      <Logo />
      <Link
        href="/profile"
        aria-label="Profile"
        className="grid size-9 place-items-center rounded-full bg-navy text-xs font-semibold text-primary"
      >
        {initials(name, email)}
      </Link>
    </header>
  );
}
