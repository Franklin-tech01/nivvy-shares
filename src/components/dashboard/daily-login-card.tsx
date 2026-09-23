// "use client";

// import { useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import { CalendarCheck, Check, Flame } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Card } from "@/components/ui/card";
// import { DAILY_REWARD_AMOUNTS } from "@/lib/config";
// import { recordDailyLogin } from "@/lib/actions/account";
// import { cn, formatMoney } from "@/lib/utils";
// import type { LoginReward } from "@/lib/types";

// const todayUtc = () => new Date().toISOString().slice(0, 10);

// export function DailyLoginCard({ reward }: { reward: LoginReward | null }) {
//   const recorded = useRef(false);
//   const loggedToday = reward?.last_login_date === todayUtc();

//   // Record today's login (streak only, no money) once per visit. The action
//   // revalidates the dashboard, so the card updates itself.
//   useEffect(() => {
//     if (loggedToday || recorded.current) return;
//     recorded.current = true;
//     void recordDailyLogin();
//   }, [loggedToday]);

//   const streak = reward?.current_streak ?? 0;
//   const todayIndex = loggedToday ? Math.max(streak, 1) - 1 : Math.min(streak, 6);
//   const todayReward = DAILY_REWARD_AMOUNTS[todayIndex];

//   return (
//     <Card className="p-5">
//       <div className="flex items-start justify-between gap-3">
//         <div className="flex items-center gap-3">
//           <div className="grid size-11 place-items-center rounded-md bg-navy text-primary">
//             <CalendarCheck className="size-5" />
//           </div>
//           <div>
//             <h2 className="font-display font-semibold">Daily Login Reward</h2>
//             <p className="text-sm text-muted-foreground">Log in daily and keep your streak active.</p>
//           </div>
//         </div>
//         <Badge tone={loggedToday ? "success" : "warning"}>
//           {loggedToday ? "Logged in today" : "Not yet today"}
//         </Badge>
//       </div>

//       <div className="mt-5 grid grid-cols-2 gap-3">
//         <div className="rounded-md bg-muted/60 p-3">
//           <p className="text-xs text-muted-foreground">Current streak</p>
//           <p className="flex items-center gap-1.5 font-display text-xl font-semibold">
//             <Flame className="size-5 text-primary" /> {streak} {streak === 1 ? "day" : "days"}
//           </p>
//         </div>
//         <div className="rounded-md bg-muted/60 p-3">
//           <p className="text-xs text-muted-foreground">Today&apos;s reward</p>
//           <p className="tabular font-display text-xl font-semibold">
//             {todayReward != null ? formatMoney(todayReward) : "Coming soon"}
//           </p>
//         </div>
//       </div>

//       <ol className="mt-5 flex items-center" aria-label="Weekly progression">
//         {Array.from({ length: 7 }, (_, i) => {
//           const done = i < streak;
//           const isToday = i === todayIndex;
//           return (
//             <li key={i} className="flex flex-1 items-center last:flex-none">
//               <div className="flex flex-col items-center gap-1.5">
//                 <motion.span
//                   initial={{ scale: 0.8, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   transition={{ delay: i * 0.04 }}
//                   className={cn(
//                     "grid size-8 place-items-center rounded-full border text-xs font-semibold sm:size-9",
//                     done
//                       ? "border-primary bg-primary text-primary-foreground"
//                       : isToday
//                         ? "border-primary text-foreground"
//                         : "bg-card text-muted-foreground",
//                   )}
//                 >
//                   {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
//                 </motion.span>
//                 <span className="text-[10px] text-muted-foreground sm:text-xs">Day {i + 1}</span>
//               </div>
//               {i < 6 && <div className={cn("mx-1 mb-5 h-0.5 flex-1 rounded", i < streak - 1 ? "bg-primary" : "bg-muted")} />}
//             </li>
//           );
//         })}
//       </ol>
//     </Card>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Check, Flame, TrendingUp, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatMoney } from "@/lib/utils";

const STARTING_BALANCE = 700;
const BALANCE_INCREMENT = 700;
const LOGIN_REWARD = 200;

const DAY = 24 * 60 * 60 * 1000;

