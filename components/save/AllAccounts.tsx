"use client";

import Help from "@/components/ui/Help";
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"
import { Coins, ReserveInfo } from "@/lib/types/save.types";
import Image from "next/image";
import { getDepositBalance, getDeposit, getPoolLiquidity, getPoolUtilization, getSavingApy } from "@/lib/helpers/lenderPool.helpers";
import { securdFormat, toFormattedPercentage } from "@/lib/helpers/numberFormat.helpers";
import { useSaveStore } from "@/lib/data/saveStore";
import { DataTable } from "../layout/DataTable";
import { getInterestAmount } from "@/lib/helpers/lenderDeposit.helpers";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import GridIconBlack from "@/assets/icons/grid-icon-black.svg";
import MenuIconBlack from "@/assets/icons/menu-icon-black.svg";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { useBreakpoint } from "@/lib/media-queries";

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
        id: "lendingPool",
        accessorFn: (row) => getDepositBalance(row),
        sortingFn: (a, b) => {
            const coinPrices = useSaveStore.getState().coinPrices;
            const _depositBalanceA = a.getValue("lendingPool") as bigint;
            const _depositBalanceB = b.getValue("lendingPool") as bigint;
            const depositBalanceA = bigIntToDecimal(_depositBalanceA, a.original.decimals);
            const depositBalanceB = bigIntToDecimal(_depositBalanceB, b.original.decimals);
            const priceA = coinPrices[a.original.symbol as keyof Coins];
            const priceB = coinPrices[b.original.symbol as keyof Coins];
            const valueA = depositBalanceA * priceA;
            const valueB = depositBalanceB * priceB;

            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        },
        header: ({ column }) => <>
            Lending Pool
            <Help>
                Total Savings value (Deposit+Interest) for all depositors of this
                asset
            </Help>
        </>,
        cell: ({ row }) => {
            const coinPrices = useSaveStore.use.coinPrices();
            const _depositBalance = row.getValue("lendingPool") as bigint;
            const depositBalance = bigIntToDecimal(_depositBalance, row.original.decimals);
            const price = coinPrices[row.original.symbol as keyof Coins];
            return <div className="flex flex-col">
                <div className="text-xl font-bold">
                    {securdFormat(depositBalance, 2)}
                </div>
                <div className="text-sm text-secondary">
                    ${securdFormat(depositBalance && (depositBalance * price))}
                </div>
            </div>
        }
    },
    {
        id: "deposit",
        accessorFn: (row) => getDeposit(row),
        header: ({ column }) => <>
            Deposit
            <Help>
                Total deposited amount for all depositors of this asset
            </Help>
        </>,
        cell: ({ row }) => {
            const coinPrices = useSaveStore.use.coinPrices();
            const globalDeposit = bigIntToDecimal(row.getValue("deposit") as bigint, row.original.decimals);
            const price = coinPrices[row.original.symbol as keyof Coins];
            return <div className="flex flex-col">
                <div className="text-xl font-bold">
                    {securdFormat(globalDeposit, 2)}
                </div>
                <div className="text-sm text-secondary">
                    ${securdFormat(globalDeposit && (globalDeposit * price))}
                </div>
            </div>
        }
    },
    {
        id: "interest",
        accessorFn: (row) => getInterestAmount(getDepositBalance(row), getDeposit(row)),
        header: ({ column }) => <>
            Interest
            <Help>
                Total accrued interest for all depositors of this asset
            </Help>
        </>,
        cell: ({ row }) => {
            const coinPrices = useSaveStore.use.coinPrices();
            const _globalInterest = row.getValue("interest") as bigint;
            const globalInterest = bigIntToDecimal(_globalInterest, row.original.decimals);
            const price = coinPrices[row.original.symbol as keyof Coins];
            return <div className="flex flex-col">
                <div className="text-xl font-bold">
                    {securdFormat(globalInterest, 2)}
                </div>
                <div className="text-sm text-secondary">
                    ${securdFormat(globalInterest && (globalInterest * price))}
                </div>
            </div>
        }
    },
    {
        id: "liquidity",
        accessorFn: (row) => getPoolLiquidity(row),
        header: ({ column }) => <>
            Liquidity
            <Help>
                Amount of this asset available for immediate withdrawal
            </Help>
        </>,
        cell: ({ row }) => {
            const coinPrices = useSaveStore.use.coinPrices();
            const _liquidity = row.getValue("liquidity") as bigint;
            const liquidity = bigIntToDecimal(_liquidity, row.original.decimals);
            const price = coinPrices[row.original.symbol as keyof Coins];
            return <div className="flex flex-col">
                <div className="text-xl font-bold">
                    {securdFormat(liquidity, 2)}
                </div>
                <div className="text-sm text-secondary">
                    ${securdFormat(liquidity && (liquidity * price))}
                </div>
            </div>
        }
    },
    {
        id: "utilization",
        accessorFn: (row) => getPoolUtilization(row),
        header: ({ column }) => <>
            Utilization
            <Help>
                Proportion of borrowed assets in this lending pool
            </Help>
        </>,
        cell: ({ row }) => {
            return <div className="text-xl font-bold">{toFormattedPercentage(row.getValue("utilization"), 1)}</div>
        }
    },
    {
        id: "savingsApy",
        accessorFn: (row) => getSavingApy(row),
        header: ({ column }) => <>
            Savings APY
            <Help>
                Current yield for this asset
            </Help>
        </>,
        cell: ({ row }) => {
            return <div className="text-xl font-bold">{toFormattedPercentage(row.getValue("savingsApy"), 1)}</div>
        }
    }
]



