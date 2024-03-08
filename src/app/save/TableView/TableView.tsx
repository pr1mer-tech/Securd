"use client";
import React, { useContext } from "react";
import { useRouter } from "next/navigation";
import { SaveContext } from "@/context/Save.context";
import CryptoLogo from "@/components/CryptoLogo/CryptoLogo";
import TableText from "@/components/TableText/TableText";
import Title from "@/components/Title/Title";
import ConvertedPriceLabel from "@/components/ConvertedPriceLabel/ConvertedPriceLabel";
import Tooltip from "@/components/Tooltip/Tooltip";
import Table from "@/components/Table/Table";
import TableRow from "@/components/TableRow/TableRow";
import { AssetLabel } from "./TableView.styled";
import { Coins, ReserveInfo } from "@/utils/types/save.types";
import {
  getDeposit,
  getDepositBalance,
  getPoolLiquidity,
  getPoolUtilization,
  getSavingApy,
} from "@/utils/helpers/lenderPool.helpers";
import {
  securdFormat,
  toFormattedPercentage,
} from "@/utils/helpers/numberFormat.helpers";
import { TableTextType } from "@/utils/types/enums";
import { MainContext } from "@/context/Main.context";
import { getInterestAmount } from "@/utils/helpers/lenderDeposit.helpers";

const TableView = () => {
  const router = useRouter();

  const { reservesInfo, search, sortAccounts } = useContext(SaveContext);
  const { coinPrices } = useContext(MainContext);

  return (
    <div data-test-id="save-table-view">
      <Table
        columns={[
          "Asset",
          <Tooltip key={1} title="Lending Pool">
            Total Savings value (Deposit+Interest) for all depositors of this
            asset
          </Tooltip>,
          <Tooltip key={2} title="Deposit">
            Total deposited amount for all depositors of this asset
          </Tooltip>,
          <Tooltip key={3} title="Interest">
            Total accrued interest for all depositors of this asset
          </Tooltip>,
          <Tooltip key={4} title="Liquidity">
            Amount of this asset available for immediate withdrawal
          </Tooltip>,
          <Tooltip key={5} title="Utilization">
            Proportion of borrowed assets in this lending pool
          </Tooltip>,
          <Tooltip key={6} title="Saving APY">
            Current yield for this asset
          </Tooltip>,
        ]}
        margin="2rem 0"
      >
        {reservesInfo?.map((reserveInfo: ReserveInfo) => {
          const poolAPY = getSavingApy(reserveInfo);
          const depositBalance = getDepositBalance(reserveInfo);
          const globalDeposit = getDeposit(reserveInfo);
          const globalInterest =
            depositBalance &&
            globalDeposit &&
            getInterestAmount(depositBalance, globalDeposit);
          const liquidity = getPoolLiquidity(reserveInfo);
          const utilization = getPoolUtilization(reserveInfo);
          const price = coinPrices[reserveInfo.symbol as keyof Coins];

          return {
            poolAPY,
            depositBalance,
            globalDeposit,
            globalInterest,
            liquidity,
            utilization,
            price,
            reserveInfo,
          };
        })
          .filter((data) => {
            return data.reserveInfo.symbol
              .toLowerCase()
              .includes(search.toLowerCase());
          })
          .toSorted((a, b) => {
            if (sortAccounts.apy) {
              return (b.poolAPY ?? 0) - (a.poolAPY ?? 0);
            }
            return (b.depositBalance ?? 0) - (a.depositBalance ?? 0);
          })
          .map(({
            poolAPY,
            depositBalance,
            globalDeposit,
            globalInterest,
            liquidity,
            utilization,
            price,
            reserveInfo
          }, key: number) => (
            <TableRow
              padding="1rem"
              border
              key={key}
              onClick={() => router.push(`/save/${reserveInfo.address}`)}
            >
              <AssetLabel data-test-id="save-table-card-label">
                <CryptoLogo
                  crypto={reserveInfo.imgSrc}
                  width={40}
                  height={40}
                />
                <Title priority={3} label={reserveInfo.symbol} />
              </AssetLabel>
              <td>
                <TableText
                  type={TableTextType.EMPHASIS}
                  label={`${securdFormat(depositBalance, 0)}`}
                />
                <ConvertedPriceLabel amount={depositBalance} price={price} />
              </td>
              <td>
                <TableText
                  type={TableTextType.EMPHASIS}
                  label={`${securdFormat(globalDeposit, 0)}`}
                />
                <ConvertedPriceLabel amount={globalDeposit} price={price} />
              </td>
              <td>
                <TableText
                  type={TableTextType.EMPHASIS}
                  label={`${securdFormat(globalInterest, 0)}`}
                />
                <ConvertedPriceLabel amount={globalInterest} price={price} />
              </td>
              <td>
                <TableText
                  type={TableTextType.EMPHASIS}
                  label={`${securdFormat(liquidity, 0)}`}
                />
                <ConvertedPriceLabel amount={liquidity} price={price} />
              </td>
              <td>
                <TableText
                  type={TableTextType.EMPHASIS}
                  label={`${toFormattedPercentage(utilization, 1)}`}
                />
              </td>
              <td>
                <TableText
                  type={TableTextType.EMPHASIS}
                  label={`${toFormattedPercentage(poolAPY, 1)}`}
                />
              </td>
            </TableRow>
          ))}
      </Table>
    </div>
  );
};

export default TableView;
