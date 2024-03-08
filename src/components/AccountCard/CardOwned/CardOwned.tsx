"use client";
import React, { FC, useMemo } from "react";
import ConvertedPriceLabel from "@/components/ConvertedPriceLabel/ConvertedPriceLabel";
import TableText from "@/components/TableText/TableText";
import Tooltip from "@/components/Tooltip/Tooltip";
import { Table, TableRow, TableTitle } from "./CardOwned.styled";
import { TableTextType } from "@/utils/types/enums";
import { getInterestAmount } from "@/utils/helpers/lenderDeposit.helpers";
import { securdFormat } from "@/utils/helpers/numberFormat.helpers";
import { ReserveInfo } from "@/utils/types/save.types";
import useUserDepositBalance from "@/utils/hooks/useUserDepositBalance";
import useGetLenderSupply from "@/utils/hooks/wagmiSH/viewFunctions/useGetLenderSupply";

type Props = {
  reserveInfo: ReserveInfo;
  price: number;
};

const CardOwned: FC<Props> = ({ reserveInfo, price }) => {
  const { userDepositBalance } = useUserDepositBalance(reserveInfo);

  const { userDeposit } = useGetLenderSupply(reserveInfo.address);

  const userInterest = useMemo(() => {
    return getInterestAmount(userDepositBalance, userDeposit);
  }, [userDepositBalance, userDeposit]);

  return (
    <Table>
      <tbody>
        <TableRow>
          <TableTitle>
            <Tooltip title="Account Balance" textCentered={true}>
              Savings value (Deposit+Interest) for this account
            </Tooltip>
          </TableTitle>
          <td>
            <TableText
              type={TableTextType.TITLE}
              label={`${securdFormat(userDepositBalance, 3)}`}
            />
          </td>
          <td>
            <ConvertedPriceLabel
              amount={userDepositBalance}
              price={price}
              fontSize="15px"
            />
          </td>
        </TableRow>
        <TableRow>
          <td>
            <TableText
              type={TableTextType.BODY}
              label={
                <Tooltip title="Deposit" textCentered={true}>
                  Deposited amount in this account
                </Tooltip>
              }
            />
          </td>
          <td>
            <TableText
              type={TableTextType.BODY}
              label={`${securdFormat(userDeposit, 3)}`}
            />
          </td>
          <td>
            <ConvertedPriceLabel
              amount={userDeposit}
              price={price}
              fontSize="14px"
            />
          </td>
        </TableRow>
        <TableRow>
          <td>
            <TableText
              type={TableTextType.BODY}
              label={
                <Tooltip title="Interest" textCentered={true}>
                  Accrued interest in this account
                </Tooltip>
              }
            />
          </td>
          <td>
            <TableText
              type={TableTextType.BODY}
              label={securdFormat(userInterest, 3)}
            />
          </td>
          <td>
            <ConvertedPriceLabel
              amount={userInterest}
              price={price}
              fontSize="14px"
            />
          </td>
        </TableRow>
      </tbody>
    </Table>
  );
};

export default CardOwned;
