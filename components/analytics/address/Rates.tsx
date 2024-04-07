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
import PercentageFormat from "@/components/utils/PercentageFormat";
import SecurdFormat from "@/components/utils/SecurdFormat";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function Rates({ poolInfo, className }: { poolInfo: PoolDetails, className?: string }) {
    const userCollateralInfo = analyticsToCollateralInfo(poolInfo, poolInfo.analytics?.[0] ?? null);

    return <Card className={cn("p-4 w-full", className)}>
        <Table className="text-center">
            <TableHeader>
                <TableRow>
                    <TableHead className="font-bold pl-0 text-center border-r">
                        Borrow Rate {poolInfo?.token_0?.token_symbol}
                    </TableHead>
                    <TableCell className="font-bold text-center">

                    </TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableHead className="font-bold pl-0 text-center border-r">
                        Borrow Rate {poolInfo?.token_1?.token_symbol}
                    </TableHead>
                    <TableCell>

                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableHead className="font-bold pl-0 text-center border-r">
                        Leverage
                    </TableHead>
                    <TableCell>

                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </Card>
}