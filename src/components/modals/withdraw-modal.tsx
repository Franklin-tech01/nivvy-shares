"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ArrowUpFromLine, Info } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { withdrawSchema } from "@/lib/schemas";
import { requestWithdrawal } from "@/lib/actions/payments";
import { WITHDRAWALS_ENABLED } from "@/lib/config";

type Values = z.infer<typeof withdrawSchema>;

export function WithdrawModal({
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
  } = useForm<Values>({ resolver: zodResolver(withdrawSchema), defaultValues: { method: "" } });

  async function onSubmit(v: Values) {
    const res = await requestWithdrawal({
      amount: Number(v.amount),
      method: v.method,
      destination: v.destination,
    });
    if (!res.ok) toast.info("Withdrawal processing will be available soon. Nothing was submitted.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader title="Withdraw Funds" description="Move money out of your Nivvy balance." />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 pt-3">
          <Field label="Amount (₦)" htmlFor="wd-amount" error={errors.amount?.message}>
            <Input
              id="wd-amount"
              inputMode="decimal"
              placeholder="0.00"
              aria-invalid={!!errors.amount}
              {...register("amount")}
            />
          </Field>
          <Field label="Withdrawal method" htmlFor="wd-method" error={errors.method?.message}>
            <Select id="wd-method" {...register("method")}>
              <option value="">Select a method</option>
              <option value="bank_transfer">Bank transfer</option>
            </Select>
          </Field>
          <Field label="Account details" htmlFor="wd-dest" error={errors.destination?.message}>
            <Input
              id="wd-dest"
              placeholder="Bank name and account number"
              aria-invalid={!!errors.destination}
              {...register("destination")}
            />
          </Field>
          <div className="flex gap-2.5 rounded-md bg-primary-soft p-3 text-sm text-warning">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>Withdrawal processing will be available soon.</p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !WITHDRAWALS_ENABLED}>
            <ArrowUpFromLine /> Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
