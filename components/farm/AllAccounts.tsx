"use client";

import Help from "@/components/ui/Help";
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"
import { Coins, ReserveInfo } from "@/lib/types/save.types";
import Image from "next/image";
import { DataTable } from "../layout/DataTable";
import { getInterestAmount } from "@/lib/helpers/lenderDeposit.helpers";
import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import GridIconBlack from "@/assets/icons/grid-icon-black.svg";
import MenuIconBlack from "@/assets/icons/menu-icon-black.svg";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { useFarmStore } from "@/lib/data/farmStore";
import { CollateralInfos } from "@/lib/types/farm.types";
import PairIcon from "./PairIcon";
import { securdFormat } from "@/lib/helpers/numberFormat.helpers";
import { CollateralAmountPrice } from "@/lib/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import { Skeleton } from "../ui/skeleton";
import { getBorrowAPY, getBorrowAPYLP, getBorrowerPoolBalanceLT, getBorrowerPoolMaxLeverage, getMaxLT, getMaxLpApy, getPairBorrowApy, getPairPrice, getPairReservesInfos, getTokensSymbol } from "@/lib/helpers/borrow.helpers";
import PercentageFormat from "../utils/PercentageFormat";
import SecurdFormat from "../utils/SecurdFormat";
import getPairBorrowBalances from "@/lib/hooks/getPairBorrowBalances";
import { getPoolAPY } from "@/lib/helpers/lenderPool.helpers";

export const columns: ColumnDef<{
    collateralInfos: CollateralInfos,
    collateralPoolBalance: bigint,
    collateralPrice: bigint,
    collateralPoolPrice: CollateralAmountPrice,
    reservesInfo: ReserveInfo[],
    coinPrices: Record<keyof Coins, number>
}>[] = [
        {
            id: "symbol",
            accessorFn: (row) => row.collateralInfos.symbol,
            header: "LP Token",
            cell: ({ row }) => (
                <PairIcon userCollateralsInfo={row.original.collateralInfos} size="small" className="w-36" reservesInfo={row.original.reservesInfo} />
            )
        },
        {
            accessorKey: "collateralPoolBalance",
            header: ({ column }) => <>
                Collateral Pool
                <Help>
                    Total Collateral value for all Farmers of this LP Token
                </Help>
            </>,
            cell: ({ row }) => {
                const collateralPoolBalance = row.getValue("collateralPoolBalance") as bigint ?? 0n;
                const collateralPrice = row.original.collateralPrice ?? 0n;

                const balance = bigIntToDecimal(collateralPoolBalance, row.original.collateralInfos.decimals);
                const price = bigIntToDecimal(collateralPrice * collateralPoolBalance, row.original.collateralInfos.decimals * 2);

                return <div className="flex flex-col">
                    <div className="text-xl font-bold">
                        <SecurdFormat value={balance} />
                    </div>
                    <div className="text-sm text-secondary">
                        ${securdFormat(price)}
                    </div>
                </div>
            }
        },
        {
            id: "minLT",
            accessorFn: (row) => getBorrowerPoolBalanceLT(row.collateralInfos),
            header: ({ column }) => <>
                Min LT
                <Help>
                    Liquidation Threshold that applies when your loans value in both
                    assets are equal
                </Help>
            </>,
            cell: ({ row }) => {
                const minLT = row.getValue("minLT") as number;
                return <div className="text-xl font-bold">
                    <PercentageFormat value={minLT} />
                </div>
            }
        },
        {
            id: "maxLT",
            accessorFn: (row) => getMaxLT(row.collateralInfos),
            header: ({ column }) => <>
                Max LT
                <Help>
                    Liquidation Threshold that applies when you only borrow one
                    asset
                </Help>
            </>,
            cell: ({ row }) => {
                const maxLT = row.getValue("maxLT") as number;
                return <div className="text-xl font-bold">
                    <PercentageFormat value={maxLT} />
                </div>
            }
        },
        {
            id: "maxLeverage",
            accessorFn: (row) => getBorrowerPoolMaxLeverage(row.collateralInfos),
            header: ({ column }) => <>
                Max Leverage
                <Help>
                    Maximum position multiplier allowed for this LP Token
                </Help>
            </>,
            cell: ({ row }) => {
                const maxLeverage = row.getValue("maxLeverage") as number;
                return <div className="text-xl font-bold">
                    <SecurdFormat prefix="&times;" value={maxLeverage} />
                </div>
            }
        },
        {
            id: "borrowApy",
            accessorFn: (row) => {
                const tokensUn = getTokensSymbol(row.collateralInfos);
                const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB } =
                    getPairBorrowApy(row.reservesInfo, tokensUn);

                return getBorrowAPYLP(borrowPoolAPYA, borrowPoolAPYB)
            },
            header: ({ column }) => <>
                Borrow APY
                <Help>
                    Current average borrowing rate for this token pair
                </Help>
            </>,
            cell: ({ row }) => {
                const borrowApy = row.getValue("borrowApy") as number;
                if (!borrowApy) return <Skeleton className="w-8 h-4" />;
                return <div className="text-xl font-bold">
                    <PercentageFormat value={borrowApy} />
                </div>
            }
        },
        {
            id: "lpApy",
            accessorFn: (row) => {
                // MARK: ANTHONY wanted to have this to be fixed for a demo purpose
                const lpApr = 0.089;

                const lpApy =
                    lpApr !== undefined ? getPoolAPY(undefined, lpApr) : undefined;
                return lpApy;
            },
            header: ({ column }) => <>
                LP APY
                <Help>
                    Estimated yield for this LP Token based on last 7 days trading
                    fees
                </Help>
            </>,
            cell: ({ row }) => {
                const lpApy = row.getValue("lpApy") as number;
                if (!lpApy) return <Skeleton className="w-8 h-4" />;
                return <div className="text-xl font-bold">
                    <PercentageFormat value={lpApy} />
                </div>
            }
        },
        {
            id: "maxLeverageAPY",
            accessorFn: (row) => {
                const maxLeverage = getBorrowerPoolMaxLeverage(row.collateralInfos)

                const tokensUn = getTokensSymbol(row.collateralInfos);
                const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB } =
                    getPairBorrowApy(row.reservesInfo, tokensUn);

                const borrowLpApy = getBorrowAPYLP(borrowPoolAPYA, borrowPoolAPYB)
                // MARK: ANTHONY wanted to have this to be fixed for a demo purpose
                const lpApr = 0.089;

                const lpApy =
                    lpApr !== undefined ? getPoolAPY(undefined, lpApr) : undefined;

                return getMaxLpApy(maxLeverage, borrowLpApy, lpApy);
            },
            header: ({ column }) => <>
                Max Leverage APY
                <Help>
                    Estimated Farming APY when using Max Leverage
                </Help>
            </>,
            cell: ({ row }) => {
                const maxLeverageAPY = row.getValue("maxLeverageAPY") as number;
                if (!maxLeverageAPY) return <Skeleton className="w-8 h-4" />;
                return <div className="text-xl font-bold">
                    <PercentageFormat value={maxLeverageAPY} />
                </div>
            }
        }
    ]



