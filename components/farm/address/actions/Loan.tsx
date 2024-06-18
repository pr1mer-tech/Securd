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
import { erc20Abi, formatUnits, parseUnits } from "viem";
import PairIcon from "../../PairIcon";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useAccount,
	useConfig,
	useReadContract,
	useReadContracts,
} from "wagmi";
import { useValueEffect } from "@/lib/hooks/pipelines/useValueEffect";
import {
	type CollateralPipelineState,
	borrowPipelineState,
	lockPipelineState,
} from "@/lib/hooks/pipelines/CollateralPipelineState";
import { lock } from "@/lib/hooks/pipelines/lock";
import { withdraw } from "@/lib/hooks/pipelines/withdrawFarm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	getMaximumBorrow,
	getPairReservesInfos,
	getTokensSymbol,
} from "@/lib/helpers/borrow.helpers";
import getPairBorrowBalances from "@/lib/hooks/getPairBorrowBalances";
import Image from "next/image";
import { borrow } from "@/lib/hooks/pipelines/borrow";
import { repay } from "@/lib/hooks/pipelines/repay";
import type { Coins } from "@/lib/types/save.types";
import { abiBorrowerData } from "@/lib/constants/abi/abiBorrowerData";

export default function Loan() {
	const collateralInfo = useFarmAddressStore.use.collateralInfo?.();
	const collateralAmountPrice =
		useFarmAddressStore.use.collateralAmountPrice?.();
	const collateralProportions =
		useFarmAddressStore.use.collateralProportions?.();
	const reservesInfo = useFarmAddressStore.use.reservesInfo?.();
	const userBalance = useFarmAddressStore.use.userBalance?.();
	const coinsPrices = useFarmAddressStore.use.coinPrices?.();

	const tokens = getTokensSymbol(collateralInfo);

	const pairReservesInfosUn = getPairReservesInfos(
		reservesInfo,
		collateralInfo,
	);

	const borrowBalances = getPairBorrowBalances(
		collateralAmountPrice?.debts,
		pairReservesInfosUn.reserveInfoTokenA,
		pairReservesInfosUn.reserveInfoTokenB,
	);

	const account = useAccount();

	const walletBalances = useReadContracts({
		contracts: [
			{
				abi: erc20Abi,
				address: pairReservesInfosUn.reserveInfoTokenA?.address,
				functionName: "balanceOf",
				args: [account?.address ?? "0x"],
			},
			{
				abi: erc20Abi,
				address: pairReservesInfosUn.reserveInfoTokenB?.address,
				functionName: "balanceOf",
				args: [account?.address ?? "0x"],
			},
		],
		query: {
			enabled: account?.address !== undefined,
			refetchInterval: 10000,
		},
	});

	const [menu, setMenu] = useState<"borrow" | "repay">("borrow");
	const [selectedAsset, setSelectedAsset] = useState<string>(tokens[0]);
	const [amount, setAmount] = useState<bigint>(0n);
	const [amountInput, setAmountInput] = useState<string>("");
	const resetInput = () => {
		setAmount(0n);
		setAmountInput("");
	};

	const { data: maxBorrowData, error } = useReadContract({
		account: account?.address,
		address: process.env
			.NEXT_PUBLIC_BORROWERDATA_CONTRACT_ADDRESS as `0x${string}`,
		abi: abiBorrowerData,
		functionName:
			selectedAsset === tokens[0] ? "getMaxBorrowA" : "getMaxBorrowB",
		args: [account?.address ?? "0x", collateralInfo?.addressLP ?? "0x"],
	});

	console.log({ maxBorrowData, error });

	const maximumBorrow = (() => {
		if (account?.address && !maxBorrowData) {
			return 0n;
		}
		if (maxBorrowData) {
			return maxBorrowData;
		}
		const minCollateralFactor_ =
			collateralInfo?.liquidationThresholdInfo.unBalancedLoanThreshold_b ?? 1n;
		const collateral_ = collateralAmountPrice?.collateralValue ?? 0n;
		return collateral_ / minCollateralFactor_;
	})();

	const config = useConfig();
	const [pipeline, nextStep, _resetPipeline, setPipeline] =
		useValueEffect<CollateralPipelineState>(borrowPipelineState);

	useEffect(() => {
		if (
			borrowBalances &&
			collateralInfo &&
			collateralAmountPrice &&
			pairReservesInfosUn.reserveInfoTokenA &&
			pairReservesInfosUn.reserveInfoTokenB
		) {
			const price = collateralAmountPrice;
			const asset =
				selectedAsset === tokens[0]
					? pairReservesInfosUn.reserveInfoTokenA
					: pairReservesInfosUn.reserveInfoTokenB;

			setPipeline(
				menu === "borrow"
					? borrow(
							config,
							collateralInfo,
							asset,
							amount,
							price,
							collateralProportions,
							coinsPrices,
							collateralAmountPrice.collateralAmount ?? 0n,
							[
								pairReservesInfosUn.reserveInfoTokenA,
								pairReservesInfosUn.reserveInfoTokenB,
							],
							borrowBalances,
							resetInput,
						)
					: repay(
							config,
							collateralInfo,
							asset,
							amount,
							price,
							collateralProportions,
							coinsPrices,
							collateralAmountPrice.collateralAmount ?? 0n,
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
		menu,
		setPipeline,
		collateralInfo,
		collateralAmountPrice,
		userBalance,
		selectedAsset,
	]);

	const sliderBase =
		menu === "borrow"
			? maximumBorrow
			: BigInt(
					Math.floor(
						((tokens[0] === selectedAsset
							? borrowBalances?.borrowBalanceA
							: borrowBalances?.borrowBalanceB) ?? 0) * 1e9,
					),
				) *
				10n ** BigInt((collateralInfo?.decimals ?? 18) - 9);

	console.log({ sliderBase });

	return (
		<div className="flex flex-col gap-2 w-full">
			<div className="flex flex-row justify-between items-center w-full h-10">
				<h2 className="text-2xl font-bold text-primary">Loan</h2>
				<Tabs
					value={selectedAsset}
					onValueChange={(value) => {
						setSelectedAsset(value as string);
					}}
				>
					<TabsList>
						{tokens.map((token, index) => (
							<TabsTrigger key={token} value={token}>
								{token}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			</div>
			<Separator />
			<div className="flex flex-row justify-between items-center w-full">
				<MenuTabs
					value={menu}
					onValueChange={(value) => {
						setMenu(value as "borrow" | "repay");
						resetInput();
					}}
				>
					<MenuTabsList className="h-[3.25rem]">
						<MenuTabsTrigger value="borrow" className="p-6">
							Borrow
						</MenuTabsTrigger>
						<MenuTabsTrigger value="repay" className="p-6">
							Repay
						</MenuTabsTrigger>
					</MenuTabsList>
				</MenuTabs>
				{menu === "borrow" ? (
					<div className="text-md">
						Max Borrow
						<Help>
							The maximum amount you can borrow of {selectedAsset} in this
							account
						</Help>
						<div className="inline-flex flex-col items-end">
							<SecurdFormat
								className="text-xl font-bold inline ml-2"
								value={bigIntToDecimal(maximumBorrow, 18)}
							/>
							<SecurdFormat
								className="text-sm inline text-secondary"
								value={
									(bigIntToDecimal(maximumBorrow, collateralInfo?.decimals) ??
										0) * (coinsPrices?.[selectedAsset as keyof Coins] ?? 0)
								}
								prefix="$"
								decimals={0}
							/>
						</div>
						{pairReservesInfosUn.reserveInfoTokenA &&
							pairReservesInfosUn.reserveInfoTokenB && (
								<Image
									src={
										selectedAsset === tokens[0]
											? pairReservesInfosUn.reserveInfoTokenA?.imgSrc
											: pairReservesInfosUn.reserveInfoTokenB?.imgSrc
									}
									alt={selectedAsset}
									width={24}
									height={24}
									className="inline -mt-1 ml-1"
								/>
							)}
					</div>
				) : (
					<div className="text-md">
						Wallet Balance
						<Help>Amount of {selectedAsset} in your wallet</Help>
						<div className="inline-flex flex-col items-end">
							<SecurdFormat
								className="text-xl font-bold inline ml-2"
								value={bigIntToDecimal(
									walletBalances.data?.[selectedAsset === tokens[0] ? 0 : 1]
										?.result ?? 0n,
									collateralInfo?.decimals,
								)}
							/>
							<SecurdFormat
								className="text-sm inline text-secondary"
								value={
									(bigIntToDecimal(
										walletBalances.data?.[selectedAsset === tokens[0] ? 0 : 1]
											?.result ?? 0n,
										collateralInfo?.decimals,
									) ?? 0) * (coinsPrices?.[selectedAsset as keyof Coins] ?? 0)
								}
								prefix="$"
								decimals={0}
							/>
						</div>
						{pairReservesInfosUn.reserveInfoTokenA &&
							pairReservesInfosUn.reserveInfoTokenB && (
								<Image
									src={
										selectedAsset === tokens[0]
											? pairReservesInfosUn.reserveInfoTokenA?.imgSrc
											: pairReservesInfosUn.reserveInfoTokenB?.imgSrc
									}
									alt={selectedAsset}
									width={24}
									height={24}
									className="inline -mt-1 ml-1"
								/>
							)}
					</div>
				)}
			</div>
			<div className="flex flex-row gap-4 mt-4">
				<div className="relative flex items-center w-full">
					<div className="absolute left-0 flex flex-row items-center justify-evenly border w-24 h-full bg-muted rounded-l-md">
						{pairReservesInfosUn.reserveInfoTokenA &&
							pairReservesInfosUn.reserveInfoTokenB && (
								<Image
									src={
										selectedAsset === tokens[0]
											? pairReservesInfosUn.reserveInfoTokenA?.imgSrc
											: pairReservesInfosUn.reserveInfoTokenB?.imgSrc
									}
									alt={selectedAsset}
									width={24}
									height={24}
									className="inline"
								/>
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
					let amount =
						(sliderBase * BigInt(Math.round(exactPercentage))) / 100n;

					if (
						menu === "repay" &&
						amount >
							(walletBalances.data?.[selectedAsset === tokens[0] ? 0 : 1]
								?.result ?? 0n)
					) {
						amount =
							walletBalances.data?.[selectedAsset === tokens[0] ? 0 : 1]
								?.result ?? amount;
					}

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
				{/* {menu === "borrow" && <div className="absolute h-5 w-1/5 right-0 flex items-center">
                <div className="absolute h-2 w-full bg-red-500 rounded-full" />
            </div>} */}
				<div className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors right-0">
					<span className="absolute top-5 text-xs">100%</span>
				</div>
			</Slider>
		</div>
	);
}
