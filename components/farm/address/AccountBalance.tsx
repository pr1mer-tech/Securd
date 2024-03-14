"use client";

import Help from "@/components/ui/Help";
import {
    Table,
    TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import PercentageFormat from "@/components/utils/PercentageFormat";
import SecurdFormat from "@/components/utils/SecurdFormat";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";
import PairIcon from "../PairIcon";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { getPairPrice, getPairReservesInfos, getTokensSymbol } from "@/lib/helpers/borrow.helpers";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { securdFormat } from "@/lib/helpers/numberFormat.helpers";
import getPairBorrowBalances from "@/lib/hooks/getPairBorrowBalances";

export default function AccountBalance() {
    const collateralInfo = useFarmAddressStore.use.collateralInfo?.();
    const collateralAmountPrice = useFarmAddressStore.use.collateralAmountPrice?.();
    const reservesInfo = useFarmAddressStore.use.reservesInfo?.();
    const coinPrices = useFarmAddressStore.use.coinPrices?.();
    const collateralProportions = useFarmAddressStore.use.collateralProportions?.();
    const tokensUn = getTokensSymbol(collateralInfo);

    const pairReservesInfosUn = getPairReservesInfos(reservesInfo, tokensUn);

    const borrowBalances = getPairBorrowBalances(
        collateralAmountPrice?.debts,
        pairReservesInfosUn.reserveInfoTokenA,
        pairReservesInfosUn.reserveInfoTokenB
    );

    const tokensUSDPrices = getPairPrice(coinPrices, reservesInfo, tokensUn);

    let loanAUSD = borrowBalances?.borrowBalanceA && tokensUSDPrices.tokenA ? borrowBalances.borrowBalanceA * tokensUSDPrices.tokenA : 0;
    let loanBUSD = borrowBalances?.borrowBalanceB && tokensUSDPrices.tokenB ? borrowBalances.borrowBalanceB * tokensUSDPrices.tokenB : 0;

    return <Table className="text-center">
        <TableHeader>
            <TableRow>
                <TableHead className="font-bold pl-0 text-center border-r">
                    Asset
                </TableHead>
                <TableHead className="font-bold text-center border-r">
                    {collateralInfo
                        ? <PairIcon reservesInfo={reservesInfo} userCollateralsInfo={collateralInfo} size="small" className="w-36" />
                        : <Skeleton className="w-8 h-6" />}
                </TableHead>
                <TableHead className="font-bold text-center border-r">
                    {pairReservesInfosUn.reserveInfoTokenA ? <div className="">
                        <Image
                            className="rounded-full inline mr-1"
                            src={pairReservesInfosUn.reserveInfoTokenA?.imgSrc}
                            alt={pairReservesInfosUn.reserveInfoTokenA?.symbol}
                            width={24}
                            height={24} />
                        {pairReservesInfosUn.reserveInfoTokenA?.symbol}
                    </div> : <Skeleton className="w-8 h-6" />}
                </TableHead>
                <TableHead className="font-bold text-center">
                    {pairReservesInfosUn.reserveInfoTokenB ? <div className="">
                        <Image
                            className="rounded-full inline mr-1"
                            src={pairReservesInfosUn.reserveInfoTokenB?.imgSrc}
                            alt={pairReservesInfosUn.reserveInfoTokenB?.symbol}
                            width={24}
                            height={24} />
                        {pairReservesInfosUn.reserveInfoTokenB?.symbol}
                    </div> : <Skeleton className="w-8 h-6" />}
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow>
                <TableHead className="font-bold pl-0 text-center border-r">
                    Collateral
                    <Help>
                        Value of locked assets backing your loans in this account
                    </Help>
                </TableHead>
                <TableCell className="border-r">
                    <SecurdFormat
                        value={bigIntToDecimal(collateralAmountPrice?.collateralAmount, collateralInfo?.decimals)}
                        decimals={2}
                        className="font-bold ml-2"
                    />
                    <div className="text-xs text-secondary ml-2">
                        ${securdFormat(bigIntToDecimal(collateralAmountPrice?.collateralValue, collateralInfo?.decimals), 2)}
                    </div>
                </TableCell>
                <TableCell className="border-r">
                    <SecurdFormat
                        value={bigIntToDecimal(collateralProportions?.proportions.tokenA, pairReservesInfosUn.reserveInfoTokenA?.decimals)}
                        decimals={2}
                        className="font-bold ml-2"
                    />
                    <div className="text-xs text-secondary ml-2">
                        ${securdFormat((bigIntToDecimal(
                            collateralProportions?.proportions.tokenA,
                            pairReservesInfosUn.reserveInfoTokenA?.decimals) ?? 0) * tokensUSDPrices.tokenA, 2)}
                    </div>
                </TableCell>
                <TableCell>
                    <SecurdFormat
                        value={bigIntToDecimal(collateralProportions?.proportions.tokenB, pairReservesInfosUn.reserveInfoTokenB?.decimals)}
                        decimals={2}
                        className="font-bold ml-2"
                    />
                    <div className="text-xs text-secondary ml-2">
                        ${securdFormat((bigIntToDecimal(
                            collateralProportions?.proportions.tokenB,
                            pairReservesInfosUn.reserveInfoTokenB?.decimals) ?? 0) * tokensUSDPrices.tokenB, 2)}
                    </div>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableHead className="font-bold pl-0 text-center border-r">
                    Loan
                    <Help>
                        Value of loans in this account
                    </Help>
                </TableHead>
                <TableCell />
                <TableCell className="border-x">
                    <SecurdFormat
                        value={borrowBalances?.borrowBalanceA}
                        decimals={2}
                        className="font-bold ml-2"
                    />
                    <div className="text-xs text-secondary ml-2">
                        ${loanAUSD.toFixed(2)}
                    </div>
                </TableCell>
                <TableCell>
                    <SecurdFormat
                        value={borrowBalances?.borrowBalanceB}
                        decimals={2}
                        className="font-bold ml-2"
                    />
                    <div className="text-xs text-secondary ml-2">
                        ${loanBUSD.toFixed(2)}
                    </div>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>;
}