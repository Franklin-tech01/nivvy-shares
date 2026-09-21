"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field, Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/schemas";

type Values = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(v: Values) {
    // rememberMe=false makes the session end when the browser closes.
    const { error } = await authClient.signIn.email({
      email: v.email,
      password: v.password,
      rememberMe: !!v.remember,
    });
    if (error) {
      toast.error(
        error.status === 401 || error.status === 400
          ? "Incorrect email or password."
          : error.message || "Could not sign in.",
      );
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your Nivvy account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              className="pr-11"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-1 top-1 grid size-9 place-items-center rounded text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="remember"
              render={({ field }) => (
                <Checkbox
                  id="remember"
                  checked={!!field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                />
              )}
            />
            <Label htmlFor="remember" className="font-normal text-muted-foreground">
              Remember me
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm font-medium text-warning hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Login
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Nivvy?{" "}
        <Link href="/register" className="font-semibold text-foreground hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
