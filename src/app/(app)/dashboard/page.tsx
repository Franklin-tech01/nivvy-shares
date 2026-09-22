import type { Metadata } from "next";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { DailyLoginCard } from "@/components/dashboard/daily-login-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { HoldingsCard } from "@/components/dashboard/holdings-card";
import { PortfolioCard } from "@/components/dashboard/portfolio-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { WelcomeBonusCard } from "@/components/dashboard/welcome-bonus-card";
import { ErrorNotice } from "@/components/layout/page-header";
import {
	getCurrentUser,
	getHoldings,
	getLoginReward,
	getPortfolio,
	getProfile,
	getWelcomeBonus,
} from "@/lib/data";
import { realEmail } from "@/lib/phone";
import { firstName } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
	const [user, profile, portfolio, holdings, reward, bonus] =
		await Promise.all([
			getCurrentUser(),
			getProfile(),
			getPortfolio(),
			getHoldings(),
			getLoginReward(),
			getWelcomeBonus(),
		]);

	const sharesOwned = holdings.data.reduce((n, h) => n + h.quantity, 0);
	const errors = [profile, portfolio, holdings, reward, bonus]
		.map((r) => r.error)
		.filter(Boolean) as string[];

	return (
		<div className='space-y-6'>
			<DashboardHeader
				name={firstName(profile.data?.full_name, realEmail(user?.email))}
			/>
			{errors.length > 0 && <ErrorNotice message={errors[0]} />}

			<div className='grid gap-4 lg:grid-cols-[1.4fr_1fr]'>
				<BalanceCard balance={portfolio.data?.balance ?? 0} />
				<PortfolioCard
					totalInvestment={portfolio.data?.total_investment ?? 0}
					sharesOwned={sharesOwned}
					portfolioValue={portfolio.data?.total_value ?? 0}
				/>
			</div>

			<QuickActions />

			<HoldingsCard holdings={holdings.data} />

			<div className='grid gap-4 lg:grid-cols-2'>
				<WelcomeBonusCard bonus={bonus.data} />
				<DailyLoginCard reward={reward.data} />
			</div>
		</div>
	);
}
