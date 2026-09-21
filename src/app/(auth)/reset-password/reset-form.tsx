"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
type Values = z.infer<typeof schema>;

export function ResetForm({ token, invalid }: { token: string | null; invalid: boolean }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  if (invalid || !token) {
    return (
      <div>
        <h2 className="font-display text-2xl font-semibold">Link expired</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This reset link is invalid or has expired. Request a new one.
        </p>
        <Button asChild className="mt-6">
          <Link href="/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(v: Values) {
    const { error } = await authClient.resetPassword({ newPassword: v.password, token: token! });
    if (error) {
      toast.error(error.message || "Could not reset your password.");
      return;
    }
    toast.success("Password updated. Please sign in.");
    router.replace("/login");
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">Choose a new password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <Field label="New password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
        </Field>
        <Field label="Confirm password" htmlFor="confirm" error={errors.confirm?.message}>
          <Input id="confirm" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register("confirm")} />
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Update password
        </Button>
      </form>
    </div>
  );
}
