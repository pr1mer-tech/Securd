"use client";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { useFarmStore } from "@/lib/data/farmStore";
import { toFormattedPercentage } from "@/lib/helpers/numberFormat.helpers";
import { getPoolAPY } from "@/lib/helpers/lenderPool.helpers";
import { Separator } from "../ui/separator";

import Help from "../ui/Help";
import Link from "next/link";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { CollateralInfos } from "@/lib/types/farm.types";
import { getBorrowAPY, getPairBorrowApy, getPairPrice, getPairReservesInfos, getTokensSymbol, getTotalApy } from "@/lib/helpers/borrow.helpers";
import getPairBorrowBalances from "@/lib/hooks/getPairBorrowBalances";
import { CollateralAmountPrice } from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import PairIcon from "./PairIcon";
import SecurdFormat from "../utils/SecurdFormat";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import PercentageFormat from "../utils/PercentageFormat";

export const ColorCircle = ({ colorRisk }: { colorRisk: number }) => {
    let color;
    if (colorRisk && colorRisk <= 10) {
        color = 'bg-systemRed';
    } else if (colorRisk && colorRisk <= 25) {
        color = 'bg-systemYellow';
    } else {
        color = 'bg-systemGreen';
    }

    return (
        <div
            className={`w-6 h-6 rounded-full ${color}`}
        />
    );
};

