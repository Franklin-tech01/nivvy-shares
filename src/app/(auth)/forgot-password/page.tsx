"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { forgotSchema } from "@/lib/schemas";

type Values = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(v: Values) {
    const { error } = await authClient.requestPasswordReset({
      email: v.email,
      redirectTo: "/reset-password",
    });
    if (error) toast.error(error.message || "Could not send the reset link.");
    else setSent(true);
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">Reset your password</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {sent
          ? "If an account exists for that email, a reset link is on its way."
          : "Enter your email and we will send you a reset link."}
      </p>
      {!sent && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />} Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
