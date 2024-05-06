"use client";

import { Card } from "@/components/ui/card";
import { MenuTabsContent } from "@/components/ui/menu-tabs";
import { useAnalyticsAddressStore } from "@/lib/data/analyticsAddressStore";
import {
	type PoolDetails,
	PoolTableRows,
} from "@/lib/helpers/analytics.helper";
import * as SelectPrimitive from "@radix-ui/react-select";
import { securdFormat } from "@/lib/helpers/numberFormat.helpers";
import { AreaChart, Color } from "@tremor/react";
import { customTooltip } from "./TremorTooltip";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const dataFormatter = (number: number) => `$${securdFormat(number, 2)}`;

// toReverse Polyfill
Array.prototype.toReversed = function () {
	return this.slice().reverse();
};

const formatDate = (date: Date | null) =>
	date?.toLocaleDateString("en-US", { month: "long", day: "numeric" });

export default function Graphs({
	poolInfo,
	className,
}: { poolInfo: PoolDetails; className?: string }) {
	const timeRange = useAnalyticsAddressStore.use.timeRange();
	const leverage = useAnalyticsAddressStore.use.leverage();
	const tokenDirection = useAnalyticsAddressStore.use.tokenDirection();
	const [selected, setSelected] = useState<string>("symbol");
	const [selected2, setSelected2] = useState<string>("lp");
	// Compute date from timeRange
	const limitDate = new Date();
	switch (timeRange) {
		case "1m":
			limitDate.setMonth(limitDate.getMonth() - 1);
			break;
		case "3m":
			limitDate.setMonth(limitDate.getMonth() - 3);
			break;
		case "1y":
			limitDate.setFullYear(limitDate.getFullYear() - 1);
			break;
	}

	const symbol = !tokenDirection
		? `${poolInfo?.token_1?.token_symbol} / ${poolInfo?.token_0?.token_symbol}`
		: `${poolInfo?.token_0?.token_symbol} / ${poolInfo?.token_1?.token_symbol}`;

	const symbol0 = !tokenDirection
		? poolInfo?.token_1?.token_symbol
		: poolInfo?.token_0?.token_symbol;
	const symbol1 = !tokenDirection
		? poolInfo?.token_0?.token_symbol
		: poolInfo?.token_1?.token_symbol;

	return (
		<Card className="w-full pl-1 pr-4">
			<MenuTabsContent value="pool">
				<div className="flex items-center justify-end py-2">
					<ol className="tremor-Legend-root relative overflow-hidden">
						<div className="h-full flex flex-wrap">
							<li className="tremor-Legend-legendItem group inline-flex items-center px-2 py-0.5 rounded-tremor-small transition whitespace-nowrap cursor-default text-tremor-content dark:text-dark-tremor-content">
								<svg
									className="flex-none h-2 w-2 mr-1.5 text-[#E8A029] opacity-100"
									fill="currentColor"
									viewBox="0 0 8 8"
								>
									<circle cx="4" cy="4" r="4" />
								</svg>
								<Select value={selected} onValueChange={(v) => setSelected(v)}>
									<SelectPrimitive.Trigger asChild>
										<span className="cursor-pointer">
											<SelectValue
												placeholder="Price"
												className="whitespace-nowrap truncate text-tremor-default text-tremor-content dark:text-dark-tremor-content opacity-100"
											/>
											<SelectPrimitive.Icon asChild>
												<ChevronDown className="h-4 w-4 ml-1 opacity-50 inline" />
											</SelectPrimitive.Icon>
										</span>
									</SelectPrimitive.Trigger>
									<SelectContent>
										<SelectItem value="symbol">
											{symbol0} price in {symbol1}
										</SelectItem>
										<SelectItem value="dollar">{symbol0} price in $</SelectItem>
									</SelectContent>
								</Select>
							</li>
						</div>
					</ol>
				</div>
				<AreaChart
					className="h-60"
					colors={["#E8A029"]}
					autoMinValue
					data={
						poolInfo?.analytics
							?.filter((info) => info.date && info.date >= limitDate)
							.map((info) => ({
								date: formatDate(info.date),
								[`${symbol0} price in $`]: tokenDirection
									? poolInfo?.token_0?.prices?.find(
											(price) =>
												price.date?.toDateString() ===
												info.date?.toDateString(),
										)?.price ?? 0
									: poolInfo?.token_1?.prices?.find(
											(price) =>
												price.date?.toDateString() ===
												info.date?.toDateString(),
										)?.price ?? 0,
								[`${symbol0} price in ${symbol1}`]: tokenDirection
									? (info.quantity_token_1 ?? 0) / (info.quantity_token_0 ?? 0)
									: (info.quantity_token_0 ?? 0) / (info.quantity_token_1 ?? 0),
							})) ?? []
					}
					index="date"
					categories={[
						selected === "symbol"
							? `${symbol0} price in ${symbol1}`
							: `${symbol0} price in $`,
					]}
					valueFormatter={(number: number) =>
						`${selected === "dollar" ? "$" : ""}${securdFormat(number, 2)}${
							selected === "symbol" ? symbol.split("/")[1] : ""
						}`
					}
					yAxisWidth={selected === "symbol" ? 130 : 90}
					showLegend={false}
				/>
				<div className="flex items-center justify-end py-2">
					<ol className="tremor-Legend-root relative overflow-hidden">
						<div className="h-full flex flex-wrap">
							<li className="tremor-Legend-legendItem group inline-flex items-center px-2 py-0.5 rounded-tremor-small transition whitespace-nowrap cursor-default text-tremor-content dark:text-dark-tremor-content">
								<svg
									className="flex-none h-2 w-2 mr-1.5 text-[#0B4B48] opacity-100"
									fill="currentColor"
									viewBox="0 0 8 8"
								>
									<circle cx="4" cy="4" r="4" />
								</svg>
								<Select value={selected} onValueChange={(v) => setSelected(v)}>
									<SelectPrimitive.Trigger asChild>
										<span className="cursor-pointer">
											<SelectValue
												placeholder="Price"
												className="whitespace-nowrap truncate text-tremor-default text-tremor-content dark:text-dark-tremor-content opacity-100"
											/>
											<SelectPrimitive.Icon asChild>
												<ChevronDown className="h-4 w-4 ml-1 opacity-50 inline" />
											</SelectPrimitive.Icon>
										</span>
									</SelectPrimitive.Trigger>
									<SelectContent>
										<SelectItem value="symbol">
											Volume in {symbol.split("/")[1]}
										</SelectItem>
										<SelectItem value="dollar">Volume in $</SelectItem>
									</SelectContent>
								</Select>
							</li>
						</div>
					</ol>
				</div>
				<AreaChart
					className="h-60"
					data={
						poolInfo?.analytics
							?.filter((info) => info.date && info.date >= limitDate)
							.map((info) => ({
								date: formatDate(info.date),
								[`Volume in ${symbol.split("/")[1]}`]: tokenDirection
									? info.volume_token_1 ?? 0
									: info.volume_token_0 ?? 0,
							}))
							.map((info, idx) => ({
								...info,
								"Volume in $":
									((info[`Volume in ${symbol.split("/")[1]}`] as number) ?? 0) *
									(tokenDirection
										? poolInfo?.token_1?.prices?.[idx]?.price ?? 0
										: poolInfo?.token_0?.prices?.[idx]?.price ?? 0),
							})) ?? []
					}
					colors={["#0B4B48"]}
					index="date"
					categories={[
						selected === "symbol"
							? `Volume in ${symbol.split("/")[1]}`
							: "Volume in $",
					]}
					valueFormatter={(number: number) =>
						`${selected === "dollar" ? "$" : ""}${securdFormat(number, 2)}${
							selected === "symbol" ? symbol.split("/")[1] : ""
						}`
					}
					yAxisWidth={selected === "symbol" ? 130 : 90}
					curveType="step"
					showLegend={false}
				/>
			</MenuTabsContent>
			<MenuTabsContent value="apy">
				<div className="flex items-center justify-end py-2">
					<ol className="tremor-Legend-root relative overflow-hidden">
						<div className="h-full flex flex-wrap">
							<li className="tremor-Legend-legendItem group inline-flex items-center px-2 py-0.5 rounded-tremor-small transition whitespace-nowrap cursor-default text-tremor-content dark:text-dark-tremor-content">
								<Select
									value={selected2}
									onValueChange={(v) => setSelected2(v)}
								>
									<SelectPrimitive.Trigger asChild>
										<span className="cursor-pointer">
											<SelectValue
												placeholder="Price"
												className="whitespace-nowrap truncate text-tremor-default text-tremor-content dark:text-dark-tremor-content opacity-100"
											/>
											<SelectPrimitive.Icon asChild>
												<ChevronDown className="h-4 w-4 ml-1 opacity-50 inline" />
											</SelectPrimitive.Icon>
										</span>
									</SelectPrimitive.Trigger>
									<SelectContent>
										<SelectItem value="lp">
											<svg
												className="flex-none inline h-2 w-2 mr-1.5 text-[#0B4B48] opacity-100"
												fill="currentColor"
												viewBox="0 0 8 8"
											>
												<circle cx="4" cy="4" r="4" />
											</svg>
											LP
											<svg
												className="flex-none inline h-2 w-2 mr-1.5 ml-2 text-[#E95A4C] opacity-100"
												fill="currentColor"
												viewBox="0 0 8 8"
											>
												<circle cx="4" cy="4" r="4" />
											</svg>
											Hold
										</SelectItem>
										<SelectItem value="hold">
											<svg
												className="flex-none inline h-2 w-2 mr-1.5 text-[#fcd34d] opacity-100"
												fill="currentColor"
												viewBox="0 0 8 8"
											>
												<circle cx="4" cy="4" r="4" />
											</svg>
											LP vs Hold
										</SelectItem>
									</SelectContent>
								</Select>
							</li>
						</div>
					</ol>
				</div>
				<AreaChart
					className="h-60"
					showLegend={false}
					colors={selected2 === "lp" ? ["#0B4B48", "#E95A4C"] : ["#FCD34D"]}
					autoMinValue
					data={LP_HODL({ poolInfo, limitDate, leverage })}
					index="date"
					categories={selected2 === "lp" ? ["LP", "HOLD"] : ["LP vs Hold"]}
					valueFormatter={dataFormatter}
					yAxisWidth={90}
					customTooltip={selected2 === "lp" ? customTooltip : undefined}
				/>
				<AreaChart
					className="h-60"
					colors={["#E95A4C", "#0B4B48", "#E8A029"]}
					autoMinValue
					data={LP_HODL({ poolInfo, limitDate, leverage })}
					index="date"
					categories={["Fee", "IL", "Interest"]}
					valueFormatter={(number) => `$${securdFormat(number, 2)}`}
					yAxisWidth={90}
				/>
			</MenuTabsContent>
		</Card>
	);
}