export default function AllAccounts() {
    const reservesInfo = useSaveStore.use.reservesInfo();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [mode, setMode] = useState<"table" | "grid">("table");
    const { isAboveMd } = useBreakpoint("md");

    useEffect(() => {
        if (isAboveMd) {
            setMode("table")
        } else {
            setMode("grid")
        }
    }, [isAboveMd]);


    return <Tabs value={mode} onValueChange={(v) => setMode(v as "table" | "grid")}>
        <div className="mt-4 mb-16">
            <div className="flex flex-row justify-between">
                <h2 className="text-xl font-bold my-4">All Accounts ({reservesInfo.length})</h2>
                <TabsList>
                    <TabsTrigger value="table">
                        <Image src={MenuIconBlack} alt="menu" className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="grid">
                        <Image src={GridIconBlack} alt="grid" className="w-4 h-4" />
                    </TabsTrigger>
                </TabsList>
            </div>
            <div className="w-full flex flex-col-reverse gap-2 md:gap-0 md:flex-row justify-between my-4">
                <div className="text-secondary text-sm">
                    Sort by
                    <Button
                        className={cn("ml-2 rounded-full px-2 h-6",
                            sorting[0]?.id === "savingsApy" ? "bg-securdPrimary text-white" : "bg-secondary"
                        )}
                        onClick={() => sorting[0]?.id === "savingsApy" ? setSorting([]) : setSorting([{ id: "savingsApy", desc: true }])}
                    >APY</Button>
                    <Button
                        className={cn("ml-2 rounded-full px-2 h-6",
                            sorting[0]?.id === "lendingPool" ? "bg-securdPrimary text-white" : "bg-secondary"
                        )}
                        onClick={() => sorting[0]?.id === "lendingPool" ? setSorting([]) : setSorting([{ id: "lendingPool", desc: true }])}
                    >Lending Pool</Button>
                </div>
                <div className="relative flex items-center">
                    <Input
                        placeholder="Search"
                        className="pl-8 md:w-48 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-b-black focus-visible:border-b-2"
                        value={(columnFilters.find((f) => f.id === "symbol")?.value || "") as string}
                        onChange={(e) => {
                            const value = e.target.value
                            setColumnFilters((prev) => {
                                const newFilters = prev.filter((f) => f.id !== "symbol")
                                if (value) {
                                    newFilters.push({ id: "symbol", value })
                                }
                                return newFilters
                            })
                        }}
                    />
                    <Search className="absolute left-0 w-4 h-4 ml-2" />
                </div>
            </div>
            <DataTable
                columns={columns}
                columnVisibility={mode === "grid" ? {
                    "deposit": false,
                    "interest": false,
                    "liquidity": false,
                    "utilization": false,
                } : {}}
                data={reservesInfo}
                sorting={sorting}
                setSorting={setSorting}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                linkFn={(row) => `/save/${row.address}`}
            />
        </div>
    </Tabs >
}