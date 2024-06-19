"use client";

import { Badge } from "@/components/ui/badge";
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
	const leverage = useAnalyticsAddressStore.use.leverage();

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

	let lpApy = lastAnalytics?.[`lp_apy_${timeRange}`] ?? 0;
	const holdApy = lastAnalytics?.[`hold_apy_${timeRange}`] ?? 0;
	let feeApy = lastAnalytics?.[`fee_apy_${timeRange}`] ?? 0;
	let ilApy = lastAnalytics?.[`il_apy_${timeRange}`] ?? 0;

	const delay = (() => {
		switch (timeRange) {
			case "1m":
				return 30;
			case "3m":
				return 90;
			case "1y":
				return 365;
			default:
				return 0;
		}
	})();

	const annualization = 365 / delay;

	const perfHold = (1 + holdApy) ** (1 / annualization) - 1;
	const perfFee = (1 + feeApy) ** (1 / annualization) - 1;
	const perfIl = (1 + ilApy) ** (1 / annualization) - 1;

	const r_0 = 5 / 100;
	const r_1 = 1 / 100;

	const r = 0.5 * (r_0 + r_1);
	const perfIR = (-r * delay) / 365;

	lpApy =
		(1 +
			perfHold +
			leverage * perfFee +
			leverage * perfIl +
			(leverage - 1) * perfIR) **
			annualization -
		1;

	const lpVsHoldApy =
		(1 + leverage * perfFee + leverage * perfIl + (leverage - 1) * perfIR) **
			annualization -
		1;

	feeApy = (1 + leverage * perfFee) ** annualization - 1;
	ilApy = (1 + leverage * perfIl) ** annualization - 1;
	const irApy = (1 + (leverage - 1) * perfIR) ** annualization - 1;

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
							value={!tokenDirection ? qToken0 : qToken1}
							suffix={
								!tokenDirection
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
								(!tokenDirection
									? lastAnalytics?.volume_token_0
									: lastAnalytics?.volume_token_1) ?? undefined
							}
							suffix={
								!tokenDirection
									? poolInfo?.token_0?.token_symbol
									: poolInfo?.token_1?.token_symbol
							}
						/>
						<SecurdFormat
							className="block mx-auto text-sm text-secondary"
							prefix="$"
							value={
								((!tokenDirection
									? lastAnalytics?.volume_token_1
									: lastAnalytics?.volume_token_0) ?? 0) *
								(!tokenDirection
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
											((!tokenDirection
												? curr.volume_token_0
												: curr.volume_token_1) ?? 0),
										0,
									) ?? 0
							}
							suffix={
								!tokenDirection
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
											((!tokenDirection
												? curr.volume_token_1
												: curr.volume_token_0) ?? 0),
										0,
									) ?? 0) *
								(!tokenDirection
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
						<PercentageFormat value={lpApy} />
					</div>
					<div className="text-center">
						<h2 className="text-xl font-bold">LP vs Hold APY</h2>
						<PercentageFormat value={lpVsHoldApy} />
					</div>
					<div className="text-center">
						<h2 className="text-xl font-bold">Hold APY</h2>
						<PercentageFormat value={holdApy} />
					</div>
					<Badge className="hover:text-white hover:bg-primary">
						&times;{leverage}
					</Badge>
				</div>
			</MenuTabsContent>
		</Card>
	);
}
