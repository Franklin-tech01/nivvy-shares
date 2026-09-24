"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { query, withTransaction } from "@/lib/db";
import { getCurrentUser } from "@/lib/data";
import { profileSchema, supportSchema } from "@/lib/schemas";
import { BONUSES_ENABLED, DAILY_LOGIN_BONUS, WELCOME_BONUS_AMOUNT } from "@/lib/config";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(input: z.infer<typeof profileSchema>): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are signed out." };

  try {
    // Only the name is user-editable. The phone number is the login identity;
    // status/id never come from the client.
    await query("update profiles set full_name = $1 where id = $2", [
      parsed.data.full_name,
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
    // The account phone comes from the server-side profile, never from the form.
    await query(
      `insert into support_tickets (user_id, name, email, phone, subject, message)
       values ($1, $2, $3, (select phone from profiles where id = $1), $4, $5)`,
      [user.id, name, email || null, subject, message],
    );
  } catch {
    return { ok: false, error: "Could not send your message. Try again." };
  }
  return { ok: true };
}

/**
 * Records today's login: updates the streak and credits the promotional
 * bonuses (one-time welcome bonus, then the daily login bonus once per UTC
 * day). Safe to call any number of times — each credit is claimed with a
 * guarded UPDATE, so a repeat call, a second tab, or a race credits nothing
 * twice. Amounts are constants on the server; the client sends nothing.
 *
 * Credited money goes to `balance` and is also counted in `locked_bonus`
 * until the user's first share purchase (unless they've already made one).
 */
export async function recordLogin(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You are signed out." };
  const userId = user.id;
  try {
    await withTransaction(async (q) => {
      await q("select record_daily_login($1)", [userId]);
      if (!BONUSES_ENABLED) return;

      async function credit(amount: number, type: "bonus" | "reward", description: string) {
        await q(
          `update portfolios
              set balance = balance + $1,
                  locked_bonus = locked_bonus + case
                    when exists (select 1 from transactions
                                  where user_id = $2 and type = 'share_purchase' and status = 'completed')
                    then 0 else $1 end
            where user_id = $2`,
          [amount, userId],
        );
        await q(
          `insert into transactions (user_id, type, amount, status, description, metadata)
           values ($1, $2, $3, 'completed', $4, '{"promo": true}'::jsonb)`,
          [userId, type, amount, description],
        );
      }

      const welcome = await q(
        `update welcome_bonuses set status = 'claimed', amount = $1, claimed_at = now()
          where user_id = $2 and status in ('pending', 'available') returning id`,
        [WELCOME_BONUS_AMOUNT, userId],
      );
      if (welcome.length > 0) await credit(WELCOME_BONUS_AMOUNT, "bonus", "Welcome bonus");

      const daily = await q(
        `update login_rewards
            set rewarded_on = (now() at time zone 'utc')::date, total_rewards = total_rewards + $1
          where user_id = $2 and rewarded_on is distinct from (now() at time zone 'utc')::date
          returning id`,
        [DAILY_LOGIN_BONUS, userId],
      );
      if (daily.length > 0) await credit(DAILY_LOGIN_BONUS, "reward", "Daily login bonus");
    });
  } catch (e) {
    console.error("[login]", e);
    return { ok: false, error: "Could not record login." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
