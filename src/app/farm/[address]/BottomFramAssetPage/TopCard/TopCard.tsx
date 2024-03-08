"use client";
import React, { useContext, useEffect, useMemo } from "react";
import { TopCardsWrapper } from "../BottomFarmAsset.styled";
import Card from "@/components/Card/Card";
import { MainContext } from "@/context/Main.context";
import { FarmContext } from "@/context/Farm.context";
import DashboardFigures from "@/components/DashboardFigures/DashboardFigures";
import {
  securdFormat,
  toFormattedPercentage,
  toLeverage,
} from "@/utils/helpers/numberFormat.helpers";
import {
  BorrowPoolsApy,
  PoolLiquidities,
  PoolSizes,
  PoolUtilizations,
} from "@/utils/types/farm.types";
import Tooltip from "@/components/Tooltip/Tooltip";
import { useBalance } from "wagmi";
import {
  getBorrowAPYLP,
  getBorrowerPoolBalanceLT,
  getBorrowerPoolMaxLeverage,
  getMaxLT,
  getMaxLpApy,
  getPairBorrowApy,
  getPairLiquidities,
  getPairPoolSize,
  getPairUtilizations,
} from "@/utils/helpers/borrow.helpers";
import { getPoolAPY } from "@/utils/helpers/lenderPool.helpers";

