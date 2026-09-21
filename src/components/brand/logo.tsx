import { cn } from "@/lib/utils";

/** Geometric "N" mark: two pillars joined by a rising diagonal. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--navy)" />
      <path d="M9 23V9h3.2l7.6 9.6V9H23v14h-3.2l-7.6-9.6V23z" fill="var(--primary)" />
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-xl font-semibold tracking-tight",
          tone === "light" ? "text-white" : "text-foreground",
        )}
      >
        Nivvy
      </span>
    </span>
  );
}
