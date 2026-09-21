"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Check, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DAILY_REWARD_AMOUNTS } from "@/lib/config";
import { recordDailyLogin } from "@/lib/actions/account";
import { cn, formatMoney } from "@/lib/utils";
import type { LoginReward } from "@/lib/types";

const todayUtc = () => new Date().toISOString().slice(0, 10);

export function DailyLoginCard({ reward }: { reward: LoginReward | null }) {
  const recorded = useRef(false);
  const loggedToday = reward?.last_login_date === todayUtc();

  // Record today's login (streak only, no money) once per visit. The action
  // revalidates the dashboard, so the card updates itself.
  useEffect(() => {
    if (loggedToday || recorded.current) return;
    recorded.current = true;
    void recordDailyLogin();
  }, [loggedToday]);

  const streak = reward?.current_streak ?? 0;
  const todayIndex = loggedToday ? Math.max(streak, 1) - 1 : Math.min(streak, 6);
  const todayReward = DAILY_REWARD_AMOUNTS[todayIndex];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-md bg-navy text-primary">
            <CalendarCheck className="size-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold">Daily Login Reward</h2>
            <p className="text-sm text-muted-foreground">Log in daily and keep your streak active.</p>
          </div>
        </div>
        <Badge tone={loggedToday ? "success" : "warning"}>
          {loggedToday ? "Logged in today" : "Not yet today"}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-muted/60 p-3">
          <p className="text-xs text-muted-foreground">Current streak</p>
          <p className="flex items-center gap-1.5 font-display text-xl font-semibold">
            <Flame className="size-5 text-primary" /> {streak} {streak === 1 ? "day" : "days"}
          </p>
        </div>
        <div className="rounded-md bg-muted/60 p-3">
          <p className="text-xs text-muted-foreground">Today&apos;s reward</p>
          <p className="tabular font-display text-xl font-semibold">
            {todayReward != null ? formatMoney(todayReward) : "Coming soon"}
          </p>
        </div>
      </div>

      <ol className="mt-5 flex items-center" aria-label="Weekly progression">
        {Array.from({ length: 7 }, (_, i) => {
          const done = i < streak;
          const isToday = i === todayIndex;
          return (
            <li key={i} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "grid size-8 place-items-center rounded-full border text-xs font-semibold sm:size-9",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : isToday
                        ? "border-primary text-foreground"
                        : "bg-card text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </motion.span>
                <span className="text-[10px] text-muted-foreground sm:text-xs">Day {i + 1}</span>
              </div>
              {i < 6 && <div className={cn("mx-1 mb-5 h-0.5 flex-1 rounded", i < streak - 1 ? "bg-primary" : "bg-muted")} />}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
