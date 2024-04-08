"use client";

import PairIcon from "@/components/farm/PairIcon";
import { Card } from "@/components/ui/card";
import { PoolDetails, PoolTableRows, analyticsToCollateralInfo, tokenToReserveInfo } from "@/lib/helpers/analytics.helper";
import { cn } from "@/lib/utils";
import Help from "@/components/ui/Help";
import {
    Table,
    TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import SecurdFormat from "@/components/utils/SecurdFormat";

export default function InfoCard({ poolInfo, className }: { poolInfo: PoolDetails, className?: string }) {
    const userCollateralInfo = analyticsToCollateralInfo(poolInfo, poolInfo?.analytics?.[0] ?? null);

    return <Card className={cn("p-4 w-full", className)}>
        <Table className="text-center">
            <TableHeader>
                <TableRow>
                    <TableHead className="font-bold pl-0 text-center border-r">
                        Pool
                    </TableHead>
                    <TableCell className="font-bold text-center">
                        <PairIcon reservesInfo={poolInfo?.reservesInfo} userCollateralsInfo={userCollateralInfo} size="small" className="w-36" />
                    </TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableHead className="font-bold pl-0 text-center border-r">
                        Volatility Score
                        <Help>
                            Volatility score of the pool
                        </Help>
                    </TableHead>
                    <TableCell>
                        <SecurdFormat
                            value={poolInfo?.analytics?.[0]?.volatility_score ?? undefined}
                            decimals={2}
                            className="font-bold ml-2"
                        />
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableHead className="font-bold pl-0 text-center border-r">
                        Liquidity Score
                        <Help>
                            Liquidity score of the pool
                        </Help>
                    </TableHead>
                    <TableCell>
                        <SecurdFormat
                            value={poolInfo?.analytics?.[0]?.liquidity_score ?? undefined}
                            decimals={2}
                            className="font-bold ml-2"
                        />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </Card>
}