"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ArrowUpFromLine, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(withdrawSchema) });

  async function onSubmit(v: Values) {
    const res = await requestWithdrawal({
      amount: Number(v.amount),
      accountName: v.accountName,
      accountNumber: v.accountNumber,
      bankName: v.bankName,
    });
    if (res.ok) {
      toast.success("Withdrawal request submitted. It will be reviewed and paid out manually.");
      reset();
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
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
          <Field label="Bank name" htmlFor="wd-bank" error={errors.bankName?.message}>
            <Input id="wd-bank" placeholder="e.g. GTBank" aria-invalid={!!errors.bankName} {...register("bankName")} />
          </Field>
          <Field label="Account number" htmlFor="wd-acct-no" error={errors.accountNumber?.message}>
            <Input
              id="wd-acct-no"
              inputMode="numeric"
              placeholder="0123456789"
              aria-invalid={!!errors.accountNumber}
              {...register("accountNumber")}
            />
          </Field>
          <Field label="Account name" htmlFor="wd-acct-name" error={errors.accountName?.message}>
            <Input
              id="wd-acct-name"
              placeholder="Name on the account"
              aria-invalid={!!errors.accountName}
              {...register("accountName")}
            />
          </Field>
          <div className="flex gap-2.5 rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              The amount is held from your balance immediately. Withdrawals are reviewed and paid out
              manually, and can take up to a few business days.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !WITHDRAWALS_ENABLED}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowUpFromLine />}
            {WITHDRAWALS_ENABLED ? "Request Withdrawal" : "Withdrawals paused"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
