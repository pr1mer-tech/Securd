import {
    Table,
    TableBody, TableCell, TableRow
} from "@/components/ui/table";
import Help from "../ui/Help";
import { securdFormat } from "@/lib/helpers/numberFormat.helpers";
import type { ReserveInfo } from "@/lib/types/save.types";
import { Address } from "viem";
import { bigIntToDecimal } from "@/lib/helpers/main.helpers";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function AccountTable({
    userDepositBalance,
    price,
    userDeposit,
    userReserveInfo,
    userInterest
}: {
    userDepositBalance?: bigint;
    price: number;
    userDeposit?: bigint;
    userReserveInfo: ReserveInfo;
    userInterest: number;
}) {
    const userDepositBalanceNumber = bigIntToDecimal(userDepositBalance, userReserveInfo.decimals);
    const userDepositNumber = bigIntToDecimal(userDeposit, userReserveInfo.decimals);
    return <Table>
        <TableBody>
            <TableRow>
                <TableCell className="font-bold pl-0 whitespace-nowrap">
                    Account Balance
                    <Help>
                        Savings value (Deposit+Interest) for this account
                    </Help>
                </TableCell>
                <TableCell className="font-bold">
                    <Tooltip>
                        <TooltipTrigger>{securdFormat(userDepositBalanceNumber, 2)}</TooltipTrigger>
                        <TooltipContent>
                            {userDepositBalanceNumber}
                        </TooltipContent>
                    </Tooltip>
                </TableCell>
                <TableCell className="text-secondary pr-0">${securdFormat(price * (userDepositBalanceNumber ?? 0))}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-normal pl-0">
                    Deposit
                    <Help>
                        Deposited amount in this account
                    </Help>
                </TableCell>
                <TableCell>
                    <Tooltip>
                        <TooltipTrigger>{securdFormat(userDepositNumber, 2)}</TooltipTrigger>
                        <TooltipContent>
                            {userDepositNumber}
                        </TooltipContent>
                    </Tooltip>
                </TableCell>
                <TableCell className="text-secondary pr-0">${securdFormat(price * (userDepositNumber ?? 0))}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-normal pl-0">
                    Interest
                    <Help>
                        Accrued interest in this account
                    </Help>
                </TableCell>
                <TableCell>
                    <Tooltip>
                        <TooltipTrigger>{securdFormat(userInterest, 2)}</TooltipTrigger>
                        <TooltipContent>
                            {userInterest}
                        </TooltipContent>
                    </Tooltip>
                </TableCell>
                <TableCell className="text-secondary pr-0">${securdFormat(price * userInterest)}</TableCell>
            </TableRow>
        </TableBody>
    </Table>;
}

