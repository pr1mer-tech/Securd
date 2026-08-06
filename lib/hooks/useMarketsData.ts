"use client";

import { useCallback, useEffect } from "react";
import type { Address } from "viem";
import { xrplEvmClient } from "@/lib/constants/xrplEvmClient";
import { NATIVE_UNDERLYING, getMarketMetadata } from "@/lib/constants/markets";
import {
  comptrollerContract,
  oracleContract,
  cTokenContract,
  irmContract,
  bridgeAdapterContract,
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

// Minimal ERC20 metadata ABI — only the underlying-token reads we need.
const erc20MetaAbi = [
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

/**
 * Reads the protocol's market registry from the Comptroller.
 *
 * `getAllMarkets()` returns every listed cToken — the on-chain array is
 * appended each time the admin lists a market via `_supportMarket()`. This is
 * the single source of truth for which markets exist; there is no off-chain
 * config list, index, or subgraph.
 */
export async function getAllMarkets(): Promise<readonly Address[]> {
  return xrplEvmClient.readContract({
    ...comptrollerContract,
    functionName: "getAllMarkets",
  });
}

async function fetchOneMarket(cToken: Address): Promise<MarketData> {
  const ct = cTokenContract(cToken);

  // Everything keyed only on the cToken address — one parallel batch.
  const [
    symbol,
    name,
    cTokenDecimals,
    marketCfg,
    totalCash,
    totalBorrows,
    totalReserves,
    totalSupply,
    exchangeRate,
    borrowRatePerBlock,
    supplyRatePerBlock,
    reserveFactor,
    irmAddress,
    marketInfo,
    rawPrice,
    borrowCap,
    mintGuardianPaused,
    borrowGuardianPaused,
    transferGuardianPaused,
    closeFactor,
    liquidationIncentive,
    protocolSeizeShare,
  ] = await Promise.all([
    xrplEvmClient.readContract({ ...ct, functionName: "symbol" }),
    xrplEvmClient.readContract({ ...ct, functionName: "name" }),
    xrplEvmClient.readContract({ ...ct, functionName: "decimals" }),
    // marketConfigOf() is the authoritative underlying — the address the
    // BridgeAdapter validates intent envelopes against (NATIVE_UNDERLYING for
    // native XRP).
    xrplEvmClient.readContract({
      ...bridgeAdapterContract,
      functionName: "marketConfigOf",
      args: [cToken],
    }),
    xrplEvmClient.readContract({ ...ct, functionName: "getCash" }),
    xrplEvmClient.readContract({ ...ct, functionName: "totalBorrows" }),
    xrplEvmClient.readContract({ ...ct, functionName: "totalReserves" }),
    xrplEvmClient.readContract({ ...ct, functionName: "totalSupply" }),
    xrplEvmClient.readContract({ ...ct, functionName: "exchangeRateStored" }),
    xrplEvmClient.readContract({ ...ct, functionName: "borrowRatePerBlock" }),
    xrplEvmClient.readContract({ ...ct, functionName: "supplyRatePerBlock" }),
    xrplEvmClient.readContract({
      ...ct,
      functionName: "reserveFactorMantissa",
    }),
    xrplEvmClient.readContract({ ...ct, functionName: "interestRateModel" }),
    xrplEvmClient.readContract({
      ...comptrollerContract,
      functionName: "markets",
      args: [cToken],
    }),
    xrplEvmClient.readContract({
      ...oracleContract,
      functionName: "getUnderlyingPrice",
      args: [cToken],
    }),
    xrplEvmClient.readContract({
      ...comptrollerContract,
      functionName: "borrowCaps",
      args: [cToken],
    }),
    xrplEvmClient.readContract({
      ...comptrollerContract,
      functionName: "mintGuardianPaused",
      args: [cToken],
    }),
    xrplEvmClient.readContract({
      ...comptrollerContract,
      functionName: "borrowGuardianPaused",
      args: [cToken],
    }),
    xrplEvmClient.readContract({
      ...comptrollerContract,
      functionName: "transferGuardianPaused",
    }),
    xrplEvmClient.readContract({
      ...comptrollerContract,
      functionName: "closeFactorMantissa",
    }),
    xrplEvmClient.readContract({
      ...comptrollerContract,
      functionName: "liquidationIncentiveMantissa",
    }),
    xrplEvmClient.readContract({
      ...ct,
      functionName: "protocolSeizeShareMantissa",
    }),
  ]);

  // marketConfigOf() returns [underlying, tokenId, listed].
  const underlying = marketCfg[0];
  const isNative = underlying.toLowerCase() === NATIVE_UNDERLYING.toLowerCase();

  // blocksPerYear is read from this market's own IRM — markets may use separate
  // IRM instances, and the value can be recalibrated on-chain. Kicked off here
  // so it resolves concurrently with the underlying-token reads below.
  const irm = irmContract(irmAddress);
  const irmParamsPromise = Promise.all([
    xrplEvmClient.readContract({ ...irm, functionName: "blocksPerYear" }),
    xrplEvmClient.readContract({ ...irm, functionName: "baseRatePerBlock" }),
    xrplEvmClient.readContract({ ...irm, functionName: "multiplierPerBlock" }),
    xrplEvmClient.readContract({
      ...irm,
      functionName: "jumpMultiplierPerBlock",
    }),
    xrplEvmClient.readContract({ ...irm, functionName: "kink" }),
  ]);

  // Native XRP has no ERC20 underlying — its symbol/decimals are fixed.
  // IOU markets: read the underlying-token symbol/decimals from chain.
  let underlyingSymbol = "XRP";
  let underlyingDecimals = 18;
  if (!isNative) {
    const [erc20Symbol, erc20Decimals] = await Promise.all([
      xrplEvmClient.readContract({
        address: underlying,
        abi: erc20MetaAbi,
        functionName: "symbol",
      }),
      xrplEvmClient.readContract({
        address: underlying,
        abi: erc20MetaAbi,
        functionName: "decimals",
      }),
    ]);
    underlyingSymbol = erc20Symbol;
    underlyingDecimals = erc20Decimals;
  }
  const [
    blocksPerYear,
    baseRatePerBlock,
    multiplierPerBlock,
    jumpMultiplierPerBlock,
    kink,
  ] = await irmParamsPromise;

  // markets() returns [isListed, collateralFactorMantissa, isRewarded]
  const isListed = marketInfo[0];
  const collateralFactor = marketInfo[1];
  const isRewarded = marketInfo[2];

  // Compound oracle: price mantissa = USD_price * 1e(36 - underlyingDecimals)
  const priceUSD = Number(rawPrice) / 10 ** (36 - underlyingDecimals);

  const supplyAPY = calcSupplyAPY(supplyRatePerBlock, blocksPerYear);
  const borrowAPY = calcBorrowAPY(borrowRatePerBlock, blocksPerYear);
  const utilization = calcUtilization(totalCash, totalBorrows, totalReserves);

  // cToken totalSupply → underlying: totalSupply_cToken * exchangeRate / 1e18
  const totalSupplyUnderlyingRaw = (totalSupply * exchangeRate) / 10n ** 18n;
  const totalSupplyUnderlying =
    Number(totalSupplyUnderlyingRaw) / 10 ** underlyingDecimals;
  const totalSupplyUSD = toUSD(
    totalSupplyUnderlyingRaw,
    underlyingDecimals,
    priceUSD,
  );
  const totalBorrowsUSD = toUSD(totalBorrows, underlyingDecimals, priceUSD);
  const availableLiquidityUSD = toUSD(totalCash, underlyingDecimals, priceUSD);

  // XRPL Ledger identity — the only field not derivable from XRPL EVM.
  const xrplIdentity = getMarketMetadata(cToken);

  return {
    cToken,
    underlying,
    symbol,
    name,
    cTokenDecimals,
    underlyingSymbol,
    underlyingDecimals,
    isListed,
    isRewarded,
    xrplCurrency: xrplIdentity?.xrplCurrency,
    xrplIssuer: xrplIdentity?.xrplIssuer,
    totalSupply,
    totalBorrows,
    totalCash,
    totalReserves,
    exchangeRate,
    borrowRatePerBlock,
    supplyRatePerBlock,
    reserveFactor,
    collateralFactor,
    borrowCap,
    mintGuardianPaused,
    borrowGuardianPaused,
    transferGuardianPaused,
    closeFactor,
    liquidationIncentive,
    protocolSeizeShare,
    interestRateModel: irmAddress,
    blocksPerYear,
    baseRatePerBlock,
    multiplierPerBlock,
    jumpMultiplierPerBlock,
    kink,
    supplyAPY,
    borrowAPY,
    utilization,
    totalSupplyUSD,
    totalSupplyUnderlying,
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
      const cTokens = await getAllMarkets();
      const markets = await Promise.all(cTokens.map(fetchOneMarket));
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
