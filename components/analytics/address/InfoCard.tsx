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
import { useAnalyticsAddressStore } from "@/lib/data/analyticsAddressStore";
import { ArrowRightLeft } from "lucide-react";
import PercentageFormat from "@/components/utils/PercentageFormat";
import MrmScore from "../score";

export default function InfoCard({ poolInfo, className }: { poolInfo: PoolDetails, className?: string }) {
    const userCollateralInfo = analyticsToCollateralInfo(poolInfo, poolInfo?.analytics?.[0] ?? null);
    const tokenDirection = useAnalyticsAddressStore.use.tokenDirection();
    return <Card className={cn("p-4 w-full", className)}>
        <Table className="text-center">
            <TableHeader>
                <TableRow>
                    <TableHead className="font-bold pl-0 text-center border-r">
                        Pool
                    </TableHead>
                    <TableCell className="font-bold text-center flex items-center" onClick={() => useAnalyticsAddressStore.setState((state) => ({ tokenDirection: !state.tokenDirection }))}>
                        <PairIcon reservesInfo={poolInfo?.reservesInfo} userCollateralsInfo={userCollateralInfo} size="small" className="w-36" swapDirection={tokenDirection} />
                        <ArrowRightLeft className="ml-1 w-4 h-4 text-gray-400 cursor-pointer" />
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
                        <PercentageFormat
                            value={poolInfo?.analytics?.[0]?.volatility_score ?? undefined}
                            decimals={2}
                            className="font-bold ml-2"
                        />
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableHead className="font-bold pl-0 text-center border-r">
                        Volatility Grade
                        <Help>
                            Volatility grade of the pool
                        </Help>
                    </TableHead>
                    <TableCell>
                        <MrmScore score={poolInfo?.analytics?.[0]?.mrm ?? 0} />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </Card>
}