const TopCard = () => {
  const { windowWidth } = useContext(MainContext);
  const {
    collateralPrice,
    collateralValue,
    pool,
    reservesInfo,
    selectedCollateralInfo,
    tokens,
    tokensUSDPrices,
  } = useContext(FarmContext);

  const { data: supplyLP, refetch: refetchBalance } = useBalance({
    address: selectedCollateralInfo?.address,
    token: selectedCollateralInfo?.addressLP,
  });

  useEffect(() => {
    refetchBalance();
  }, [collateralValue]);

  const mintLT = useMemo(() => {
    return getBorrowerPoolBalanceLT(selectedCollateralInfo);
  }, [selectedCollateralInfo]);

  const maxLT = useMemo(() => {
    return getMaxLT(selectedCollateralInfo);
  }, [selectedCollateralInfo]);

  const maxLeverage = useMemo(() => {
    return getBorrowerPoolMaxLeverage(selectedCollateralInfo);
  }, [selectedCollateralInfo]);

  const { apyA: borrowPoolAPYA, apyB: borrowPoolAPYB }: BorrowPoolsApy =
    getPairBorrowApy(reservesInfo, tokens);

  const borrowLpApy = useMemo(() => {
    return getBorrowAPYLP(borrowPoolAPYA, borrowPoolAPYB);
  }, [borrowPoolAPYA, borrowPoolAPYB]);

  // MARK: ANTHONY wanted to have this to be fixed for a demo pupose
  const lpApr = 0.089;

  const lpApy = useMemo(() => {
    return getPoolAPY(undefined, lpApr);
  }, [lpApr]);

  const maxLpApy = useMemo(() => {
    return getMaxLpApy(maxLeverage, borrowLpApy, lpApy);
  }, [maxLeverage, borrowLpApy, lpApy]);

  const { poolSizeA, poolSizeB }: PoolSizes = useMemo(() => {
    return getPairPoolSize(reservesInfo, tokens);
  }, [reservesInfo, tokens]);

  const { poolLiquiditieA, poolLiquiditieB }: PoolLiquidities = useMemo(() => {
    return getPairLiquidities(reservesInfo, tokens);
  }, [reservesInfo, tokens]);

  const borrowTotalAmountA = useMemo(() => {
    if (poolSizeA !== undefined && poolLiquiditieA !== undefined) {
      return poolSizeA - poolLiquiditieA;
    }
  }, [poolSizeA, poolLiquiditieA]);

  const borrowTotalAmountB = useMemo(() => {
    if (poolSizeB !== undefined && poolLiquiditieB !== undefined) {
      return poolSizeB - poolLiquiditieB;
    }
  }, [poolSizeB, poolLiquiditieB]);

  const { poolUtilizationsA, poolUtilizationsB }: PoolUtilizations =
    useMemo(() => {
      return getPairUtilizations(reservesInfo, tokens);
    }, [reservesInfo, tokens]);

  return (
    <TopCardsWrapper margin={"2rem 0"}>
      {pool === 1 ? (
        <Card shadow height={windowWidth > 800 ? "100px" : "auto"}>
          <DashboardFigures
            coinPrices={collateralPrice}
            data={[
              {
                title: (
                  <Tooltip key={0} title="COLLATERAL POOL">
                    Total Collateral value for all Farmers of this LP Token
                  </Tooltip>
                ),
                value: `${securdFormat(Number(supplyLP?.formatted), 0)}`,
                convertedValue: Number(supplyLP?.formatted),
              },
              {
                title: (
                  <Tooltip key={1} title="MIN LT">
                    Liquidation Threshold that applies when your loans value in
                    both assets are equal
                  </Tooltip>
                ),
                value: `${toFormattedPercentage(mintLT, 1)}`,
              },
              {
                title: (
                  <Tooltip key={2} title="MAX LT">
                    Liquidation Threshold that applies when you only borrow one
                    asset
                  </Tooltip>
                ),
                value: `${toFormattedPercentage(maxLT, 1)}`,
              },
              {
                title: (
                  <Tooltip key={3} title="MAX LEVERAGE">
                    Maximum position multiplier allowed for this LP Token
                  </Tooltip>
                ),
                value: `${toLeverage(Number(maxLeverage))}`,
              },
              {
                title: (
                  <Tooltip key={4} title="BORROW APY">
                    Current average borrowing rate for this token pair
                  </Tooltip>
                ),
                value: `${toFormattedPercentage(borrowLpApy, 1)}`,
              },
              {
                title: (
                  <Tooltip key={5} title="LP APY">
                    Estimated yield for this LP Token based on last 7 days
                    trading fees
                  </Tooltip>
                ),
                value: `${toFormattedPercentage(lpApy, 1)}`,
              },
              {
                title: (
                  <Tooltip key={6} title="MAX FARMING APY">
                    Estimated Farming APY when using Max Leverage
                  </Tooltip>
                ),
                value: `${toFormattedPercentage(maxLpApy, 1)}`,
              },
            ]}
          />
        </Card>
      ) : pool === 2 ? (
        <>
          <Card shadow height={windowWidth > 500 ? "100px" : "auto"}>
            <DashboardFigures
              coinPrices={tokensUSDPrices.tokenA}
              data={[
                {
                  title: (
                    <Tooltip key={7} title="LENDING POOL">
                      Total Savings value (Deposit+Interest) for all depositors
                      of this asset
                    </Tooltip>
                  ),
                  value: `${securdFormat(poolSizeA, 0)}`,
                  convertedValue: poolSizeA,
                },
                {
                  title: (
                    <Tooltip key={8} title="LIQUIDITY">
                      Amount of this asset available for immediate withdrawal
                    </Tooltip>
                  ),
                  value: `${securdFormat(poolLiquiditieA, 0)}`,
                  convertedValue: poolLiquiditieA,
                },
                {
                  title: (
                    <Tooltip key={9} title="LOAN">
                      Total loan value for this asset
                    </Tooltip>
                  ),
                  value: `${securdFormat(borrowTotalAmountA, 0)}`,
                  convertedValue: borrowTotalAmountA,
                },
              ]}
            />
          </Card>
          <Card shadow height={windowWidth > 500 ? "100px" : "auto"}>
            <DashboardFigures
              data={[
                {
                  title: (
                    <Tooltip key={10} title="UTILIZATION">
                      Proportion of borrowed assets in this lending pool
                    </Tooltip>
                  ),
                  value: `${toFormattedPercentage(poolUtilizationsA, 1)}`,
                },
                {
                  title: (
                    <Tooltip key={11} title="BORROW APY">
                      Current borrowing rate for this token pair
                    </Tooltip>
                  ),

                  value: `${toFormattedPercentage(borrowPoolAPYA, 1)}`,
                },
              ]}
              maxItemWidth="150px"
            />
          </Card>
        </>
      ) : (
        <>
          <Card shadow height={windowWidth > 500 ? "100px" : "auto"}>
            <DashboardFigures
              coinPrices={tokensUSDPrices.tokenB}
              data={[
                {
                  title: (
                    <Tooltip key={12} title="LENDING POOl">
                      Total Savings value (Deposit+Interest) for all depositors
                      of this asset
                    </Tooltip>
                  ),
                  value: `${securdFormat(poolSizeB, 0)}`,
                  convertedValue: poolSizeB,
                },
                {
                  title: (
                    <Tooltip key={13} title="LIQUIDITY">
                      Amount of this asset available for immediate withdrawal
                    </Tooltip>
                  ),
                  value: `${securdFormat(poolLiquiditieB, 0)}`,
                  convertedValue: poolLiquiditieB,
                },
                {
                  title: (
                    <Tooltip key={14} title="LOAN">
                      Total loan value for this asset
                    </Tooltip>
                  ),
                  value: `${securdFormat(borrowTotalAmountB, 0)}`,
                  convertedValue: borrowTotalAmountB,
                },
              ]}
            />
          </Card>
          <Card shadow height={windowWidth > 500 ? "100px" : "auto"}>
            <DashboardFigures
              data={[
                {
                  title: (
                    <Tooltip key={15} title="UTILIZATION">
                      Proportion of borrowed assets in this lending pool
                    </Tooltip>
                  ),
                  value: `${toFormattedPercentage(poolUtilizationsB, 1)}`,
                },
                {
                  title: (
                    <Tooltip key={16} title="BORROW APY">
                      Current borrowing rate for this token pair
                    </Tooltip>
                  ),
                  value: `${toFormattedPercentage(borrowPoolAPYB, 1)}`,
                },
              ]}
              maxItemWidth="150px"
            />
          </Card>
        </>
      )}
    </TopCardsWrapper>
  );
};

export default TopCard;
