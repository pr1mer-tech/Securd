"use client";
import { Card, CardContent } from "../ui/card";
import { Coins, ReserveInfo } from "@/lib/types/save.types";
import Image from "next/image";
import { useSaveStore } from "@/lib/data/saveStore";
import { toFormattedPercentage } from "@/lib/helpers/numberFormat.helpers";
import { getSavingApy } from "@/lib/helpers/lenderPool.helpers";
import { Separator } from "../ui/separator";

import Help from "../ui/Help";
import getUserDepositBalance from "@/lib/hooks/getUserDepositBalance";
import { useMemo } from "react";
import { getInterestAmount } from "@/lib/helpers/lenderDeposit.helpers";
import { AccountTable } from "./AccountTable";
import Link from "next/link";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";


export function AccountCard({ userReserveInfo }: { userReserveInfo: ReserveInfo; }) {
    const balanceLDTokens = useSaveStore.use.balanceLDTokens();
    const coinPrices = useSaveStore.use.coinPrices();
    const userDeposit = useSaveStore.use.userDeposit();

    const coin = userReserveInfo.symbol as keyof Coins;
    const price = coinPrices[coin] ?? 0;

    const savings = getSavingApy(userReserveInfo);
    const userDepositBalance = getUserDepositBalance(userReserveInfo, balanceLDTokens[userReserveInfo.address]);

    const userInterest = useMemo(() => {
        return getInterestAmount(
            bigIntToDecimal(userDepositBalance ?? 0n, userReserveInfo.decimals),
            bigIntToDecimal(userDeposit[userReserveInfo.address] ?? 0n, userReserveInfo.decimals)
        );
    }, [userDepositBalance, userDeposit, userReserveInfo.address]);

    return <Link href={`/save/${userReserveInfo.address}`}>
        <Card>
            <CardContent className="pb-1">
                <div className="flex flex-row justify-between">
                    <h3 className="text-2xl font-bold mt-4 flex flex-row items-center">
                        <Image
                            className="rounded-full inline"
                            src={userReserveInfo.imgSrc}
                            alt={userReserveInfo.symbol}
                            width={40}
                            height={40} />
                        <div className="ml-2">{userReserveInfo.symbol}</div>
                    </h3>
                    <div className="text-base mt-4">
                        Saving APY

                        <Help>
                            Current yield for this account
                        </Help>

                        <div className="font-bold inline ml-2">{toFormattedPercentage(savings, 1)}</div>
                    </div>
                </div>
                <Separator className="my-2" />
                <AccountTable userDepositBalance={userDepositBalance} price={price} userDeposit={userDeposit[userReserveInfo.address]} userReserveInfo={userReserveInfo} userInterest={userInterest} />
            </CardContent>
        </Card>
    </Link>;
}