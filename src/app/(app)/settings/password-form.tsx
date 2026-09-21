"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const schema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
type Values = z.infer<typeof schema>;

export function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(v: Values) {
    const { error } = await authClient.changePassword({
      currentPassword: v.current,
      newPassword: v.password,
      revokeOtherSessions: true,
    });
    if (error) toast.error(error.message || "Could not update your password.");
    else {
      toast.success("Password updated.");
      reset();
    }
  }

  return (
    <Card className="max-w-lg p-5 md:p-6">
      <h2 className="font-display text-lg font-semibold">Change password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
        <Field label="Current password" htmlFor="pw0" error={errors.current?.message}>
          <Input id="pw0" type="password" autoComplete="current-password" aria-invalid={!!errors.current} {...register("current")} />
        </Field>
        <Field label="New password" htmlFor="pw" error={errors.password?.message}>
          <Input id="pw" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
        </Field>
        <Field label="Confirm new password" htmlFor="pw2" error={errors.confirm?.message}>
          <Input id="pw2" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register("confirm")} />
        </Field>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Update password
        </Button>
      </form>
    </Card>
  );
}