export function AccountCard({
    userCollateralsInfo,
    collateralAmountPrices,
}: {
    userCollateralsInfo: CollateralInfos;
    collateralAmountPrices: Record<string, CollateralAmountPrice>;
}) {
    const coinPrices = useFarmStore.use.coinPrices();
    const reservesInfo = useFarmStore.use.reservesInfo();
    const borrowerLTs = useFarmStore.use.borrowerLt();

    const collateralPrice = collateralAmountPrices[userCollateralsInfo.addressLP]
    const collateralValue = collateralPrice?.collateralValue;
    const collateralValueDecimal = bigIntToDecimal(collateralValue, userCollateralsInfo.decimals) || 0;

    const lpApr = 0.089;
    const lpApy = getPoolAPY(undefined, lpApr);

    const tokensUn = getTokensSymbol(userCollateralsInfo);

    const pairReservesInfosUn = getPairReservesInfos(reservesInfo, tokensUn);

    const borrowBalances = getPairBorrowBalances(
        collateralPrice?.debts,
        pairReservesInfosUn.reserveInfoTokenA,
        pairReservesInfosUn.reserveInfoTokenB
    );

    const tokensUSDPrices = getPairPrice(coinPrices, reservesInfo, tokensUn);

    let loanAUSD = borrowBalances?.borrowBalanceA && tokensUSDPrices.tokenA ? borrowBalances.borrowBalanceA * tokensUSDPrices.tokenA : 0;
    let loanBUSD = borrowBalances?.borrowBalanceB && tokensUSDPrices.tokenB ? borrowBalances.borrowBalanceB * tokensUSDPrices.tokenB : 0;

    const priceLoan = loanAUSD + loanBUSD;

    const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB } =
        getPairBorrowApy(reservesInfo, tokensUn);

    const borrowApy = getBorrowAPY(
        tokensUSDPrices,
        borrowPoolAPYA,
        borrowPoolAPYB,
        borrowBalances?.borrowBalanceA,
        borrowBalances?.borrowBalanceB,
    );

    const totalApy = getTotalApy(collateralValueDecimal, lpApy, priceLoan, borrowApy);

    const borrowerCF = bigIntToDecimal(collateralPrice?.collateralFactor, userCollateralsInfo.decimals);
    const balanceLT = bigIntToDecimal(borrowerLTs[userCollateralsInfo.addressLP], userCollateralsInfo.decimals);
    const colorRisk = (borrowerCF && balanceLT) ? (borrowerCF / balanceLT - 1) * 100 : 0;

    return <Link href={`/farm/${userCollateralsInfo.addressLP}`}>
        <Card>
            <CardContent className="pb-1">
                <div className="flex flex-row justify-between">
                    <h3 className="text-lg font-bold mt-4 flex flex-row items-center">
                        <PairIcon userCollateralsInfo={userCollateralsInfo} />
                    </h3>
                    <div className="text-base mt-4">
                        Farming APY

                        <Help>
                            Current yield of the position (Collateral - Loan) for this
                            account
                        </Help>

                        <div className="font-bold inline ml-2">{toFormattedPercentage(totalApy, 1)}</div>
                    </div>
                </div>
                <Separator className="mt-4" />
                <div className="text-primary font-bold text-lg mt-4">
                    Collateral
                    <Help>
                        Total value of locked assets backing your loans in this
                        account
                    </Help>
                </div>
                <div className="flex flex-row justify-between text-base mt-2">
                    <PairIcon userCollateralsInfo={userCollateralsInfo} size="small" className="w-36" />
                    <SecurdFormat
                        value={bigIntToDecimal(collateralPrice.collateralAmount, userCollateralsInfo.decimals)}
                        decimals={2}
                        className="font-bold inline ml-2"
                    />
                    <div className="text-secondary inline ml-2">
                        ${collateralValueDecimal.toFixed(2)}
                    </div>
                </div>
                <Separator className="mt-4" />
                <div className="text-primary font-bold text-lg mt-4">
                    Loan
                    <Help>
                        Total value of loans in this account
                    </Help>
                </div>
                <div className="flex flex-row justify-between text-base mt-2">
                    {pairReservesInfosUn.reserveInfoTokenA ? <div className="w-36">
                        <Image
                            className="rounded-full inline mr-1"
                            src={pairReservesInfosUn.reserveInfoTokenA?.imgSrc}
                            alt={pairReservesInfosUn.reserveInfoTokenA?.symbol}
                            width={24}
                            height={24} />
                        {pairReservesInfosUn.reserveInfoTokenA?.symbol}
                    </div> : <Skeleton className="w-8 h-6" />}
                    <SecurdFormat
                        value={borrowBalances?.borrowBalanceA}
                        decimals={2}
                        className="font-bold inline ml-2"
                    />
                    <div className="text-secondary inline ml-2">
                        ${loanAUSD.toFixed(2)}
                    </div>
                </div>
                <div className="flex flex-row justify-between text-base mt-2">
                    {pairReservesInfosUn.reserveInfoTokenB ? <div className="w-36">
                        <Image
                            className="rounded-full inline mr-1"
                            src={pairReservesInfosUn.reserveInfoTokenB?.imgSrc}
                            alt={pairReservesInfosUn.reserveInfoTokenB?.symbol}
                            width={24}
                            height={24} />
                        {pairReservesInfosUn.reserveInfoTokenB?.symbol}
                    </div> : <Skeleton className="w-8 h-6" />}
                    <SecurdFormat
                        value={borrowBalances?.borrowBalanceB}
                        decimals={2}
                        className="font-bold inline ml-2"
                    />
                    <div className="text-secondary inline ml-2">
                        ${loanBUSD.toFixed(2)}
                    </div>
                </div>
                <Separator className="mt-4" />
                <div className="flex flex-row justify-between text-base mt-4">
                    <div className="text-primary font-bold text-lg">
                        Liquidation Risk
                        <Help>
                            Risk of liquidation for this account
                        </Help>
                    </div>
                    <Tooltip>
                        <TooltipTrigger>
                            <ColorCircle colorRisk={colorRisk} />
                        </TooltipTrigger>
                        <TooltipContent>
                            {colorRisk.toFixed(2)}%
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex flex-row justify-between text-base mt-2">
                    <div className="">
                        Collateral Factor
                        <Help>
                            Collateral value divided by Loan value
                        </Help>
                    </div>
                    <SecurdFormat value={borrowerCF} className="text-xl font-bold" />
                </div>
                <div className="flex flex-row justify-between text-base mt-2 mb-4">
                    <div className="">
                        Liquidation Threshold
                        <Help>
                            Minimum Collateral Factor before your collateral is liquidated
                        </Help>
                    </div>
                    <PercentageFormat value={balanceLT} className="text-xl font-bold" />
                </div>
            </CardContent>
        </Card>
    </Link>;
}