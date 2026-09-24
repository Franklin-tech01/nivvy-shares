"use client";

import { ArrowDownToLine, ArrowUpFromLine, Lock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModals } from "@/components/modals/modals-provider";
import { formatMoney } from "@/lib/utils";

export function BalanceCard({ balance, lockedBonus = 0 }: { balance: number; lockedBonus?: number }) {
	const { openDeposit, openWithdraw } = useModals();
	return (
		<div className='relative overflow-hidden rounded-lg bg-navy p-6 text-navy-foreground shadow-card'>
			<div
				aria-hidden
				className='absolute -right-16 -top-16 size-56 rounded-full border border-white/5'
			/>
			<div
				aria-hidden
				className='absolute -right-4 -top-4 size-36 rounded-full border border-white/5'
			/>
			<p className='flex items-center gap-2 text-sm text-navy-muted'>
				<Wallet className='size-4' /> Total Balance
			</p>
			<p className='tabular mt-3 font-display text-4xl font-semibold tracking-tight'>
				{formatMoney(balance)}
			</p>
			<p className='mt-1 text-xs text-navy-muted'>Available balance</p>
			{lockedBonus > 0 && (
				<p className='mt-3 flex items-start gap-1.5 text-xs text-navy-muted'>
					<Lock className='mt-0.5 size-3 shrink-0 text-primary' />
					<span>
						Includes {formatMoney(lockedBonus)} in bonus money. It can be
						withdrawn after your first share purchase.
					</span>
				</p>
			)}
			<div className='relative mt-6 grid grid-cols-2 gap-3 sm:max-w-xs'>
				<Button onClick={openDeposit}>
					<ArrowDownToLine /> Deposit
				</Button>
				<Button
					onClick={openWithdraw}
					className='border border-white/15 bg-white/5 text-white hover:bg-white/10'
					variant='ghost'>
					<ArrowUpFromLine /> Withdraw
				</Button>
			</div>
		</div>
	);
}
