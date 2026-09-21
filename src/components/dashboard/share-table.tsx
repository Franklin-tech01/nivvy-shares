"use client";

import { ArrowUpRight, Clock3, Gift, TrendingUp, Users } from "lucide-react";

const plans = [
	{
		name: "Nivvy 1",
		price: 3500,
		daily: 900,
		duration: 40,
		total: 36000,
	},
	{
		name: "Nivvy 2",
		price: 5000,
		daily: 1500,
		duration: 40,
		total: 60000,
	},
	{
		name: "Nivvy 3",
		price: 10000,
		daily: 3000,
		duration: 40,
		total: 120000,
	},
	{
		name: "Nivvy 4",
		price: 20000,
		daily: 6000,
		duration: 40,
		total: 240000,
	},
	{
		name: "Nivvy 5",
		price: 30000,
		daily: 9000,
		duration: 40,
		total: 360000,
	},
	{
		name: "Nivvy 6",
		price: 40000,
		daily: 12000,
		duration: 40,
		total: 480000,
	},
	{
		name: "Nivvy 7",
		price: 50000,
		daily: 15000,
		duration: 40,
		total: 600000,
	},
	{
		name: "Nivvy 8",
		price: 80000,
		daily: 24000,
		duration: 40,
		total: 960000,
	},
	{
		name: "Nivvy 9",
		price: 100000,
		daily: 30000,
		duration: 40,
		total: 1200000,
	},
	{
		name: "Nivvy 10",
		price: 200000,
		daily: 60000,
		duration: 40,
		total: 2400000,
	},
	{
		name: "Nivvy 11",
		price: 500000,
		daily: 150000,
		duration: 40,
		total: 6000000,
	},
];

const money = (value: number) => `₦${value.toLocaleString("en-NG")}`;

export default function NivvyPlans() {
	return (
		<section className='w-full space-y-6'>
			{/* HEADER */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<div>
					<div className='mb-2 flex items-center gap-2'>
						<span className='h-1.5 w-1.5 rounded-full bg-[#C9A45C]' />
						<p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#71807A]'>
							Investment marketplace
						</p>
					</div>

					<h2 className='text-2xl font-bold tracking-tight text-[#13201C] sm:text-3xl'>
						Nivvy Investment Plans
					</h2>

					<p className='mt-1 text-sm text-[#7A8581]'>
						Choose a plan that matches your investment goals.
					</p>
				</div>

				<div className='flex items-center gap-2 rounded-full border border-[#DDE7E2] bg-white px-3 py-2 text-xs font-medium text-[#49645B]'>
					<span className='h-2 w-2 rounded-full bg-emerald-500' />
					Plans available
				</div>
			</div>

			{/* QUICK INFO */}
			<div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
				<InfoCard
					icon={<Gift className='h-4 w-4' />}
					label='Welcome bonus'
					value='₦700'
				/>

				<InfoCard
					icon={<Clock3 className='h-4 w-4' />}
					label='Daily login'
					value='₦200'
				/>

				<InfoCard
					icon={<TrendingUp className='h-4 w-4' />}
					label='Income cycle'
					value='24 hours'
				/>

				<InfoCard
					icon={<Users className='h-4 w-4' />}
					label='Referral level 1'
					value='25%'
				/>
			</div>

			{/* PLANS */}
			<div className='overflow-hidden rounded-2xl border border-[#E1E8E5] bg-white shadow-[0_8px_35px_rgba(18,60,54,0.04)]'>
				{/* TABLE HEADER */}
				<div className='hidden grid-cols-[1.4fr_1fr_1fr_0.8fr_1fr_auto] items-center gap-4 border-b border-[#E8EEEB] bg-[#F9FBFA] px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-[#82908B] lg:grid'>
					<span>Plan</span>
					<span>Investment</span>
					<span>Daily income</span>
					<span>Duration</span>
					<span>Total income</span>
					<span />
				</div>

				{/* PLAN LIST */}
				<div className='divide-y divide-[#EDF1EF]'>
					{plans.map((plan, index) => (
						<div
							key={plan.name}
							className='group p-4 transition-colors hover:bg-[#FBFCFC] sm:p-5'>
							<div className='grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_1fr_auto] lg:items-center'>
								{/* PLAN */}
								<div className='flex items-center gap-3'>
									<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#123C36] text-sm font-black text-[#D8B86C]'>
										N
									</div>

									<div>
										<div className='flex items-center gap-2'>
											<p className='text-sm font-bold text-[#17221F]'>
												{plan.name}
											</p>

											{index === 10 && (
												<span className='rounded-full bg-[#F4EBD7] px-2 py-0.5 text-[9px] font-bold text-[#9A762F]'>
													VIP
												</span>
											)}
										</div>

										<p className='mt-0.5 text-[11px] text-[#89938F]'>
											NVVY share
										</p>
									</div>
								</div>

								{/* MOBILE LABELS */}
								<div className='grid grid-cols-2 gap-3 lg:contents'>
									<PlanValue label='Investment' value={money(plan.price)} />

									<PlanValue
										label='Daily income'
										value={money(plan.daily)}
										green
									/>

									<PlanValue
										label='Duration'
										value={`${plan.duration} days`}
										icon={<Clock3 className='h-3.5 w-3.5' />}
									/>

									<PlanValue label='Total income' value={money(plan.total)} />
								</div>

								{/* ACTION */}
								<button
									type='button'
									className='flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#123C36] px-5 text-xs font-bold text-white transition-all hover:bg-[#0C2D28] active:scale-[0.98]'>
									Invest
									<ArrowUpRight className='h-3.5 w-3.5' />
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* BOTTOM INFO */}
			<div className='grid gap-3 sm:grid-cols-3'>
				<BottomInfo title='Minimum withdrawal' value='₦700' />

				<BottomInfo title='Withdrawal charge' value='15%' />

				<BottomInfo title='Referral level 2' value='3%' />
			</div>
		</section>
	);
}

function InfoCard({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className='flex items-center gap-3 rounded-xl border border-[#E2EAE6] bg-white p-3.5'>
			<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EDF5F2] text-[#123C36]'>
				{icon}
			</div>

			<div className='min-w-0'>
				<p className='truncate text-[10px] font-medium text-[#87928E]'>
					{label}
				</p>

				<p className='mt-0.5 text-sm font-bold text-[#17221F]'>{value}</p>
			</div>
		</div>
	);
}

function PlanValue({
	label,
	value,
	green = false,
	icon,
}: {
	label: string;
	value: string;
	green?: boolean;
	icon?: React.ReactNode;
}) {
	return (
		<div className='flex flex-col lg:block'>
			<span className='text-[9px] font-semibold uppercase tracking-wide text-[#9AA39F] lg:hidden'>
				{label}
			</span>

			<span
				className={`mt-0.5 flex items-center gap-1 text-sm font-semibold ${
					green ? "text-[#21845F]" : "text-[#202B27]"
				}`}>
				{icon}
				{value}
			</span>
		</div>
	);
}

function BottomInfo({ title, value }: { title: string; value: string }) {
	return (
		<div className='flex items-center justify-between rounded-xl border border-[#E3EAE7] bg-white px-4 py-3.5'>
			<span className='text-xs text-[#7E8985]'>{title}</span>
			<span className='text-sm font-bold text-[#123C36]'>{value}</span>
		</div>
	);
}
