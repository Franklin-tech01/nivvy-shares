"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/data";
import { profileSchema, supportSchema } from "@/lib/schemas";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(input: z.infer<typeof profileSchema>): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are signed out." };

  try {
    // Only name and phone are user-editable; status/email/id never come from the client.
    await query("update profiles set full_name = $1, phone = $2 where id = $3", [
      parsed.data.full_name,
      parsed.data.phone || null,
      user.id,
    ]);
  } catch {
    return { ok: false, error: "Could not save your profile. Try again." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function submitSupportTicket(
  input: z.infer<typeof supportSchema>,
): Promise<ActionResult> {
  const parsed = supportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are signed out." };

  try {
    const { name, email, subject, message } = parsed.data;
    await query(
      "insert into support_tickets (user_id, name, email, subject, message) values ($1, $2, $3, $4, $5)",
      [user.id, name, email, subject, message],
    );
  } catch {
    return { ok: false, error: "Could not send your message. Try again." };
  }
  return { ok: true };
}

/** Records today's login for the streak. Tracks the streak only; credits nothing. */
export async function recordDailyLogin(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are signed out." };
  try {
    await query("select record_daily_login($1)", [user.id]);
  } catch {
    return { ok: false, error: "Could not record login." };
  }
  revalidatePath("/dashboard");
  return { ok: true };
}
