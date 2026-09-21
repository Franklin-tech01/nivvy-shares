import { Logo } from "@/components/brand/logo";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-navy p-12 text-navy-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="absolute -right-32 -top-32 size-[28rem] rounded-full border border-white/5"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-24 size-[34rem] rounded-full border border-white/5"
        />
        <Logo tone="light" />
        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Your Nivvy shares, all in one place.
          </h1>
          <p className="mt-4 text-navy-muted">
            Browse share packages, track your portfolio and stay connected with the Nivvy
            community.
          </p>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-navy-muted">
          <ShieldCheck className="size-4 text-primary" /> Your data is protected with row-level
          security.
        </p>
      </aside>
      <section className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="mb-8 lg:hidden" />
          {children}
        </div>
      </section>
    </main>
  );
}
