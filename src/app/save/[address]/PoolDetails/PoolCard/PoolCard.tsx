"use client";
import React, { useContext, useMemo } from "react";
import Tooltip from "@/components/Tooltip/Tooltip";
import { TopCardsWrapper } from "./PoolCard.styled";
import Card from "@/components/Card/Card";
import { MainContext } from "@/context/Main.context";
import DashboardFigures from "@/components/DashboardFigures/DashboardFigures";
import {
  securdFormat,
  toFormattedPercentage,
} from "@/utils/helpers/numberFormat.helpers";
import {
  getDeposit,
  getDepositBalance,
  getPoolLiquidity,
  getPoolUtilization,
  getSavingApy,
} from "@/utils/helpers/lenderPool.helpers";
import { SaveContext } from "@/context/Save.context";
import {
  getInterestAmount,
  getSelectedReserveInfo,
} from "@/utils/helpers/lenderDeposit.helpers";
import { useParams } from "next/navigation";
import { Address } from "viem";
import { Coins } from "@/utils/types/save.types";

const PoolCard = () => {
  const { reservesInfo } = useContext(SaveContext);
  const { windowWidth, coinPrices } = useContext(MainContext);

  const params = useParams();

  const selectedReserveInfo = useMemo(() => {
    return getSelectedReserveInfo(reservesInfo, params?.address as Address);
  }, [reservesInfo, params]);

  const depositBalance = useMemo(() => {
    return getDepositBalance(selectedReserveInfo);
  }, [selectedReserveInfo]);

  const globalDeposit = useMemo(() => {
    return getDeposit(selectedReserveInfo);
  }, [selectedReserveInfo]);

  const globalInterest = useMemo(() => {
    return getInterestAmount(depositBalance, globalDeposit);
  }, [depositBalance, globalDeposit]);

  const liquidity = useMemo(() => {
    return getPoolLiquidity(selectedReserveInfo);
  }, [selectedReserveInfo]);

  const utilization = useMemo(() => {
    return getPoolUtilization(selectedReserveInfo);
  }, [selectedReserveInfo]);

  const price = useMemo(() => {
    return coinPrices[selectedReserveInfo?.symbol as keyof Coins];
  }, [selectedReserveInfo]);

  const poolAPY = useMemo(() => {
    return getSavingApy(selectedReserveInfo);
  }, [selectedReserveInfo]);

  return (
    <TopCardsWrapper margin="2rem 0">
      <Card
        shadow
        height={windowWidth > 1100 ? "100px" : "auto"}
        margin={windowWidth < 1100 ? "0 0 2rem 0" : ""}
      >
        <DashboardFigures
          breakpoint="1100px"
          coinPrices={price}
          data={[
            {
              title: (
                <Tooltip key={0} title="LENDING POOL" textCentered={true}>
                  Total Savings value (Deposit+Interest) for all depositors of
                  this asset
                </Tooltip>
              ),
              value: `${securdFormat(depositBalance, 2)}`,
              convertedValue: depositBalance,
            },
            {
              title: (
                <Tooltip key={1} title="DEPOSIT" textCentered={true}>
                  Total deposited amount for all depositors of this asset
                </Tooltip>
              ),
              value: `${securdFormat(globalDeposit, 2)}`,
              convertedValue: globalDeposit,
            },
            {
              title: (
                <Tooltip key={2} title="INTEREST" textCentered={true}>
                  Total accrued interest for all depositors of this asset
                </Tooltip>
              ),
              value: `${securdFormat(globalInterest, 2)}`,
              convertedValue: globalInterest,
            },
            {
              title: (
                <Tooltip key={3} title="LIQUIDITY" textCentered={true}>
                  Amount of this asset available for immediate withdrawal
                </Tooltip>
              ),
              value: `${securdFormat(liquidity, 2)}`,
              convertedValue: liquidity,
            },
            {
              title: (
                <Tooltip key={4} title="UTILIZATION" textCentered={true}>
                  Proportion of borrowed assets in this lending pool
                </Tooltip>
              ),
              value: `${toFormattedPercentage(utilization, 1)}`,
            },
            {
              title: (
                <Tooltip key={5} title="SAVING APY" textCentered={true}>
                  Current yield for this asset
                </Tooltip>
              ),
              value: `${toFormattedPercentage(poolAPY, 1)}`,
            },
          ]}
        />
      </Card>
    </TopCardsWrapper>
  );
};

export default PoolCard;
