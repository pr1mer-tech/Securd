"use client";
import React, { useContext, useMemo } from "react";
import {
  getInterestAmount,
  getSelectedReserveInfo,
} from "@/utils/helpers/lenderDeposit.helpers";
import ConvertedPriceLabel from "@/components/ConvertedPriceLabel/ConvertedPriceLabel";
import TableText from "@/components/TableText/TableText";
import Title from "@/components/Title/Title";
import { MainContext } from "@/context/Main.context";
import { main } from "@/app/styles/theme.styled";
import { CardTitleWrapper } from "../TopFirstCard.styled";
import {
  BalanceTable,
  MainColCell,
  TopTableWrapper,
} from "./WalletTable.styled";
import { Coins } from "@/utils/types/save.types";
import Tooltip from "@/components/Tooltip/Tooltip";
import { SaveContext } from "@/context/Save.context";
import { TableTextType } from "@/utils/types/enums";
import { securdFormatFloor } from "@/utils/helpers/numberFormat.helpers";
import { useParams } from "next/navigation";
import { Address } from "viem";
import useUserDepositBalance from "@/utils/hooks/useUserDepositBalance";
import useGetLenderSupply from "@/utils/hooks/wagmiSH/viewFunctions/useGetLenderSupply";

const WalletTable = () => {
  const params = useParams();

  const { windowWidth, coinPrices } = useContext(MainContext);
  const { pool, reservesInfo } = useContext(SaveContext);

  const selectedReserveInfo = useMemo(() => {
    return getSelectedReserveInfo(reservesInfo, params?.address as Address);
  }, [reservesInfo, params]);

  const { userDepositBalance } = useUserDepositBalance(selectedReserveInfo);

  const { userDeposit } = useGetLenderSupply(
    selectedReserveInfo?.address as Address
  );

  const userInterest = useMemo(() => {
    return getInterestAmount(userDepositBalance, userDeposit);
  }, [userDepositBalance, userDeposit]);

  const price = useMemo(() => {
    return coinPrices[selectedReserveInfo?.symbol as keyof Coins];
  }, [selectedReserveInfo, coinPrices]);

  return (
    <TopTableWrapper
      borderRadius={windowWidth > 1100 ? "20px 0 0 20px" : "20px 20px 0 0"}
    >
      <CardTitleWrapper>
        <Title
          priority={2}
          label={`My ${pool?.asset.fa12?.symbol || ""} balance`}
          color={main.colors.securdPrimary}
        />
      </CardTitleWrapper>
      <BalanceTable>
        <tbody>
          <tr>
            <MainColCell padding="0.5rem 0" fontWeight={900}>
              <Tooltip title="Account Balance" textCentered={true}>
                Savings value (Deposit+Interest) for this account
              </Tooltip>
            </MainColCell>
            <td>
              <TableText
                type={TableTextType.WALLET_TABLE_TEXT}
                label={securdFormatFloor(userDepositBalance, 2)}
              />
            </td>
            <td>
              <ConvertedPriceLabel
                amount={userDepositBalance}
                price={price}
                fontSize="1.35rem"
              />
            </td>
          </tr>
          <tr>
            <MainColCell fontWeight={500} padding="0.5rem 0">
              <Tooltip title="Deposit" textCentered={true}>
                Deposited amount in this account
              </Tooltip>
            </MainColCell>
            <td>
              <TableText
                type={TableTextType.WALLET_TABLE_TEXT}
                label={securdFormatFloor(userDeposit, 2)}
              />
            </td>
            <td>
              <ConvertedPriceLabel
                amount={userDeposit}
                price={price}
                fontSize="1.35rem"
              />
            </td>
          </tr>
          <tr>
            <MainColCell fontWeight={500} padding="0.5rem 0">
              <Tooltip title="Interest" textCentered={true}>
                Accrued interest in this account
              </Tooltip>
            </MainColCell>
            <td>
              <TableText
                type={TableTextType.WALLET_TABLE_TEXT}
                label={securdFormatFloor(userInterest, 2)}
              />
            </td>
            <td>
              <ConvertedPriceLabel
                amount={userInterest}
                price={price}
                fontSize="1.35rem"
              />
            </td>
          </tr>
        </tbody>
      </BalanceTable>
    </TopTableWrapper>
  );
};

export default WalletTable;
