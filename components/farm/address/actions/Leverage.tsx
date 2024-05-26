"use client";

import Help from "@/components/ui/Help";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import SecurdFormat from "@/components/utils/SecurdFormat";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import {
	getBorrowerPoolMaxLeverage,
	getPairReservesInfos,
	getTokensSymbol,
	lpToLeverage,
} from "@/lib/helpers/borrow.helpers";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import getPairBorrowBalances from "@/lib/hooks/getPairBorrowBalances";
import {
	type CollateralPipelineState,
	leveragePipelineState,
} from "@/lib/hooks/pipelines/CollateralPipelineState";
import { useValueEffect } from "@/lib/hooks/pipelines/useValueEffect";
import { useEffect, useState } from "react";
import { useAccount, useConfig, useReadContract } from "wagmi";
import { leverage as leveragePipeline } from "@/lib/hooks/pipelines/leverage";
import { abiCollateralPool } from "@/lib/constants/abi/abiCollateralPool";
import { abiBorrowerData } from "@/lib/constants/abi/abiBorrowerData";

export default function Leverage() {
	const collateralInfo = useFarmAddressStore.use.collateralInfo?.();
	const collateralAmountPrice =
		useFarmAddressStore.use.collateralAmountPrice?.();
	const collateralProportions =
		useFarmAddressStore.use.collateralProportions?.();
	const reservesInfo = useFarmAddressStore.use.reservesInfo?.();
	const userBalance = useFarmAddressStore.use.userBalance?.();
	const coinsPrices = useFarmAddressStore.use.coinPrices?.();

	const pairReservesInfosUn = getPairReservesInfos(
		reservesInfo,
		collateralInfo,
	);

	const borrowBalances = getPairBorrowBalances(
		collateralAmountPrice?.debts,
		pairReservesInfosUn.reserveInfoTokenA,
		pairReservesInfosUn.reserveInfoTokenB,
	);

	const { leverage } = useFarmAddressStore((state) => ({
		leverage: state.leverage(),
	}));
	const { address } = useAccount();

	const { data: maxLevereage, error: positionError } = useReadContract({
		account: address,
		address: process.env
			.NEXT_PUBLIC_BORROWERDATA_CONTRACT_ADDRESS as `0x${string}`,
		abi: abiBorrowerData,
		functionName: "getMaxLevereage",
		args: [
			address ?? "0x",
			collateralInfo?.addressLP ?? "0x",
		],
		query: {
			enabled:
				!!address &&
				!!collateralInfo?.addressLP
		},
	});

	const minLeverage = 0;
	const maxLeverage = bigIntToDecimal(
		maxLevereage ?? 0n,
		collateralInfo?.decimals ?? 18,
	);

	console.log({ maxLevereage, positionError });

	const [amount, setAmount] = useState<number>(leverage ?? 0);
	const [amountInput, setAmountInput] = useState<string>(
		(leverage ?? 0).toFixed(2),
	);
	const resetInput = () => {
		setAmount(0);
		setAmountInput("0");
	};

	const config = useConfig();
	const [pipeline, nextStep, resetPipeline, setPipeline] =
		useValueEffect<CollateralPipelineState>(leveragePipelineState);

	useEffect(() => {
		if (
			borrowBalances &&
			collateralInfo &&
			collateralAmountPrice &&
			pairReservesInfosUn.reserveInfoTokenA &&
			pairReservesInfosUn.reserveInfoTokenB
		) {
			setPipeline(
				leveragePipeline(
					config,
					collateralInfo,
					amount,
					collateralAmountPrice,
					collateralProportions,
					coinsPrices,
					leverage ?? 0,
					[
						pairReservesInfosUn.reserveInfoTokenA,
						pairReservesInfosUn.reserveInfoTokenB,
					],
					borrowBalances,
					resetInput,
				),
			);
		}
	}, [
		config,
		amount,
		setPipeline,
		collateralInfo,
		collateralAmountPrice,
		userBalance,
		leverage,
	]);

	const sliderBase = maxLeverage;

	const isLeverage = amount / 10 > (leverage ?? 0);

	return (
		<div className="flex flex-col gap-2 w-full">
			<div className="flex flex-row justify-between items-center w-full h-10">
				<h2 className="text-2xl font-bold text-primary">Leverage</h2>
			</div>
			<div className="flex flex-row justify-between items-center w-full h-10">
				<div className="text-md">
					Current Leverage
					<Help>Current position multiplier for this account</Help>
					<SecurdFormat
						className="text-xl font-bold inline ml-2"
						prefix="&times;"
						value={leverage}
					/>
				</div>
				<div className="text-md">
					Max Leverage
					<Help>Maximum position multiplier for this LP Token</Help>
					<SecurdFormat
						className="text-xl font-bold inline ml-2"
						prefix="&times;"
						value={maxLeverage}
					/>
				</div>
			</div>
			<div className="flex flex-row gap-8">
				<Slider
					className="mt-6"
					min={0}
					max={100}
					step={25}
					value={[
						((amount - minLeverage) / ((maxLeverage ?? 1) - minLeverage)) * 100,
					]}
					onValueChange={(value) => {
						if (!sliderBase) return;
						const min = minLeverage;
						const max = sliderBase;
						const amount = min + ((max - min) * value[0]) / 100;

						setAmount(amount);
						setAmountInput(amount.toFixed(2));
					}}
				>
					<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-0">
						<span className="absolute top-5 text-xs">
							&times;{minLeverage.toFixed(1)}
						</span>
					</div>
					<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-1/4 -translate-x-1/4">
						<span className="absolute top-5 text-xs">
							&times;{(minLeverage + (sliderBase ?? 0) / 4).toFixed(1)}
						</span>
					</div>
					<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors left-1/2 -translate-x-1/2">
						<span className="absolute top-5 text-xs">
							&times;{(minLeverage + (sliderBase ?? 0) / 2).toFixed(1)}
						</span>
					</div>
					<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors right-1/4 translate-x-1/4">
						<span className="absolute top-5 text-xs">
							&times;{(minLeverage + ((sliderBase ?? 0) * 3) / 4).toFixed(1)}
						</span>
					</div>
					<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors right-0">
						<span className="absolute top-5 text-xs">
							&times;{(sliderBase ?? 0).toFixed(1)}
						</span>
					</div>
				</Slider>
				<div className="relative flex items-center">
					<div className="absolute left-0 text-primary text-center text-2xl w-8">
						&times;
					</div>
					<Input
						placeholder="Amount"
						type="number"
						className="w-32 h-16 text-3xl font-bold pl-8"
						value={amountInput}
						onChange={(e) => {
							const min = minLeverage;
							const max = sliderBase ?? 0;

							const amount = Number(e.target.value);
							setAmountInput(e.target.value);
							if (amount > min && amount < max) {
								setAmount(Number(e.target.value));
							}
						}}
						onBlur={() => {
							setAmountInput(amount.toFixed(2));
						}}
					/>
				</div>
			</div>
			<Button
				className="h-12 font-bold text-xl mt-4"
				disabled={!pipeline.buttonEnabled}
				onClick={nextStep}
			>
				{pipeline.buttonLabel}
			</Button>
		</div>
	);
}
