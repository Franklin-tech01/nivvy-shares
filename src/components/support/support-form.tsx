"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { submitSupportTicket } from "@/lib/actions/account";
import { supportSchema } from "@/lib/schemas";

type Values = z.infer<typeof supportSchema>;

export function SupportForm({ defaultName, defaultEmail }: { defaultName: string; defaultEmail: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(supportSchema),
    defaultValues: { name: defaultName, email: defaultEmail, subject: "", message: "" },
  });

  async function onSubmit(v: Values) {
    const res = await submitSupportTicket(v);
    if (res.ok) {
      toast.success("Message sent. We will get back to you by email.");
      reset({ ...v, subject: "", message: "" });
    } else toast.error(res.error);
  }

  return (
    <Card className="p-5 md:p-6">
      <h2 className="font-display text-lg font-semibold">Send us a message</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="s-name" error={errors.name?.message}>
            <Input id="s-name" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <Field label="Email" htmlFor="s-email" error={errors.email?.message}>
            <Input id="s-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
          </Field>
        </div>
        <Field label="Subject" htmlFor="s-subject" error={errors.subject?.message}>
          <Input id="s-subject" aria-invalid={!!errors.subject} {...register("subject")} />
        </Field>
        <Field label="Message" htmlFor="s-message" error={errors.message?.message}>
          <Textarea id="s-message" aria-invalid={!!errors.message} {...register("message")} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} Send Message
        </Button>
      </form>
    </Card>
  );
}
