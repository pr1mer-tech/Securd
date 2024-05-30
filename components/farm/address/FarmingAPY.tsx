"use client";

import Help from "@/components/ui/Help";
import {
    Table,
    TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import PercentageFormat from "@/components/utils/PercentageFormat";
import SecurdFormat from "@/components/utils/SecurdFormat";
import { useFarmAddressStore } from "@/lib/data/farmAddressStore";

export default function FarmingAPY() {
    const { lpApy, borrowApy, leverage } = useFarmAddressStore((state) => ({
        lpApy: state.lpApy(),
        borrowApy: state.borrowApy(),
        leverage: state.leverage()
    }));

    return <Table className="text-center">
        <TableHeader>
            <TableRow>
                <TableHead className="font-bold pl-0 text-center border-r">
                    Fee APY
                    <Help>
                        Estimated yield for this LP Token based on last 7 days trading fees
                    </Help>
                </TableHead>
                <TableHead className="font-bold text-center border-r">
                    Borrow APY
                    <Help>
                        Current average borrowing rate for this account
                    </Help>
                </TableHead>
                <TableHead className="font-bold text-center">
                    Leverage
                    <Help>
                        Current position multiplier for this account
                    </Help>
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow>
                <TableCell className="pl-0 border-r">
                    <PercentageFormat value={lpApy} />
                </TableCell>
                <TableCell className="border-r">
                    <PercentageFormat value={borrowApy} />
                </TableCell>
                <TableCell>
                    <SecurdFormat value={leverage} prefix="&times;" />
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>;
}