const STORAGE_KEYS = {
	balance: "nivvy_balance",
	lastBalanceUpdate: "nivvy_last_balance_update",
	lastLogin: "nivvy_last_login",
	streak: "nivvy_login_streak",
};

type RewardState = {
	balance: number;
	streak: number;
	loggedToday: boolean;
	lastBalanceUpdate: number;
};

const getToday = () => new Date().toISOString().slice(0, 10);

const getInitialState = (): RewardState => {
	if (typeof window === "undefined") {
		return {
			balance: STARTING_BALANCE,
			streak: 0,
			loggedToday: false,
			lastBalanceUpdate: Date.now(),
		};
	}

	const now = Date.now();
	const today = getToday();

	let balance = Number(
		localStorage.getItem(STORAGE_KEYS.balance) ?? STARTING_BALANCE,
	);

	let lastBalanceUpdate = Number(
		localStorage.getItem(STORAGE_KEYS.lastBalanceUpdate) ?? now,
	);

	let streak = Number(localStorage.getItem(STORAGE_KEYS.streak) ?? 0);

	const lastLogin = localStorage.getItem(STORAGE_KEYS.lastLogin);

	/*
	 * ==============================================
	 * ADD ₦700 FOR EVERY COMPLETED 24 HOURS
	 * ==============================================
	 */

	const periodsPassed = Math.floor((now - lastBalanceUpdate) / DAY);

	if (periodsPassed > 0) {
		balance += periodsPassed * BALANCE_INCREMENT;

		lastBalanceUpdate += periodsPassed * DAY;
	}

	/*
	 * ==============================================
	 * DAILY LOGIN REWARD
	 * ==============================================
	 */

	let loggedToday = lastLogin === today;

	if (!loggedToday) {
		if (lastLogin) {
			const previousLogin = new Date(lastLogin);
			const currentDate = new Date(today);

			const daysSinceLogin = Math.floor(
				(currentDate.getTime() - previousLogin.getTime()) / DAY,
			);

			streak = daysSinceLogin === 1 ? streak + 1 : 1;
		} else {
			streak = 1;
		}

		balance += LOGIN_REWARD;
		loggedToday = true;

		localStorage.setItem(STORAGE_KEYS.lastLogin, today);

		localStorage.setItem(STORAGE_KEYS.streak, String(streak));
	}

	/*
	 * ==============================================
	 * SAVE BALANCE
	 * ==============================================
	 */

	localStorage.setItem(STORAGE_KEYS.balance, String(balance));

	localStorage.setItem(
		STORAGE_KEYS.lastBalanceUpdate,
		String(lastBalanceUpdate),
	);

	return {
		balance,
		streak,
		loggedToday,
		lastBalanceUpdate,
	};
};

const getTimeRemaining = (lastBalanceUpdate: number) => {
	const elapsed = Date.now() - lastBalanceUpdate;

	return DAY - (elapsed % DAY);
};

