"use client";

import { Card } from "@/components/ui/card";
import {
	useSaveAddressStore,
	useSaveAddressStoreBase,
} from "@/lib/data/saveAddressStore";
import {
	getDeposit,
	getDepositBalance,
	getPoolLiquidity,
	getPoolUtilization,
	getSavingApy,
} from "@/lib/helpers/lenderPool.helpers";
import { Info } from "../InfoCard";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { getInterestAmount } from "@/lib/helpers/lenderDeposit.helpers";
import {
	MenuTabs,
	MenuTabsContent,
	MenuTabsList,
	MenuTabsTrigger,
} from "@/components/ui/menu-tabs";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import {
	getBorrowerPoolBalanceLT,
	getBorrowerPoolMaxLeverage,
	getMaxLT,
	getPairBorrowApy,
	getPairReservesInfos,
	getTokensSymbol,
} from "@/lib/helpers/borrow.helpers";
import type { Coins } from "@/lib/types/save.types";
import { parseUnits } from "viem";

export default function PoolDetails() {
	const collateralInfo = useFarmAddressStore.use.collateralInfo?.();
	const reservesInfo = useFarmAddressStore.use.reservesInfo?.();
	const coinsPrices = useFarmAddressStore.use.coinPrices?.();
	const collateralPoolBalance =
		useFarmAddressStore.use.collateralPoolBalance?.();
	const collateralProportions =
		useFarmAddressStore.use.collateralProportions?.();
	const { totalBorrowApy, lpApy, maxLeverageApy } = useFarmAddressStore(
		(state) => ({
			totalBorrowApy: state.totalBorrowApy(),
			lpApy: state.lpApy(),
			maxLeverageApy: state.maxLeverageApy(),
		}),
	);
	const balanceLDTokens = useFarmAddressStore.use.balanceLDTokens?.() ?? {};
	const tokens = getTokensSymbol(collateralInfo);

	const minLT = getBorrowerPoolBalanceLT(collateralInfo);
	const maxLT = getMaxLT(collateralInfo);

	const collateralPrice = bigIntToDecimal(
		(collateralPoolBalance ?? 0n) *
			(collateralProportions?.collateralPrice ?? 0n),
		(collateralInfo?.decimals ?? 18) * 2,
	);

	const maxLeverage = getBorrowerPoolMaxLeverage(collateralInfo);

	const pairReservesInfos = getPairReservesInfos(reservesInfo, collateralInfo);
	const lendingPoolA = //getDepositBalance(pairReservesInfos.reserveInfoTokenA) ?? 0n;
    pairReservesInfos.reserveInfoTokenA
		? ((balanceLDTokens?.[pairReservesInfos.reserveInfoTokenA.address]
				?.dTokenSupply ?? 0n) *
				pairReservesInfos.reserveInfoTokenA?.tokenInfo.dTokenPrice) /
			10n ** BigInt(pairReservesInfos.reserveInfoTokenA?.decimals ?? 18)
		: 0n;
	const liquidityA = getPoolLiquidity(pairReservesInfos.reserveInfoTokenA);
	const loanA =
    bigIntToDecimal(pairReservesInfos.reserveInfoTokenA
		? ((balanceLDTokens?.[pairReservesInfos.reserveInfoTokenA.address]
				?.lTokenSupply ?? 0n) *
				pairReservesInfos.reserveInfoTokenA?.tokenInfo.lTokenPrice) /
			10n ** BigInt(pairReservesInfos.reserveInfoTokenA?.decimals ?? 18)
		: 0n, collateralInfo?.decimals) ?? 0;
		// (bigIntToDecimal(lendingPoolA, collateralInfo?.decimals) ?? 0) -
		// (bigIntToDecimal(
		// 	liquidityA,
		// 	pairReservesInfos.reserveInfoTokenA?.decimals,
		// ) ?? 0);
	const utilizationA = lendingPoolA > 0n ?
		loanA / (bigIntToDecimal(lendingPoolA, collateralInfo?.decimals) ?? 0) :
		0;
	const lendingPoolB = getDepositBalance(pairReservesInfos.reserveInfoTokenB);
	const liquidityB = getPoolLiquidity(pairReservesInfos.reserveInfoTokenB);
	const loanB =
		(bigIntToDecimal(lendingPoolB, collateralInfo?.decimals) ?? 0) -
		(bigIntToDecimal(
			liquidityB,
			pairReservesInfos.reserveInfoTokenB?.decimals,
		) ?? 0);
	const utilizationB =
		loanB / (bigIntToDecimal(lendingPoolB, collateralInfo?.decimals) ?? 0);
	const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB } = getPairBorrowApy(
		reservesInfo,
		collateralInfo,
	);

	console.log({
		reservesInfo,
        collateralInfo,
		lendingPoolA,
		liquidityA,
		loanA,
		utilizationA,
	});

	return (
		<>
			<h2 className="text-2xl font-bold text-primary mt-4">Pool Details</h2>
			<MenuTabs className="mt-8" defaultValue="pool">
				<MenuTabsList className="h-17">
					<MenuTabsTrigger value="pool" className="p-8">
						{collateralInfo?.symbol}
					</MenuTabsTrigger>
					<MenuTabsTrigger value="tokenA" className="p-8">
						Pool {tokens[0]}
					</MenuTabsTrigger>
					<MenuTabsTrigger value="tokenB" className="p-8">
						Pool {tokens[1]}
					</MenuTabsTrigger>
				</MenuTabsList>
				<MenuTabsContent value="pool">
					<Card className="mt-8 p-4">
						<div className="flex flex-row justify-evenly">
							<Info
								bigIntValue={collateralPoolBalance}
								bigIntDecimals={collateralInfo?.decimals}
								value={collateralPrice}
								decimals={2}
								name="Total Supply"
								type="currency"
								tooltip="Total Collateral value for all Farmers of this LP Token"
							/>
							<Info
								value={minLT}
								name="Min LT"
								type="percentage"
								tooltip="Liquidation Threshold that applies when your loans value in both assets are equal"
							/>
							<Info
								value={maxLT}
								name="Max LT"
								type="percentage"
								tooltip="Liquidation Threshold that applies when you only borrow one asset"
							/>
							<Info
								value={maxLeverage}
								name="Max Leverage"
								type="multiplier"
								tooltip="Maximum position multiplier allowed for this LP Token"
							/>
							<Info
								value={totalBorrowApy}
								name="Borrow APY"
								type="percentage"
								tooltip="Current average borrowing rate for this token pair"
							/>
							<Info
								value={lpApy}
								name="LP APY"
								type="percentage"
								tooltip="Estimated yield for this LP Token based on last 3 months trading fees"
							/>
							<Info
								value={maxLeverageApy}
								name="Max Farming APY"
								type="percentage"
								tooltip="Estimated Farming APY when using Max Leverage"
							/>
						</div>
					</Card>
				</MenuTabsContent>
				<MenuTabsContent
					value="tokenA"
					className="flex flex-col md:flex-row gap-4"
				>
					<Card className="mt-8 p-4 w-full">
						<div className="flex flex-row justify-evenly">
							<Info
								bigIntValue={lendingPoolA}
								bigIntDecimals={pairReservesInfos.reserveInfoTokenA?.decimals}
								value={
									(bigIntToDecimal(
										lendingPoolA,
										pairReservesInfos.reserveInfoTokenA?.decimals,
									) ?? 0) * (coinsPrices?.[tokens[0] as keyof Coins] ?? 0)
								}
								decimals={2}
								name="Lending Pool"
								type="currency"
								tooltip="Total Savings value (Deposit+Interest) for all depositors of this asset"
							/>
							<Info
								bigIntValue={liquidityA}
								bigIntDecimals={pairReservesInfos.reserveInfoTokenA?.decimals}
								value={
									(bigIntToDecimal(
										liquidityA,
										pairReservesInfos.reserveInfoTokenA?.decimals,
									) ?? 0) * (coinsPrices?.[tokens[0] as keyof Coins] ?? 0)
								}
								name="Liquidity"
								type="currency"
								tooltip="Amount of this asset available for immediate withdrawal"
							/>
							<Info
								bigIntValue={
									BigInt(Math.round((loanA ?? 0) * 1e9)) *
									10n **
										BigInt(
											(pairReservesInfos.reserveInfoTokenA?.decimals ?? 18) - 9,
										)
								}
								bigIntDecimals={pairReservesInfos.reserveInfoTokenA?.decimals}
								value={
									(loanA ?? 0) * (coinsPrices?.[tokens[0] as keyof Coins] ?? 0)
								}
								name="Loans"
								type="currency"
								tooltip="Total loan value for this asset"
							/>
						</div>
					</Card>
					<Card className="mt-8 p-4 w-full">
						<div className="flex flex-row justify-evenly">
							<Info
								value={utilizationA}
								name="Utilization"
								type="percentage"
								tooltip="Proportion of borrowed assets in this lending pool"
							/>
							<Info
								value={borrowPoolAPYA}
								name="Borrow APY"
								type="percentage"
								tooltip="Current borrowing rate for this token pair"
							/>
						</div>
					</Card>
				</MenuTabsContent>
				<MenuTabsContent
					value="tokenB"
					className="flex flex-col md:flex-row gap-4"
				>
					<Card className="mt-8 p-4 w-full">
						<div className="flex flex-row justify-evenly">
							<Info
								bigIntValue={lendingPoolB}
								bigIntDecimals={pairReservesInfos.reserveInfoTokenB?.decimals}
								value={
									(bigIntToDecimal(
										lendingPoolB,
										pairReservesInfos.reserveInfoTokenB?.decimals,
									) ?? 0) * (coinsPrices?.[tokens[1] as keyof Coins] ?? 0)
								}
								decimals={2}
								name="Lending Pool"
								type="currency"
								tooltip="Total Savings value (Deposit+Interest) for all depositors of this asset"
							/>
							<Info
								bigIntValue={parseUnits(
									(
										bigIntToDecimal(
											liquidityB,
											pairReservesInfos.reserveInfoTokenB?.decimals,
										) ?? 0
									).toString(),
									pairReservesInfos.reserveInfoTokenB?.decimals ?? 18,
								)}
								bigIntDecimals={pairReservesInfos.reserveInfoTokenB?.decimals}
								value={
									(bigIntToDecimal(
										liquidityB,
										pairReservesInfos.reserveInfoTokenB?.decimals,
									) ?? 0) * (coinsPrices?.[tokens[1] as keyof Coins] ?? 0)
								}
								name="Liquidity"
								type="currency"
								tooltip="Amount of this asset available for immediate withdrawal"
							/>
							<Info
								bigIntValue={parseUnits(
									(loanB ?? 0).toString(),
									pairReservesInfos.reserveInfoTokenB?.decimals ?? 18,
								)}
								bigIntDecimals={pairReservesInfos.reserveInfoTokenB?.decimals}
								value={
									(loanB ?? 0) * (coinsPrices?.[tokens[1] as keyof Coins] ?? 0)
								}
								name="Loans"
								type="currency"
								tooltip="Total loan value for this asset"
							/>
						</div>
					</Card>
					<Card className="mt-8 p-4 w-full">
						<div className="flex flex-row justify-evenly">
							<Info
								value={utilizationB}
								name="Utilization"
								type="percentage"
								tooltip="Proportion of borrowed assets in this lending pool"
							/>
							<Info
								value={borrowPoolAPYB}
								name="Borrow APY"
								type="percentage"
								tooltip="Current borrowing rate for this token pair"
							/>
						</div>
					</Card>
				</MenuTabsContent>
			</MenuTabs>
		</>
	);
}
