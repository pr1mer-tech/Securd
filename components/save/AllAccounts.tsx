"use client";

import Help from "@/components/ui/Help";
import { ColumnDef, SortingState } from "@tanstack/react-table"
import { Coins, ReserveInfo } from "@/lib/types/save.types";
import Image from "next/image";
import { getDepositBalance, getDeposit, getPoolLiquidity, getPoolUtilization, getSavingApy } from "@/lib/helpers/lenderPool.helpers";
import { securdFormat, toFormattedPercentage } from "@/lib/helpers/numberFormat.helpers";
import { useSaveStore } from "@/lib/data/saveStore";
import { DataTable } from "../layout/DataTable";
import { getInterestAmount } from "@/lib/helpers/lenderDeposit.helpers";
import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<ReserveInfo>[] = [
    {
        accessorKey: "symbol",
        header: "Asset",
        cell: ({ row }) => (
            <div className="flex flex-row items-center">
                <Image
                    className="rounded-full inline"
                    src={row.original.imgSrc}
                    alt={row.original.symbol}
                    width={40}
                    height={40}
                />
                <div className="ml-2 text-xl font-bold">{row.original.symbol}</div>
            </div>
        )
    },
    {
        accessorKey: "symbol",
        header: ({ column }) => <>
            Lending Pool
            <Help>
                Total Savings value (Deposit+Interest) for all depositors of this
                asset
            </Help>
        </>,
        cell: ({ row }) => {
            const coinPrices = useSaveStore.use.coinPrices();
            const depositBalance = getDepositBalance(row.original);
            const price = coinPrices[row.original.symbol as keyof Coins];
            return <div className="flex flex-col">
                <div className="text-xl font-bold">
                    {securdFormat(depositBalance, 0)}
                </div>
                <div className="text-sm text-secondary">
                    ${securdFormat(depositBalance && (depositBalance * price))}
                </div>
            </div>
        }
    },
    {
        accessorKey: "symbol",
        header: ({ column }) => <>
            Deposit
            <Help>
                Total deposited amount for all depositors of this asset
            </Help>
        </>,
        cell: ({ row }) => {
            const coinPrices = useSaveStore.use.coinPrices();
            const globalDeposit = getDeposit(row.original);
            const price = coinPrices[row.original.symbol as keyof Coins];
            return <div className="flex flex-col">
                <div className="text-xl font-bold">
                    {securdFormat(globalDeposit, 0)}
                </div>
                <div className="text-sm text-secondary">
                    ${securdFormat(globalDeposit && (globalDeposit * price))}
                </div>
            </div>
        }
    },
    {
        accessorKey: "symbol",
        header: ({ column }) => <>
            Interest
            <Help>
                Total accrued interest for all depositors of this asset
            </Help>
        </>,
        cell: ({ row }) => {
            const coinPrices = useSaveStore.use.coinPrices();
            const depositBalance = getDepositBalance(row.original);
            const globalDeposit = getDeposit(row.original);
            const globalInterest =
                depositBalance &&
                globalDeposit &&
                getInterestAmount(depositBalance, globalDeposit);
            const price = coinPrices[row.original.symbol as keyof Coins];
            return <div className="flex flex-col">
                <div className="text-xl font-bold">
                    {securdFormat(globalInterest, 0)}
                </div>
                <div className="text-sm text-secondary">
                    ${securdFormat(globalInterest && (globalInterest * price))}
                </div>
            </div>
        }
    },
    {
        accessorKey: "symbol",
        header: ({ column }) => <>
            Liquidity
            <Help>
                Amount of this asset available for immediate withdrawal
            </Help>
        </>,
        cell: ({ row }) => {
            const coinPrices = useSaveStore.use.coinPrices();
            const liquidity = getPoolLiquidity(row.original);
            const price = coinPrices[row.original.symbol as keyof Coins];
            return <div className="flex flex-col">
                <div className="text-xl font-bold">
                    {securdFormat(liquidity, 0)}
                </div>
                <div className="text-sm text-secondary">
                    ${securdFormat(liquidity && (liquidity * price))}
                </div>
            </div>
        }
    },
    {
        accessorKey: "symbol",
        header: ({ column }) => <>
            Utilization
            <Help>
                Proportion of borrowed assets in this lending pool
            </Help>
        </>,
        cell: ({ row }) => {
            const utilization = getPoolUtilization(row.original);
            return <div className="text-xl font-bold">{toFormattedPercentage(utilization, 1)}</div>
        }
    },
    {
        accessorKey: "symbol",
        header: ({ column }) => <>
            Savings APY
            <Help>
                Current yield for this asset
            </Help>
        </>,
        cell: ({ row }) => {
            const poolAPY = getSavingApy(row.original);
            return <div className="text-xl font-bold">{toFormattedPercentage(poolAPY, 1)}</div>
        }
    }
]



export default function AllAccounts() {
    const reservesInfo = useSaveStore.use.reservesInfo();
    const [sorting, setSorting] = useState<SortingState>([])


    return <div className="mt-4 mb-16">
        <h2 className="text-xl font-bold my-4">All Accounts ({reservesInfo.length})</h2>
        <div className="flex flex-row justify-between">
            <div className="text-secondary text-sm">
                Sort by
                <Button
                    className={cn("ml-2 rounded-full px-2 h-6",
                        sorting[0]?.id === "symbol" && "bg-securdPrimary text-white"
                    )}
                    onClick={() => setSorting([{ id: "symbol", desc: false }])}
                >APY</Button>
            </div>
        </div>
        <DataTable columns={columns} data={reservesInfo} sorting={sorting} setSorting={setSorting} />
    </div>
}