"use client";
import { Card, CardContent } from "../ui/card";
import { Coins, ReserveInfo } from "@/lib/types/save.types";
import Image from "next/image";
import { useFarmStore } from "@/lib/data/farmStore";
import { toFormattedPercentage } from "@/lib/helpers/numberFormat.helpers";
import { getPoolAPY, getSavingApy } from "@/lib/helpers/lenderPool.helpers";
import { Separator } from "../ui/separator";

import Help from "../ui/Help";
import getUserDepositBalance from "@/lib/hooks/getUserDepositBalance";
import { useMemo } from "react";
import { getInterestAmount } from "@/lib/helpers/lenderDeposit.helpers";
import Link from "next/link";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { CollateralInfos } from "@/lib/types/farm.types";
import { getBorrowAPY, getPairBorrowApy, getPairPrice, getPairReservesInfos, getTokensSymbol, getTotalApy } from "@/lib/helpers/borrow.helpers";
import getPairBorrowBalances from "@/lib/hooks/getPairBorrowBalances";
import { CollateralAmountPrice } from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import PairIcon from "./PairIcon";


export function AccountCard({
    userCollateralsInfo,
    collateralAmountPrices,
}: {
    userCollateralsInfo: CollateralInfos;
    collateralAmountPrices: Record<string, CollateralAmountPrice>;
}) {
    const coinPrices = useFarmStore.use.coinPrices();
    const reservesInfo = useFarmStore.use.reservesInfo();

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

    return <Link href={`/save/${userCollateralsInfo.addressLP}`}>
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
                <Separator className="my-2" />
            </CardContent>
        </Card>
    </Link>;
}