export function DailyLoginCard() {
	/*
	 * Lazy initialization means we DON'T need
	 * setState inside useEffect.
	 */
	const [state, setState] = useState<RewardState>(getInitialState);

	const [timeRemaining, setTimeRemaining] = useState(() =>
		getTimeRemaining(state.lastBalanceUpdate),
	);

	/*
	 * ==============================================
	 * 24-HOUR TIMER
	 * ==============================================
	 */

	useEffect(() => {
		const interval = window.setInterval(() => {
			setTimeRemaining(getTimeRemaining(state.lastBalanceUpdate));
		}, 1000);

		return () => {
			window.clearInterval(interval);
		};
	}, [state.lastBalanceUpdate]);

	/*
	 * ==============================================
	 * CHECK WHEN USER RETURNS TO THE TAB
	 * ==============================================
	 */

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				const freshState = getInitialState();

				setState(freshState);

				setTimeRemaining(getTimeRemaining(freshState.lastBalanceUpdate));
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	const { balance, streak, loggedToday } = state;

	const hours = Math.floor(timeRemaining / (1000 * 60 * 60));

	const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

	const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

	return (
		<div className='grid gap-4 md:grid-cols-2'>
			{/* ==========================================
          BALANCE CARD
          ========================================== */}

			<Card className='overflow-hidden p-5'>
				<div className='flex items-start justify-between gap-4'>
					<div className='flex items-center gap-3'>
						<div className='grid size-11 place-items-center rounded-md bg-navy text-primary'>
							<Wallet className='size-5' />
						</div>

						<div>
							<p className='text-sm text-muted-foreground'>Available Balance</p>

							<motion.p
								key={balance}
								initial={{
									opacity: 0,
									y: 6,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								className='mt-1 font-display text-2xl font-bold'>
								{formatMoney(balance)}
							</motion.p>
						</div>
					</div>

					<div className='flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600'>
						<TrendingUp className='size-3.5' />
						+₦700 / 24h
					</div>
				</div>

				<div className='mt-5 rounded-md bg-muted/60 p-3'>
					<div className='flex items-center justify-between'>
						<span className='text-xs text-muted-foreground'>Next increase</span>

						<span className='tabular text-sm font-semibold'>
							{String(hours).padStart(2, "0")}:
							{String(minutes).padStart(2, "0")}:
							{String(seconds).padStart(2, "0")}
						</span>
					</div>

					<p className='mt-1 text-xs text-muted-foreground'>
						Your balance increases by ₦700 every 24 hours.
					</p>
				</div>
			</Card>

			{/* ==========================================
          DAILY LOGIN CARD
          ========================================== */}

			<Card className='p-5'>
				<div className='flex items-start justify-between gap-3'>
					<div className='flex items-center gap-3'>
						<div className='grid size-11 place-items-center rounded-md bg-navy text-primary'>
							<CalendarCheck className='size-5' />
						</div>

						<div>
							<h2 className='font-display font-semibold'>Daily Login Reward</h2>

							<p className='text-sm text-muted-foreground'>
								Log in daily and earn ₦200.
							</p>
						</div>
					</div>

					<Badge tone={loggedToday ? "success" : "warning"}>
						{loggedToday ? "Claimed today" : "Available"}
					</Badge>
				</div>

				<div className='mt-5 grid grid-cols-2 gap-3'>
					<div className='rounded-md bg-muted/60 p-3'>
						<p className='text-xs text-muted-foreground'>Today&apos;s reward</p>

						<p className='mt-1 tabular font-display text-xl font-semibold'>
							{formatMoney(LOGIN_REWARD)}
						</p>
					</div>

					<div className='rounded-md bg-muted/60 p-3'>
						<p className='text-xs text-muted-foreground'>Current streak</p>

						<p className='mt-1 flex items-center gap-1.5 font-display text-xl font-semibold'>
							<Flame className='size-5 text-primary' />
							{streak} {streak === 1 ? "day" : "days"}
						</p>
					</div>
				</div>

				<ol
					className='mt-5 flex items-center'
					aria-label='Weekly login progression'>
					{Array.from({ length: 7 }, (_, i) => {
						const done = i < streak;

						const isToday = i === Math.min(streak, 6);

						return (
							<li key={i} className='flex flex-1 items-center last:flex-none'>
								<div className='flex flex-col items-center gap-1.5'>
									<motion.span
										initial={{
											scale: 0.8,
											opacity: 0,
										}}
										animate={{
											scale: 1,
											opacity: 1,
										}}
										transition={{
											delay: i * 0.04,
										}}
										className={cn(
											"grid size-8 place-items-center rounded-full border text-xs font-semibold sm:size-9",
											done
												? "border-primary bg-primary text-primary-foreground"
												: isToday
													? "border-primary text-foreground"
													: "bg-card text-muted-foreground",
										)}>
										{done ? (
											<Check className='size-4' strokeWidth={3} />
										) : (
											i + 1
										)}
									</motion.span>

									<span className='text-[10px] text-muted-foreground sm:text-xs'>
										Day {i + 1}
									</span>
								</div>

								{i < 6 && (
									<div
										className={cn(
											"mx-1 mb-5 h-0.5 flex-1 rounded",
											i < streak - 1 ? "bg-primary" : "bg-muted",
										)}
									/>
								)}
							</li>
						);
					})}
				</ol>
			</Card>
		</div>
	);
}
