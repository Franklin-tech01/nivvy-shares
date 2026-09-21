"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Landmark, Info } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { depositSchema } from "@/lib/schemas";
import { initiateDeposit } from "@/lib/actions/payments";

type Values = z.infer<typeof depositSchema>;

export function DepositModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(depositSchema), defaultValues: { method: "" } });

  async function onSubmit(v: Values) {
    const res = await initiateDeposit({ amount: Number(v.amount), method: v.method });
    if (!res.ok) toast.info("Payment integration coming soon. No money was moved.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader title="Deposit Funds" description="Add money to your Nivvy balance." />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 pt-3">
          <Field label="Amount (₦)" htmlFor="dep-amount" error={errors.amount?.message}>
            <Input
              id="dep-amount"
              inputMode="decimal"
              placeholder="0.00"
              aria-invalid={!!errors.amount}
              {...register("amount")}
            />
          </Field>
          <Field label="Payment method" htmlFor="dep-method" error={errors.method?.message}>
            <Select id="dep-method" {...register("method")}>
              <option value="">Select a method</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="card">Debit card</option>
            </Select>
          </Field>
          <div className="flex gap-2.5 rounded-md bg-primary-soft p-3 text-sm text-warning">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>Payment integration coming soon.</p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Landmark /> Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
