"use client";

import { useCallback, useEffect } from "react";
import { xrplEvmClient } from "@/lib/constants/xrplEvmClient";
import { MARKETS, type MarketConfig } from "@/lib/constants/markets";
import {
  comptrollerContract,
  oracleContract,
  cTokenContract,
} from "@/lib/constants/contracts";
import { useMarketsStore } from "@/lib/data/marketsStore";
import {
  calcSupplyAPY,
  calcBorrowAPY,
  calcUtilization,
  toUSD,
} from "@/lib/helpers/market.helpers";
import type { MarketData } from "@/lib/types/market.types";

const REFRESH_MS = 30_000;

async function fetchOneMarket(m: MarketConfig): Promise<MarketData> {
  const ct = cTokenContract(m.cToken);

  const [
    totalCash,
    totalBorrows,
    totalReserves,
    totalSupply,
    exchangeRate,
    borrowRatePerBlock,
    supplyRatePerBlock,
    reserveFactor,
    marketInfo,
    rawPrice,
  ] = await Promise.all([
    xrplEvmClient.readContract({ ...ct, functionName: "getCash" }),
    xrplEvmClient.readContract({ ...ct, functionName: "totalBorrows" }),
    xrplEvmClient.readContract({ ...ct, functionName: "totalReserves" }),
    xrplEvmClient.readContract({ ...ct, functionName: "totalSupply" }),
    xrplEvmClient.readContract({ ...ct, functionName: "exchangeRateStored" }),
    xrplEvmClient.readContract({ ...ct, functionName: "borrowRatePerBlock" }),
    xrplEvmClient.readContract({ ...ct, functionName: "supplyRatePerBlock" }),
    xrplEvmClient.readContract({ ...ct, functionName: "reserveFactorMantissa" }),
    xrplEvmClient.readContract({
      ...comptrollerContract,
      functionName: "markets",
      args: [m.cToken],
    }),
    xrplEvmClient.readContract({
      ...oracleContract,
      functionName: "getUnderlyingPrice",
      args: [m.cToken],
    }),
  ]);

  // markets() returns [isListed, collateralFactorMantissa, isRewarded]
  const [, collateralFactor] = marketInfo;

  // Compound oracle: price mantissa = USD_price * 1e(36 - underlyingDecimals)
  const priceUSD = Number(rawPrice) / 10 ** (36 - m.underlyingDecimals);

  const supplyAPY = calcSupplyAPY(supplyRatePerBlock);
  const borrowAPY = calcBorrowAPY(borrowRatePerBlock);
  const utilization = calcUtilization(totalCash, totalBorrows, totalReserves);

  // cToken totalSupply → underlying: totalSupply_cToken * exchangeRate / 1e18
  const totalSupplyUnderlying = (totalSupply * exchangeRate) / 10n ** 18n;
  const totalSupplyUSD = toUSD(totalSupplyUnderlying, m.underlyingDecimals, priceUSD);
  const totalBorrowsUSD = toUSD(totalBorrows, m.underlyingDecimals, priceUSD);
  const availableLiquidityUSD = toUSD(totalCash, m.underlyingDecimals, priceUSD);

  return {
    cToken: m.cToken,
    underlying: m.underlying,
    symbol: m.symbol,
    name: m.name,
    underlyingSymbol: m.underlyingSymbol,
    underlyingDecimals: m.underlyingDecimals,
    totalSupply,
    totalBorrows,
    totalCash,
    totalReserves,
    exchangeRate,
    borrowRatePerBlock,
    supplyRatePerBlock,
    reserveFactor,
    collateralFactor,
    supplyAPY,
    borrowAPY,
    utilization,
    totalSupplyUSD,
    totalBorrowsUSD,
    availableLiquidityUSD,
    priceUSD,
  };
}

export function useMarketsData() {
  const setMarkets = useMarketsStore((s) => s.setMarkets);
  const setMarketsLoading = useMarketsStore((s) => s.setMarketsLoading);

  const refresh = useCallback(async () => {
    try {
      const markets = await Promise.all(MARKETS.map(fetchOneMarket));
      setMarkets(markets);
    } catch (err) {
      console.error("[useMarketsData]", err);
      setMarketsLoading(false);
    }
  }, [setMarkets, setMarketsLoading]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);
}
