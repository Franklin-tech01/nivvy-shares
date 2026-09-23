import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { MIN_DEPOSIT_AMOUNT } from "@/lib/config";

const phone = z
  .string()
  .trim()
  .min(1, "Enter your phone number")
  .refine((v) => normalizePhone(v) !== null, "Enter a valid phone number");

export const loginSchema = z.object({
  phone,
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(80),
    phone,
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

// The phone number is the login identity, so it is not editable here.
export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
});

export const supportSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Add a subject").max(120),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)").max(2000),
});

const amount = z
  .string()
  .trim()
  .min(1, "Enter an amount")
  .refine((v) => Number(v) > 0, "Amount must be greater than zero");

export const depositSchema = z.object({
  amount: amount.refine(
    (v) => Number(v) >= MIN_DEPOSIT_AMOUNT,
    `Minimum deposit is ₦${MIN_DEPOSIT_AMOUNT.toLocaleString("en-NG")}`,
  ),
  method: z.string().min(1, "Choose a payment method"),
});

export const withdrawSchema = z.object({
  amount,
  accountName: z.string().trim().min(2, "Enter the account name"),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Enter a valid 10-digit account number"),
  bankName: z.string().trim().min(2, "Enter the bank name"),
});
