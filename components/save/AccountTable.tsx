import {
    Table,
    TableBody, TableCell, TableRow
} from "@/components/ui/table";
import Help from "../ui/Help";
import { securdFormat } from "@/lib/helpers/numberFormat.helpers";
import { ReserveInfo } from "@/lib/types/save.types";
import { Address } from "viem";

export function AccountTable({
    userDepositBalance,
    price,
    userDeposit,
    userReserveInfo,
    userInterest
}: {
    userDepositBalance: number;
    price: number;
    userDeposit: number;
    userReserveInfo: ReserveInfo;
    userInterest: number;
}) {
    return <Table>
        <TableBody>
            <TableRow>
                <TableCell className="font-bold">
                    Account Balance
                    <Help>
                        Savings value (Deposit+Interest) for this account
                    </Help>
                </TableCell>
                <TableCell className="font-bold">{securdFormat(userDepositBalance, 3)}</TableCell>
                <TableCell className="text-secondary">${securdFormat(price * userDepositBalance)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">
                    Deposit
                    <Help>
                        Deposited amount in this account
                    </Help>
                </TableCell>
                <TableCell>{securdFormat(userDeposit, 3)}</TableCell>
                <TableCell className="text-secondary">${securdFormat(price * userDeposit)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell className="font-medium">
                    Interest
                    <Help>
                        Accrued interest in this account
                    </Help>
                </TableCell>
                <TableCell>{securdFormat(userInterest, 3)}</TableCell>
                <TableCell className="text-secondary">${securdFormat(price * userInterest)}</TableCell>
            </TableRow>
        </TableBody>
    </Table>;
}

