"use client";

import { Card } from "@/components/ui/card";
import { MenuTabsContent } from "@/components/ui/menu-tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import PercentageFormat from "@/components/utils/PercentageFormat";
import { useAnalyticsAddressStore } from "@/lib/data/analyticsAddressStore";
import type { PoolDetails } from "@/lib/helpers/analytics.helper";
import { cn } from "@/lib/utils";

export default function Other({
	poolInfo,
	className,
}: { poolInfo: PoolDetails; className?: string }) {
	const timeRange = useAnalyticsAddressStore.use.timeRange();
	const leverage = useAnalyticsAddressStore.use.leverage();

	const lastAnalytics =
		poolInfo?.analytics?.[poolInfo?.analytics?.length - 1] ?? null;

	let lpApy = lastAnalytics?.[`lp_apy_${timeRange}`] ?? 0;
	let holdApy = lastAnalytics?.[`hold_apy_${timeRange}`] ?? 0;
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
	feeApy = (1 + leverage * perfFee) ** annualization - 1;
	ilApy = (1 + leverage * perfIl) ** annualization - 1;
	const irApy = (1 + (leverage - 1) * perfIR) ** annualization - 1;

	return (
		<MenuTabsContent value="apy">
			<Card className={cn("p-4 w-full", className)}>
				<Table className="text-center">
					<TableHeader>
						<TableRow>
							<TableHead className="font-bold pl-0 text-center border-r">
								Fee APY
							</TableHead>
							<TableCell className="font-bold text-center">
								<PercentageFormat value={feeApy} />
							</TableCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableHead className="font-bold pl-0 text-center border-r">
								IL APY
							</TableHead>
							<TableCell className="font-bold text-center">
								<PercentageFormat value={ilApy} />
							</TableCell>
						</TableRow>
						<TableRow>
							<TableHead className="font-bold pl-0 text-center border-r">
								IR APY
							</TableHead>
							<TableCell className="font-bold text-center">
								<PercentageFormat value={irApy} />
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</Card>
		</MenuTabsContent>
	);
}