function LP_HODL({
	poolInfo,
	limitDate,
	leverage,
}: { poolInfo: PoolDetails; limitDate: Date; leverage: number }) {
	// Delay is in days
	const delay = poolInfo?.analytics?.length ?? 30;
	// Pour l'instant on suppose que le taux est constant pendant toute la période
	// ce qui pourra évoluer si on souhaite considerer l'évolution du taux pendant la période
	const r_0 = 5 / 100;
	const r_1 = 1 / 100;

	// Moyenne sur les deux taux(Uni V2 on emprunte la même "valeur" de token 0 / 1)
	const r = 0.5 * (r_0 + r_1);

	// montant initial
	const amount = 100;

	// fees du dex
	const fees = Number(poolInfo?.pool_fee ?? "0.3");
	// les liquidity providers ne récupère que 2 / 3 des fees, le reste est pour le protocole
	const adj_fees = 2 / 3;
	// donc il faut faire fees * adj_fees(il faut que j'intègre adj_fees dans la db,
	// pour l'instant nous n'avons que fees)

	let plp: number[] =
		poolInfo?.analytics?.map((analytic, i) => {
			const qToken0 =
				(analytic?.quantity_token_0 ?? 0) / (analytic?.quantity_token_lp ?? 0);
			const qToken1 =
				(analytic?.quantity_token_1 ?? 0) / (analytic?.quantity_token_lp ?? 0);

			const price0 = poolInfo?.token_0?.prices?.[i]?.price ?? 0;
			const price1 = poolInfo?.token_1?.prices?.[i]?.price ?? 0;

			const plp = qToken0 * price0 + qToken1 * price1;
			return plp;
		}) ?? [];

	const qty = amount / plp[0];
	plp = plp.map((val) => qty * val);

	const totalVolume =
		poolInfo?.analytics?.map((info, i) => {
			const price0 = poolInfo.token_0?.prices?.[i]?.price;

			return (info.volume_token_0 ?? 0) * (price0 ?? 0);
		}) ?? [];

	let _fees: number[] = totalVolume
		.slice(1)
		.map(
			(val, i) =>
				(val * fees * adj_fees * qty) /
				100 /
				(poolInfo?.analytics?.[i]?.quantity_token_lp ?? 0),
		);
	_fees = [0.0, ..._fees];
	_fees = _fees.reduce((acc, val) => {
		acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + val);
		return acc;
	}, [] as number[]);

	const hold: number[] =
		poolInfo?.analytics?.map((info, i) => {
			const qToken0 =
				(poolInfo?.analytics?.[0]?.quantity_token_0 ?? 0) /
				(poolInfo?.analytics?.[0]?.quantity_token_lp ?? 0);
			const qToken1 =
				(poolInfo?.analytics?.[0]?.quantity_token_1 ?? 0) /
				(poolInfo?.analytics?.[0]?.quantity_token_lp ?? 0);

			const price0 = poolInfo.token_0?.prices?.[i]?.price;
			const price1 = poolInfo.token_1?.prices?.[i]?.price;

			return qty * (qToken0 * (price0 ?? 0) + qToken1 * (price1 ?? 0));
		}) ?? [];

	const il = hold.map((val, i) => Math.min(plp[i] - _fees[i] - val, 0));

	const interest = Array.from(
		{ length: delay },
		(_, i) => (-amount * r * i) / 365,
	);
	const infos =
		poolInfo?.analytics?.filter(
			(info) => info.date && info.date >= limitDate,
		) ?? [];

	const L = leverage ?? 1;

	return infos.map((info, i) => ({
		date: formatDate(info.date),
		LP: hold[i] + L * _fees[i] + L * il[i] - (L - 1) * interest[i],
		HOLD: hold[i],
		"LP vs Hold": L * _fees[i] + L * il[i] - (L - 1) * interest[i],
		// Inverse all the values
		IL: L * il[i],
		Interest: (L - 1) * interest[i],
		Fee: L * _fees[i],
	}));
}
