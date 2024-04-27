"use client";

import { Card } from "@/components/ui/card";
import {
	MenuTabs,
	MenuTabsContent,
	MenuTabsList,
	MenuTabsTrigger,
} from "@/components/ui/menu-tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PercentageFormat from "@/components/utils/PercentageFormat";
import SecurdFormat from "@/components/utils/SecurdFormat";
import { useAnalyticsAddressStore } from "@/lib/data/analyticsAddressStore";
import {
	type PoolDetails,
	PoolTableRows,
} from "@/lib/helpers/analytics.helper";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { useState } from "react";

export default function QuickView({
	poolInfo,
	className,
}: { poolInfo: PoolDetails; className?: string }) {
	const timeRange = useAnalyticsAddressStore.use.timeRange();
	const tokenDirection = useAnalyticsAddressStore.use.tokenDirection();

	const lastAnalytics =
		poolInfo?.analytics?.[poolInfo?.analytics?.length - 1] ?? null;

	const handlePriceClick = () => {
		useAnalyticsAddressStore.setState({ tokenDirection: !tokenDirection });
	};

	const qToken0 = lastAnalytics?.quantity_token_0 ?? 0;
	const qToken1 = lastAnalytics?.quantity_token_1 ?? 0;

	const tvlDollars =
		qToken0 *
			(poolInfo?.token_0?.prices?.[poolInfo?.token_0?.prices?.length - 1]
				?.price ?? 0) ??
		0 +
			qToken1 *
				(poolInfo?.token_1?.prices?.[poolInfo?.token_1?.prices?.length - 1]
					?.price ?? 0) ??
		0;

	return (
		<Card className="p-4">
			<div className="flex justify-between">
				<MenuTabsList className="h-[3.25rem]">
					<MenuTabsTrigger value="pool" className="p-6">
						Pool
					</MenuTabsTrigger>
					<MenuTabsTrigger value="apy" className="p-6">
						APY
					</MenuTabsTrigger>
				</MenuTabsList>

				<Tabs
					value={timeRange}
					onValueChange={(value) =>
						useAnalyticsAddressStore.setState({
							timeRange: value as "1m" | "3m" | "1y",
						})
					}
				>
					<TabsList>
						<TabsTrigger value="1m">1m</TabsTrigger>
						<TabsTrigger value="3m">3m</TabsTrigger>
						<TabsTrigger value="1y">1y</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			<MenuTabsContent value="pool" className="flex flex-row items-center">
				<div className="flex flex-row justify-evenly items-center w-full mt-8">
					<div
						className="text-center cursor-pointer select-none"
						onClick={handlePriceClick}
					>
						<h2 className="text-xl font-bold">
							Price{" "}
							{tokenDirection
								? poolInfo?.token_0?.token_symbol
								: poolInfo?.token_1?.token_symbol}{" "}
							/{" "}
							{tokenDirection
								? poolInfo?.token_1?.token_symbol
								: poolInfo?.token_0?.token_symbol}
						</h2>
						<SecurdFormat
							className="font-semibold"
							value={
								tokenDirection
									? (lastAnalytics?.quantity_token_1 ?? 0) /
										(lastAnalytics?.quantity_token_0 ?? 0)
									: (lastAnalytics?.quantity_token_0 ?? 0) /
										(lastAnalytics?.quantity_token_1 ?? 0)
							}
						/>
						<SecurdFormat
							prefix="$"
							className="block mx-auto text-sm text-secondary"
							value={
								tokenDirection
									? poolInfo?.token_0?.prices?.[
											poolInfo?.token_0?.prices?.length - 1
										]?.price ?? 0
									: poolInfo?.token_1?.prices?.[
											poolInfo?.token_1?.prices?.length - 1
										]?.price ?? 0
							}
						/>
					</div>
					<div className="text-center">
						<h2 className="text-xl font-bold">TVL</h2>
						<SecurdFormat
							className="font-semibold"
							value={tokenDirection ? qToken0 : qToken1}
							suffix={
								tokenDirection
									? poolInfo?.token_0?.token_symbol
									: poolInfo?.token_1?.token_symbol
							}
						/>
						<SecurdFormat
							className="block mx-auto text-sm text-secondary"
							value={tvlDollars}
							prefix="$"
						/>
					</div>
					<div className="text-center">
						<h2 className="text-xl font-bold">Volume (24h)</h2>
						<SecurdFormat
							className="font-semibold"
							value={
								(tokenDirection
									? lastAnalytics?.volume_token_1
									: lastAnalytics?.volume_token_0) ?? undefined
							}
							suffix={
								tokenDirection
									? poolInfo?.token_0?.token_symbol
									: poolInfo?.token_1?.token_symbol
							}
						/>
						<SecurdFormat
							className="block mx-auto text-sm text-secondary"
							prefix="$"
							value={
								((tokenDirection
									? lastAnalytics?.volume_token_1
									: lastAnalytics?.volume_token_0) ?? 0) *
								(tokenDirection
									? poolInfo?.token_1?.prices?.[
											poolInfo?.token_1?.prices?.length - 1
										]?.price ?? 0
									: poolInfo?.token_0?.prices?.[
											poolInfo?.token_0?.prices?.length - 1
										]?.price ?? 0)
							}
						/>
					</div>
					<div className="text-center">
						<h2 className="text-xl font-bold">Volume (7d)</h2>
						<SecurdFormat
							className="font-semibold"
							value={
								poolInfo?.analytics
									?.slice(
										poolInfo?.analytics?.length - 8,
										poolInfo?.analytics?.length - 1,
									)
									.reduce(
										(acc, curr) =>
											acc +
											((tokenDirection
												? curr.volume_token_0
												: curr.volume_token_1) ?? 0),
										0,
									) ?? 0
							}
							suffix={
								tokenDirection
									? poolInfo?.token_0?.token_symbol
									: poolInfo?.token_1?.token_symbol
							}
						/>
						<SecurdFormat
							className="block mx-auto text-sm text-secondary"
							prefix="$"
							value={
								(poolInfo?.analytics
									?.slice(
										poolInfo?.analytics?.length - 8,
										poolInfo?.analytics?.length - 1,
									)
									.reduce(
										(acc, curr) =>
											acc +
											((tokenDirection
												? curr.volume_token_1
												: curr.volume_token_0) ?? 0),
										0,
									) ?? 0) *
								(tokenDirection
									? poolInfo?.token_1?.prices?.[
											poolInfo?.token_1?.prices?.length - 1
										]?.price ?? 0
									: poolInfo?.token_0?.prices?.[
											poolInfo?.token_0?.prices?.length - 1
										]?.price ?? 0)
							}
						/>
					</div>
				</div>
			</MenuTabsContent>
			<MenuTabsContent value="apy" className="flex flex-row items-center">
				<div className="flex flex-row justify-evenly items-center w-full mt-8">
					<div className="text-center">
						<h2 className="text-xl font-bold">LP APY</h2>
						<PercentageFormat
							value={lastAnalytics?.[`lp_apy_${timeRange}`] ?? undefined}
						/>
					</div>
					<div className="text-center">
						<h2 className="text-xl font-bold">LP vs Hold APY</h2>
						<PercentageFormat
							value={
								lastAnalytics?.[`lp_vs_hold_apy_${timeRange}`] ?? undefined
							}
						/>
					</div>
					<div className="text-center">
						<h2 className="text-xl font-bold">Fee APY</h2>
						<PercentageFormat
							value={lastAnalytics?.[`fee_apy_${timeRange}`] ?? undefined}
						/>
					</div>
					<div className="text-center">
						<h2 className="text-xl font-bold">IL APY</h2>
						<PercentageFormat
							value={lastAnalytics?.[`il_apy_${timeRange}`] ?? undefined}
						/>
					</div>
					<div className="text-center">
						<h2 className="text-xl font-bold">Hold APY</h2>
						<PercentageFormat
							value={lastAnalytics?.[`hold_apy_${timeRange}`] ?? undefined}
						/>
					</div>
				</div>
			</MenuTabsContent>
		</Card>
	);
}