export default function AllAccounts() {
    const collateralInfos = useFarmStore.use.collateralsInfos();
    const collateralAmountPrices = useFarmStore.use.collateralAmountPrice();
    const collateralPoolBalances = useFarmStore.use.collateralPoolBalances();
    const collateralProportions = useFarmStore.use.collateralProportions();
    const reservesInfo = useFarmStore.use.reservesInfo();
    const coinPrices = useFarmStore.use.coinPrices();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [mode, setMode] = useState<"table" | "grid">("table");

    const data = collateralInfos.map((collateralInfo) => {
        return {
            collateralInfos: collateralInfo,
            collateralPoolBalance: collateralPoolBalances[collateralInfo.addressLP],
            collateralPoolPrice: collateralAmountPrices[collateralInfo.addressLP],
            collateralPrice: collateralProportions[collateralInfo.addressLP]?.collateralPrice,
            reservesInfo: reservesInfo,
            coinPrices: coinPrices,
        }
    })

    const toggleSorting = (id: string) => {
        setSorting((prev) => {
            const isAlreadySorted = prev.some((s) => s.id === id);
            if (isAlreadySorted) {
                return [];
            } else {
                return [{ id, desc: true }];
            }
        });
    }

    return <Tabs value={mode} onValueChange={(v) => setMode(v as "table" | "grid")}>
        <div className="mt-4 mb-16">
            <div className="flex flex-row justify-between">
                <h2 className="text-xl font-bold my-4">All Accounts ({collateralInfos.length})</h2>
                <TabsList>
                    <TabsTrigger value="table">
                        <Image src={MenuIconBlack} alt="menu" className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="grid">
                        <Image src={GridIconBlack} alt="grid" className="w-4 h-4" />
                    </TabsTrigger>
                </TabsList>
            </div>
            <div className="flex flex-row justify-between my-4">
                <div className="text-secondary text-sm">
                    Sort by
                    <Button
                        className={cn("ml-2 rounded-full px-2 h-6",
                            sorting.find((s) => s.id === "borrowApy")
                                ? "bg-securdPrimary text-white"
                                : "bg-secondary"
                        )}
                        onClick={() => toggleSorting("borrowApy")}
                    >
                        Borrow APY
                    </Button>
                    <Button
                        className={cn("ml-2 rounded-full px-2 h-6",
                            sorting.find((s) => s.id === "lpApy")
                                ? "bg-securdPrimary text-white"
                                : "bg-secondary"
                        )}
                        onClick={() => toggleSorting("lpApy")}
                    >
                        LP APY
                    </Button>
                    <Button
                        className={cn("ml-2 rounded-full px-2 h-6",
                            sorting.find((s) => s.id === "maxLeverageAPY")
                                ? "bg-securdPrimary text-white"
                                : "bg-secondary"
                        )}
                        onClick={() => toggleSorting("maxLeverageAPY")}
                    >
                        Max Leverage APY
                    </Button>
                    <Button
                        className={cn("ml-2 rounded-full px-2 h-6",
                            sorting.find((s) => s.id === "collateralPoolBalance")
                                ? "bg-securdPrimary text-white"
                                : "bg-secondary"
                        )}
                        onClick={() => toggleSorting("collateralPoolBalance")}
                    >
                        Collateral Pool
                    </Button>
                </div>
                <div className="relative flex items-center">
                    <Input
                        placeholder="Search"
                        className="pl-8 w-48 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-b-black focus-visible:border-b-2"
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
                    "minLT": false,
                    "maxLT": false,
                    "maxLeverage": false,
                    "lpApy": false,
                } : {}}
                data={data}
                sorting={sorting}
                setSorting={setSorting}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                linkFn={(row) => `/farm/${row.collateralInfos.addressLP}`}
            />
        </div>
    </Tabs >
}