"use client";

import Help from "@/components/ui/Help";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	MenuTabs,
	MenuTabsList,
	MenuTabsTrigger,
} from "@/components/ui/menu-tabs";
import { Slider } from "@/components/ui/slider";
import PercentageFormat from "@/components/utils/PercentageFormat";
import SecurdFormat from "@/components/utils/SecurdFormat";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { Separator } from "@radix-ui/react-separator";
import { useEffect, useState } from "react";
import { Address, formatUnits, parseUnits } from "viem";
import PairIcon from "../../PairIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useConfig, useReadContract } from "wagmi";
import { useValueEffect } from "@/lib/hooks/pipelines/useValueEffect";
import {
	type CollateralPipelineState,
	lockPipelineState,
} from "@/lib/hooks/pipelines/CollateralPipelineState";
import { lock } from "@/lib/hooks/pipelines/lock";
import { withdraw } from "@/lib/hooks/pipelines/withdrawFarm";
import { borrowerDataContract } from "@/lib/constants/wagmiConfig/wagmiConfig";

export default function Collateral() {
	const collateralInfo = useFarmAddressStore.use.collateralInfo?.();
	const collateralAmountPrice =
		useFarmAddressStore.use.collateralAmountPrice?.();
	const collateralProportions =
		useFarmAddressStore.use.collateralProportions?.();
	const reservesInfo = useFarmAddressStore.use.reservesInfo?.();
	const userBalance = useFarmAddressStore.use.userBalance?.();
	const proportions = useFarmAddressStore.use.collateralProportions?.();

	const [menu, setMenu] = useState<"lock" | "release">("lock");
	const [amount, setAmount] = useState<bigint>(0n);
	const [amountInput, setAmountInput] = useState<string>("");
	const resetInput = () => {
		setAmount(0n);
		setAmountInput("");
	};

	const config = useConfig();
	const [pipeline, nextStep, resetPipeline, setPipeline] =
		useValueEffect<CollateralPipelineState>(lockPipelineState);
	const { address } = useAccount();

	const { data: maxRelease, error } = useReadContract({
		account: address,
		...borrowerDataContract,
		functionName: "getMaxRelease",
		args: [address as Address, collateralInfo?.addressLP as Address],
		query: {
			enabled: !!address && !!collateralInfo?.addressLP,
			refetchInterval: 10000,
		},
	});

	useEffect(() => {
		if (collateralInfo && collateralAmountPrice) {
			const price = bigIntToDecimal(
				proportions?.collateralPrice,
				collateralInfo.decimals,
			);
			setPipeline(
				menu === "lock"
					? lock(
							config,
							collateralInfo,
							amount,
							price ?? 0,
							collateralAmountPrice.collateralAmount ?? 0n,
							userBalance ?? 0n,
							resetInput,
						)
					: withdraw(
							config,
							collateralInfo,
							amount,
							price ?? 0,
							collateralAmountPrice.collateralAmount ?? 0n,
							userBalance ?? 0n,
							resetInput,
						),
			);
		}
	}, [config, amount, menu, setPipeline, collateralInfo, collateralAmountPrice, userBalance, proportions?.collateralPrice]);

	const sliderBase =
		menu === "lock"
			? userBalance
			: maxRelease ?? collateralAmountPrice?.collateralAmount;

	return (
		<div className="flex flex-col gap-2 w-full">
			<div className="flex flex-row justify-between items-center w-full h-10">
				<h2 className="text-2xl font-bold text-primary">Collateral</h2>
				{collateralInfo ? (
					<PairIcon
						reservesInfo={reservesInfo}
						userCollateralsInfo={collateralInfo}
						size="small"
						className="w-36"
					/>
				) : (
					<Skeleton className="w-8 h-6" />
				)}
			</div>
			<Separator />
			<div className="flex flex-row justify-between items-center w-full">
				<MenuTabs
					value={menu}
					onValueChange={(value) => {
						setMenu(value as "lock" | "release");
						resetInput();
					}}
				>
					<MenuTabsList className="h-[3.25rem]">
						<MenuTabsTrigger value="lock" className="p-6">
							Lock
						</MenuTabsTrigger>
						<MenuTabsTrigger value="release" className="p-6">
							Release
						</MenuTabsTrigger>
					</MenuTabsList>
				</MenuTabs>
				{menu === "lock" ? (
					<div className="text-md">
						Wallet Balance
						<Help>Amount of this asset in your wallet</Help>
						<div className="inline-flex flex-col items-end">
							<SecurdFormat
								className="text-xl font-bold inline ml-2"
								value={bigIntToDecimal(userBalance, collateralInfo?.decimals)}
							/>
							<SecurdFormat
								className="text-sm inline text-secondary"
								value={bigIntToDecimal(
									(userBalance ?? 0n) *
										(collateralProportions?.collateralPrice ?? 0n),
									(collateralInfo?.decimals ?? 18) * 2,
								)}
								prefix="$"
								decimals={0}
							/>
						</div>
						{collateralInfo ? (
							<PairIcon
								reservesInfo={reservesInfo}
								userCollateralsInfo={collateralInfo}
								size="small"
								symbol={false}
								className="translate-y-[0.375rem] ml-1"
							/>
						) : (
							<Skeleton className="w-8 h-6" />
						)}
					</div>
				) : (
					<div className="text-md">
						Max Release
						<Help>
							Max amount of collateral you can release from your wallet
						</Help>
						<div className="inline-flex flex-col items-end">
							<SecurdFormat
								className="text-xl font-bold inline ml-2"
								value={bigIntToDecimal(maxRelease, collateralInfo?.decimals)}
							/>
							<SecurdFormat
								className="text-sm inline text-secondary"
								value={bigIntToDecimal(
									(proportions?.collateralPrice ?? 0n) * (maxRelease ?? 0n),
									(collateralInfo?.decimals ?? 18) * 2,
								)}
								prefix="$"
								decimals={0}
							/>
						</div>
						{collateralInfo ? (
							<PairIcon
								reservesInfo={reservesInfo}
								userCollateralsInfo={collateralInfo}
								size="small"
								symbol={false}
								className="translate-y-[0.375rem] ml-1"
							/>
						) : (
							<Skeleton className="w-8 h-6" />
						)}
					</div>
				)}
			</div>
			<div className="flex flex-row gap-4 mt-4">
				<div className="relative flex items-center w-full">
					<div className="absolute left-0 flex flex-row items-center justify-evenly border w-24 h-full bg-muted rounded-l-md">
						{collateralInfo ? (
							<PairIcon
								reservesInfo={reservesInfo}
								userCollateralsInfo={collateralInfo}
								size="small"
								symbol={false}
							/>
						) : (
							<Skeleton className="w-8 h-6" />
						)}
					</div>
					<Input
						placeholder="Amount"
						type="number"
						className="pl-28 h-12"
						value={amountInput}
						onChange={(e) => {
							setAmountInput(e.target.value);
							setAmount(
								parseUnits(
									Number(e.target.value).toString(),
									collateralInfo?.decimals ?? 18,
								),
							);
						}}
						onBlur={() => {
							setAmountInput(
								formatUnits(amount, collateralInfo?.decimals ?? 18),
							);
						}}
					/>
				</div>
				<Button
					className="h-12 font-bold text-xl w-44"
					disabled={!pipeline.buttonEnabled}
					onClick={nextStep}
				>
					{pipeline.buttonLabel}
				</Button>
			</div>
			<Slider
				className="mt-4"
				min={0}
				max={100}
				step={25}
				value={[
					sliderBase
						? Math.round(Number((amount * 10000n) / sliderBase)) / 100
						: 0,
				]}
				onValueChange={(value) => {
					if (!sliderBase) return;
					const exactPercentage = value[0] ?? 0;
					const amount =
						(sliderBase * BigInt(Math.round(exactPercentage))) / 100n;

					setAmount(amount);
					setAmountInput(formatUnits(amount, collateralInfo?.decimals ?? 18));
				}}
			>
				<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-0">
					<span className="absolute top-5 text-xs">0%</span>
				</div>
				<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-1/4 -translate-x-1/4">
					<span className="absolute top-5 text-xs">25%</span>
				</div>
				<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-1/2 -translate-x-1/2">
					<span className="absolute top-5 text-xs">50%</span>
				</div>
				<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors right-1/4 translate-x-1/4">
					<span className="absolute top-5 text-xs">75%</span>
				</div>
				<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors right-0">
					<span className="absolute top-5 text-xs">100%</span>
				</div>
			</Slider>
		</div>
	);
}
