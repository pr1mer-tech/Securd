"use client";

import Help from "@/components/ui/Help";
import { Slider } from "@/components/ui/slider";
import PercentageFormat from "@/components/utils/PercentageFormat";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import {
	getBorrowerPoolMinCF,
	getLiquidationThresholdForToken,
} from "@/lib/helpers/borrow.helpers";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { cn } from "@/lib/utils";

export default function CollateralFactor() {
	const { collateralFactor, borrowerLt, minCF } = useFarmAddressStore(
		(state) => ({
			collateralFactor: state.collateralFactor(),
			borrowerLt: bigIntToDecimal(
				state.borrowerLt,
				state.collateralInfo?.decimals ?? 0,
			),
			computeLT: state.computeLT(),
			minCF: state.collateralInfo && getBorrowerPoolMinCF(state.collateralInfo),
		}),
	);

	// Check if the values are too close to each other, to avoid an overlap
	const maxValue =
		collateralFactor && Math.max(collateralFactor, borrowerLt ?? 0);
	const distance =
		maxValue && (collateralFactor - (borrowerLt ?? 0)) / maxValue;
	const isTooClose = (distance ?? 0) < 0.2;

	const colorRisk = 100 * ((collateralFactor ?? 0) / (borrowerLt ?? 2) - 1);
	let color: string;
	if (colorRisk && colorRisk <= 10) {
		color = "bg-systemRed";
	} else if (colorRisk && colorRisk <= 25) {
		color = "bg-systemYellow";
	} else {
		color = "bg-systemGreen";
	}

	return (
		<div className="mx-4">
			<Slider
				className="my-8"
				rangeClassName={color}
				min={0}
				max={(maxValue ?? 0) * 100}
				value={
					collateralFactor && borrowerLt
						? [(collateralFactor ?? 0) * 100, (borrowerLt ?? 0) * 100]
						: []
				}
				thumbs={[
					<span
						key={0}
						className={cn(
							"absolute -top-6 w-12 -translate-x-4 text-center z-10",
							isTooClose && "-top-10",
						)}
					>
						CF
						<Help>
							Collateral Factor (Collateral value divided by Loan value)
						</Help>
						{isTooClose && (
							<div className="absolute top-5 left-1/2 w-0 h-1/4 border border-dashed border-gray-500 -z-10" />
						)}
						<PercentageFormat
							value={collateralFactor}
							className={isTooClose ? "mt-10" : "mt-6"}
							description={"CF:"}
						/>
					</span>,
					<span
						key={1}
						className="absolute -top-6 w-12 -translate-x-4 text-center"
					>
						LT
						<Help>
							Liquidation Threshold (Minimum Collateral Factor before your
							collateral is liquidated)
						</Help>
						{isTooClose && (
							<div className="absolute top-1/2 left-1/2 w-0 h-1/4 border border-dashed border-gray-500" />
						)}
						<PercentageFormat
							value={borrowerLt}
							className={isTooClose ? "mt-10" : "mt-6"}
							description={"LT:"}
						/>
					</span>,
				]}
			/>
		</div>
	);
}
