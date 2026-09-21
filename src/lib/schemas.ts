import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export const forgotSchema = z.object({ email: z.string().trim().email("Enter a valid email") });

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+\d\s()-]*$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

export const supportSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  subject: z.string().trim().min(3, "Add a subject").max(120),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)").max(2000),
});

const amount = z
  .string()
  .trim()
  .min(1, "Enter an amount")
  .refine((v) => Number(v) > 0, "Amount must be greater than zero");

export const depositSchema = z.object({
  amount,
  method: z.string().min(1, "Choose a payment method"),
});

export const withdrawSchema = z.object({
  amount,
  method: z.string().min(1, "Choose a withdrawal method"),
  destination: z.string().trim().min(3, "Enter your account details"),
});
