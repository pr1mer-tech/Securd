"use client";

import { Card } from "@/components/ui/card";
import { useSaveAddressStore } from "@/lib/data/saveAddressStore";
import { getDeposit, getDepositBalance, getPoolLiquidity, getPoolUtilization, getSavingApy } from "@/lib/helpers/lenderPool.helpers";
import { Info } from "../InfoCard";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { getInterestAmount } from "@/lib/helpers/lenderDeposit.helpers";

export default function PoolDetails() {
    const reserveInfo = useSaveAddressStore.use.reserveInfo?.();
    const balanceLDToken = useSaveAddressStore.use.balanceLDToken?.();
    const coinPrice = useSaveAddressStore.use.coinPrice?.();

    const lendingPool = getDepositBalance(reserveInfo);
    const deposit = getDeposit(reserveInfo);
    const interest = getInterestAmount(lendingPool, deposit);
    const liquidity = getPoolLiquidity(reserveInfo);
    const utilization = getPoolUtilization(reserveInfo);
    const savingsApy = getSavingApy(reserveInfo);


    if (!reserveInfo || !balanceLDToken || !coinPrice) {
        return <Skeleton className="w-full rounded-xl h-24 max-w-screen-xl mx-auto" />;
    }

    return <>
        <h2 className="text-2xl font-bold text-primary mt-4">Pool Details</h2>
        <Card className="mt-4 p-4">
            <div className="flex flex-row justify-evenly">
                <Info bigIntValue={lendingPool} bigIntDecimals={reserveInfo.decimals} value={
                    (bigIntToDecimal(lendingPool, reserveInfo.decimals) ?? 0) * (coinPrice ?? 0)
                } name="lending pool" tooltip="Total Savings value (Deposit+Interest) for all depositors of this asset" />
                <Info bigIntValue={deposit} bigIntDecimals={reserveInfo.decimals} value={
                    (bigIntToDecimal(deposit, reserveInfo.decimals) ?? 0) * (coinPrice ?? 0)
                } name="deposit" tooltip="Total deposited amount for all depositors of this asset" />
                <Info bigIntValue={interest} bigIntDecimals={reserveInfo.decimals} value={
                    (bigIntToDecimal(interest, reserveInfo.decimals) ?? 0) * (coinPrice ?? 0)
                } name="interest" tooltip="Total accrued interest for all depositors of this asset" />
                <Info bigIntValue={liquidity} bigIntDecimals={reserveInfo.decimals} value={
                    (bigIntToDecimal(liquidity, reserveInfo.decimals) ?? 0) * (coinPrice ?? 0)
                } name="liquidity" tooltip="Amount of this asset available for immediate withdrawal" />
                <Info value={utilization} name="utilization" type="percentage" tooltip="Proportion of borrowed assets in this lending pool" />
                <Info value={savingsApy} name="savings apy" type="percentage" tooltip="Current yield for this asset" />
            </div>
        </Card>
    </>
}