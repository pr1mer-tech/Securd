"use client";
import { Card, CardContent } from "../ui/card";
import { Coins, ReserveInfo } from "@/lib/types/save.types";
import Image from "next/image";
import { useSaveStore } from "@/lib/data/saveStore";
import { securdFormat, toFormattedPercentage } from "@/lib/helpers/numberFormat.helpers";
import { getSavingApy } from "@/lib/helpers/lenderPool.helpers";
import { Separator } from "../ui/separator";
import {
    Table,
    TableBody, TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import Help from "../ui/Help";
import getUserDepositBalance from "@/lib/hooks/getUserDepositBalance";
import useGetLenderSupply from "@/lib/hooks/wagmiSH/viewFunctions/useGetLenderSupply";
import { useMemo } from "react";
import { getInterestAmount } from "@/lib/helpers/lenderDeposit.helpers";

export function AccountCard({ userReserveInfo }: { userReserveInfo: ReserveInfo; }) {
    const balanceLDTokens = useSaveStore.use.balanceLDTokens();
    const coinPrices = useSaveStore.use.coinPrices();
    const userDeposit = useSaveStore.use.userDeposit();

    const coin = userReserveInfo.symbol as keyof Coins;
    const price = coinPrices[coin] ?? 0;

    const savings = getSavingApy(userReserveInfo);
    const { userDepositBalance } = getUserDepositBalance(userReserveInfo, balanceLDTokens[userReserveInfo.address]);

    const userInterest = useMemo(() => {
        return getInterestAmount(userDepositBalance, userDeposit[userReserveInfo.address]);
    }, [userDepositBalance, userDeposit, userReserveInfo.address]);

    return <Card>
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
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">
                            Account Balance
                            <Help>
                                Savings value (Deposit+Interest) for this account
                            </Help>
                        </TableCell>
                        <TableCell>{securdFormat(userDepositBalance, 3)}</TableCell>
                        <TableCell>${securdFormat(price * userDepositBalance)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">
                            Deposit
                            <Help>
                                Deposited amount in this account
                            </Help>
                        </TableCell>
                        <TableCell>{securdFormat(userDeposit[userReserveInfo.address], 3)}</TableCell>
                        <TableCell>${securdFormat(price * userDeposit[userReserveInfo.address])}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">
                            Interest
                            <Help>
                                Accrued interest in this account
                            </Help>
                        </TableCell>
                        <TableCell>{securdFormat(userInterest, 3)}</TableCell>
                        <TableCell>${securdFormat(price * userInterest)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
    </Card>;
}
