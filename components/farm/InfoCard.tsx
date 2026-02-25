"use client";

import { useAccount } from "wagmi";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ConnectKitButton } from "@hyper-gate/connectkit";
import { LoaderCircle } from "lucide-react";
import {
	toFormattedPercentage,
	securdFormat,
} from "@/lib/helpers/numberFormat.helpers";
import QuestionMark from "@/assets/icons/question-mark.svg";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useMemo } from "react";
import { useFarmStore } from "@/lib/data/farmStore";
import { Skeleton } from "../ui/skeleton";
import getUserCollateralsInfos from "@/lib/hooks/getUserCollateralsInfos";
import getFarmTotalBalance from "@/lib/hooks/getFarmTotalBalance";
import getFarmTotalLoan from "@/lib/hooks/getFarmTotalLoan";
import getFarmAverageApy from "@/lib/hooks/getFarmAverageApy";
import PercentageFormat from "../utils/PercentageFormat";
import SecurdFormat from "../utils/SecurdFormat";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";

export const Info = ({
	bigIntValue,
	bigIntDecimals,
	value,
	name,
	type = "currency",
	tooltip,
	decimals = 2,
}: {
	bigIntValue?: bigint; // Then value is the price
	bigIntDecimals?: number;
	value?: number;
	name: string;
	type?: "currency" | "percentage" | "multiplier";
	tooltip?: string;
	decimals?: number;
}) => (
	<div className="flex flex-col items-center">
		<h3 className="text-base text-secondary">
			{name.toUpperCase()}
			<Tooltip>
				<TooltipTrigger asChild>
					<Image
						src={QuestionMark}
						alt="question mark"
						className="inline w-4 h-4 -mt-1 ml-1"
					/>
				</TooltipTrigger>
				<TooltipContent>
					<p>{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</h3>
		<div className="text-3xl font-bold">
			{type === "percentage" && <PercentageFormat value={value} />}
			{(type === "currency" || type === "multiplier") && (
				<SecurdFormat
					prefix={
						type === "currency"
							? !bigIntValue
								? "$"
								: ""
							: "\u{00d7}"
					}
					value={
						bigIntValue
							? bigIntToDecimal(bigIntValue, bigIntDecimals ?? 18)
							: value
					}
					decimals={decimals}
				/>
			)}
		</div>
		{typeof bigIntValue === "bigint" && (
			<p className="text-sm text-secondary">${securdFormat(value, 0)}</p>
		)}
	</div>
);

export default function InfoCard() {
	const { status } = useAccount();

	const reservesInfo = useFarmStore.use.reservesInfo();
	const coinPrices = useFarmStore.use.coinPrices();
	const collateralsInfos = useFarmStore.use.collateralsInfos();
	const collateralAmountPrice = useFarmStore.use.collateralAmountPrice();

	const userCollateralsInfos = getUserCollateralsInfos(
		collateralsInfos,
		collateralAmountPrice,
	);

	const totalUserFarmBalance = getFarmTotalBalance(
		userCollateralsInfos,
		collateralAmountPrice,
	);
	const farmTotalLoan = getFarmTotalLoan(
		userCollateralsInfos,
		collateralAmountPrice,
		reservesInfo,
		coinPrices,
	);

	const accountBalanceUSD = useMemo(() => {
		return totalUserFarmBalance - farmTotalLoan;
	}, [totalUserFarmBalance, farmTotalLoan]);

	const averageApy = getFarmAverageApy(
		userCollateralsInfos,
		collateralAmountPrice,
		reservesInfo,
		coinPrices,
	);

	if (
		!reservesInfo ||
		!coinPrices ||
		!collateralsInfos ||
		!collateralAmountPrice
	) {
		return (
			<Skeleton className="w-full rounded-xl h-24 max-w-(--breakpoint-xl) mx-auto" />
		);
	}

	return (
		<>
			{(status === "connected" || status === "reconnecting") && (
				<h2 className="text-xl font-bold text-white mt-4">Summary</h2>
			)}
			<Card className="mt-4 p-4">
				{status === "connected" || status === "reconnecting" ? (
					<div className="flex flex-row justify-evenly">
						<Info
							value={accountBalanceUSD}
							name="balance"
							tooltip="Total value of locked assets backing your loans in all your accounts"
						/>
						<Info
							value={totalUserFarmBalance}
							name="collateral"
							tooltip="Total value of locked assets backing your loans in all your accounts"
						/>
						<Info
							value={farmTotalLoan}
							name="loan"
							tooltip="Total value of loans in all your accounts"
						/>
						<Info
							value={averageApy}
							name="average apy"
							type="percentage"
							tooltip="Current average yield of the position (Collateral - Loan) in all your accounts"
						/>
					</div>
				) : (
					<div className="text-center flex flex-col justify-center gap-4">
						<h3 className="text-lg font-bold">Start Saving</h3>
						<p className="text-base">
							Connect your wallet to start saving today
						</p>
						<ConnectKitButton.Custom>
							{({
								show,
								truncatedAddress,
								ensName,
								isConnecting,
							}) => {
								return (
									<Button
										onClick={show}
										className="mx-auto w-auto text-xl font-bold p-8"
									>
										{isConnecting && (
											<LoaderCircle className="animate-spin" />
										)}
										Connect Wallet
									</Button>
								);
							}}
						</ConnectKitButton.Custom>
					</div>
				)}
			</Card>
		</>
	);
}
