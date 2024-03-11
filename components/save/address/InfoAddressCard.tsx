"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AccountTable } from "../AccountTable";
import { useSaveAddressStore } from "@/lib/data/saveAddressStore";
import { getSavingApy } from "@/lib/helpers/lenderPool.helpers";
import getUserDepositBalance from "@/lib/hooks/getUserDepositBalance";
import { useMemo } from "react";
import { getInterestAmount } from "@/lib/helpers/lenderDeposit.helpers";
import { Skeleton } from "@/components/ui/skeleton";
import Help from "@/components/ui/Help";
import { securdFormatFloor, toFormattedPercentage } from "@/lib/helpers/numberFormat.helpers";
import { MenuTabs, MenuTabsList, MenuTabsTrigger } from "@/components/ui/menu-tabs";
import { formatUnits } from "viem";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";

export default function InfoAddressCard() {
    const reservesInfo = useSaveAddressStore.use.reserveInfo?.();
    const balanceLDToken = useSaveAddressStore.use.balanceLDToken();
    const coinPrice = useSaveAddressStore.use.coinPrice();
    const userDeposit = useSaveAddressStore.use.userDeposit();
    const userBalance = useSaveAddressStore.use.userBalance();

    const savings = getSavingApy(reservesInfo);
    const { userDepositBalance } = getUserDepositBalance(reservesInfo, balanceLDToken);

    const userInterest = useMemo(() => {
        return getInterestAmount(userDepositBalance, userDeposit);
    }, [userDepositBalance, userDeposit]);

    if (!reservesInfo || !balanceLDToken || !coinPrice || !userDeposit) return <Skeleton className="w-full rounded-xl h-56 max-w-screen-xl mx-auto mt-8" />

    return <Card className="flex flex-col md:flex-row mt-8">
        <div className="flex flex-col gap-2 bg-securdLightGrey rounded-t-2xl md:rounded-none md:rounded-l-2xl p-6 w-2/5">
            <h2 className="text-2xl font-bold text-primary">My balance</h2>
            <Separator className="bg-securdWhite" />
            <div className="text-xl">
                <AccountTable userDepositBalance={userDepositBalance} price={coinPrice} userDeposit={userDeposit} userReserveInfo={reservesInfo} userInterest={userInterest} />
            </div>
        </div>
        <div className="flex flex-col gap-2 p-6 w-3/5">
            <div className="flex flex-row justify-between items-center w-full">
                <h2 className="text-2xl font-bold text-primary">Deposit / Withdraw</h2>
                <div className="text-lg">
                    Saving APY

                    <Help>
                        Current yield for this account
                    </Help>

                    <div className="text-2xl font-bold inline ml-2">{toFormattedPercentage(savings, 1)}</div>
                </div>
            </div>
            <Separator />
            <div className="flex flex-row justify-between items-center w-full">
                <MenuTabs defaultValue="deposit">
                    <MenuTabsList>
                        <MenuTabsTrigger value="deposit">Deposit</MenuTabsTrigger>
                        <MenuTabsTrigger value="withdraw">Withdraw</MenuTabsTrigger>
                    </MenuTabsList>
                </MenuTabs>
                <div className="text-md">
                    Wallet Balance
                    <Help>
                        Amount of this asset in your wallet
                    </Help>
                    <div className="text-xl font-bold inline ml-2">
                        {securdFormatFloor(bigIntToDecimal(userBalance, reservesInfo.decimals), 2)}
                        {" " + reservesInfo.symbol}
                    </div>
                </div>
            </div>
        </div>
    </Card >
}