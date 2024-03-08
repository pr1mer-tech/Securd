"use client";
import React, { FC, useContext, useEffect, useMemo } from "react";
import { getPoolAPY } from "@/utils/helpers/lenderPool.helpers";
import {
  RowedCellBody,
  Table,
  TableBodyCell,
  TableHeaderCell,
  TableRow,
} from "../PageTop.styled";
import Tooltip from "@/components/Tooltip/Tooltip";
import {
  toFormattedPercentage,
  toLeverage,
} from "@/utils/helpers/numberFormat.helpers";
import {
  getBorrowAPY,
  getPairBorrowApy,
  getTotalApy,
} from "@/utils/helpers/borrow.helpers";
import { FarmContext } from "@/context/Farm.context";
import useCollateralAmountPrice from "@/utils/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import { bigIntToDecimal } from "@/utils/helpers/main.helpers";
import usePairBorrowBalances from "@/utils/hooks/usePairBorrowBalances";
import { BorrowPoolsApy } from "@/utils/types/farm.types";

type ApyCardProps = {
  setTotalApyLabel: Function;
};

const APYCard: FC<ApyCardProps> = ({ setTotalApyLabel }) => {
  const {
    pairReservesInfos,
    reservesInfo,
    selectedCollateralInfo,
    tokens,
    tokensUSDPrices,
  } = useContext(FarmContext);
  const lpApr = 0.089;

  const lpApy = useMemo(() => {
    return getPoolAPY(undefined, lpApr);
  }, [lpApr]);

  const { borrowBalances } = usePairBorrowBalances(
    selectedCollateralInfo?.addressLP,
    pairReservesInfos.reserveInfoTokenA,
    pairReservesInfos.reserveInfoTokenB
  );
  const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB }: BorrowPoolsApy =
    getPairBorrowApy(reservesInfo, tokens);

  const borrowApy = useMemo(() => {
    return getBorrowAPY(
      tokensUSDPrices,
      borrowPoolAPYA,
      borrowPoolAPYB,
      borrowBalances?.borrowBalanceA,
      borrowBalances?.borrowBalanceB
    );
  }, [borrowBalances, borrowPoolAPYA, borrowPoolAPYB, tokensUSDPrices]);

  const { leverageFactor } = useCollateralAmountPrice(
    selectedCollateralInfo?.addressLP
  );
  const borrowerLeverage: number | undefined = useMemo(() => {
    return bigIntToDecimal(leverageFactor, 18);
  }, [leverageFactor]);

  const { collateralValue } = useCollateralAmountPrice(
    selectedCollateralInfo?.addressLP
  );
  const collateralValueDecimal: number | undefined = useMemo(() => {
    return bigIntToDecimal(collateralValue, 18);
  }, [collateralValue]);

  const loanAUSD = useMemo(() => {
    if (borrowBalances?.borrowBalanceA && tokensUSDPrices.tokenA) {
      return borrowBalances.borrowBalanceA * tokensUSDPrices.tokenA;
    }
  }, [borrowBalances, tokensUSDPrices]);

  const loanBUSD = useMemo(() => {
    if (borrowBalances?.borrowBalanceB && tokensUSDPrices.tokenB) {
      return borrowBalances.borrowBalanceB * tokensUSDPrices.tokenB;
    }
  }, [borrowBalances, tokensUSDPrices]);

  useEffect(() => {
    const priceLoan = (loanAUSD || 0) + (loanBUSD || 0);

    if (
      lpApy !== undefined &&
      borrowApy !== undefined &&
      collateralValueDecimal !== undefined &&
      priceLoan !== undefined
    ) {
      setTotalApyLabel(
        getTotalApy(collateralValueDecimal, lpApy, priceLoan, borrowApy)
      );
    }
  }, [lpApy, borrowApy, collateralValueDecimal]);

  return (
    <Table>
      <thead>
        <TableRow borderBottom>
          <TableHeaderCell borderRight>
            <Tooltip title="LP APY" textCentered={true}>
              Estimated yield for this LP Token based on last 7 days trading
              fees
            </Tooltip>
          </TableHeaderCell>
          <TableHeaderCell borderRight>
            <Tooltip title="Borrow APY" textCentered={true}>
              Current average borrowing rate for this account
            </Tooltip>
          </TableHeaderCell>
          <TableHeaderCell>
            <Tooltip title="Leverage" textCentered={true}>
              Current position multiplier for this account
            </Tooltip>
          </TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow>
          <TableBodyCell borderRight>
            <RowedCellBody>{toFormattedPercentage(lpApy, 1)}</RowedCellBody>
          </TableBodyCell>
          <TableBodyCell borderRight>
            <RowedCellBody>{toFormattedPercentage(borrowApy, 1)}</RowedCellBody>
          </TableBodyCell>
          <TableBodyCell>
            <RowedCellBody>{toLeverage(borrowerLeverage)}</RowedCellBody>
          </TableBodyCell>
        </TableRow>
      </tbody>
    </Table>
  );
};

export default APYCard;
