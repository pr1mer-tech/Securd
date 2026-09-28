import { eq, and, gte, asc, sql } from "drizzle-orm";
import type { Address } from "viem";
import { db } from "@/db/db";
import { marketSnapshot } from "@/db/schema";
import { xrplEvmClient } from "@/lib/constants/xrplEvmClient";
import { xrplEvm } from "@/lib/constants/network";
import { NATIVE_UNDERLYING } from "@/lib/constants/markets";
import {
  bridgeAdapterContract,
  cTokenContract,
  comptrollerContract,
  irmContract,
  oracleContract,
} from "@/lib/constants/contracts";
import {
  calcBorrowAPY,
  calcSupplyAPY,
  calcUtilization,
  toUSD,
} from "@/lib/helpers/market.helpers";

const erc20MetaAbi = [
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;

export type MarketSnapshotInsert = typeof marketSnapshot.$inferInsert;

export type MarketSnapshotPoint = {
  snapshotAt: string;
  supplyAPY: number;
  borrowAPY: number;
  utilization: number;
  totalSupplyUSD: number;
  totalBorrowsUSD: number;
  availableLiquidityUSD: number;
  priceUSD: number;
};

export function getSnapshotBucket(date = new Date()): Date {
  const bucket = new Date(date);
  bucket.setSeconds(0, 0);
  return bucket;
}

export async function getAllSnapshotMarkets(): Promise<readonly Address[]> {
  return xrplEvmClient.readContract({
    ...comptrollerContract,
    functionName: "getAllMarkets",
  });
}

export async function collectMarketSnapshots(
  snapshotAt = getSnapshotBucket(),
): Promise<MarketSnapshotInsert[]> {
  const cTokens = await getAllSnapshotMarkets();
  return Promise.all(cTokens.map((cToken) => collectOneMarketSnapshot(cToken, snapshotAt)));
}

export async function persistMarketSnapshots(
  snapshotAt = getSnapshotBucket(),
): Promise<MarketSnapshotInsert[]> {
  const rows = await collectMarketSnapshots(snapshotAt);
  if (rows.length === 0) return rows;

  await db
    .insert(marketSnapshot)
    .values(rows)
    .onConflictDoUpdate({
      target: [
        marketSnapshot.chain_id,
        marketSnapshot.c_token,
        marketSnapshot.snapshot_at,
      ],
      set: {
        underlying: sql`excluded.underlying`,
        symbol: sql`excluded.symbol`,
        underlying_symbol: sql`excluded.underlying_symbol`,
        underlying_decimals: sql`excluded.underlying_decimals`,
        supply_apy: sql`excluded.supply_apy`,
        borrow_apy: sql`excluded.borrow_apy`,
        utilization: sql`excluded.utilization`,
        total_supply_usd: sql`excluded.total_supply_usd`,
        total_borrows_usd: sql`excluded.total_borrows_usd`,
        available_liquidity_usd: sql`excluded.available_liquidity_usd`,
        price_usd: sql`excluded.price_usd`,
        total_cash_raw: sql`excluded.total_cash_raw`,
        total_borrows_raw: sql`excluded.total_borrows_raw`,
        total_reserves_raw: sql`excluded.total_reserves_raw`,
        total_supply_raw: sql`excluded.total_supply_raw`,
        exchange_rate_raw: sql`excluded.exchange_rate_raw`,
        supply_rate_per_block_raw: sql`excluded.supply_rate_per_block_raw`,
        borrow_rate_per_block_raw: sql`excluded.borrow_rate_per_block_raw`,
      },
    });

  return rows;
}

export async function getMarketSnapshotHistory(params: {
  cToken: Address;
  days?: number;
}): Promise<MarketSnapshotPoint[]> {
  const days = Math.max(1, Math.min(params.days ?? 30, 365));
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      snapshotAt: marketSnapshot.snapshot_at,
      supplyAPY: marketSnapshot.supply_apy,
      borrowAPY: marketSnapshot.borrow_apy,
      utilization: marketSnapshot.utilization,
      totalSupplyUSD: marketSnapshot.total_supply_usd,
      totalBorrowsUSD: marketSnapshot.total_borrows_usd,
      availableLiquidityUSD: marketSnapshot.available_liquidity_usd,
      priceUSD: marketSnapshot.price_usd,
    })
    .from(marketSnapshot)
    .where(
      and(
        eq(marketSnapshot.chain_id, xrplEvm.id),
        eq(marketSnapshot.c_token, params.cToken.toLowerCase()),
        gte(marketSnapshot.snapshot_at, from),
      ),
    )
    .orderBy(asc(marketSnapshot.snapshot_at));

  return rows.map((row) => ({
    snapshotAt: row.snapshotAt.toISOString(),
    supplyAPY: row.supplyAPY,
    borrowAPY: row.borrowAPY,
    utilization: row.utilization,
    totalSupplyUSD: row.totalSupplyUSD,
    totalBorrowsUSD: row.totalBorrowsUSD,
    availableLiquidityUSD: row.availableLiquidityUSD,
    priceUSD: row.priceUSD,
  }));
}

async function collectOneMarketSnapshot(
  cToken: Address,
  snapshotAt: Date,
): Promise<MarketSnapshotInsert> {
  const ct = cTokenContract(cToken);

  const [
    symbol,
    marketCfg,
    totalCash,
    totalBorrows,
    totalReserves,
    totalSupply,
    exchangeRate,
    borrowRatePerBlock,
    supplyRatePerBlock,
    irmAddress,
    rawPrice,
  ] = await Promise.all([
    xrplEvmClient.readContract({ ...ct, functionName: "symbol" }),
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
    xrplEvmClient.readContract({ ...ct, functionName: "interestRateModel" }),
    xrplEvmClient.readContract({
      ...oracleContract,
      functionName: "getUnderlyingPrice",
      args: [cToken],
    }),
  ]);

  const underlying = marketCfg[0];
  const isNative = underlying.toLowerCase() === NATIVE_UNDERLYING.toLowerCase();
  let underlyingSymbol = "XRP";
  let underlyingDecimals = 18;

  if (!isNative) {
    const [erc20Symbol, erc20Decimals] = await Promise.all([
      xrplEvmClient.readContract({ address: underlying, abi: erc20MetaAbi, functionName: "symbol" }),
      xrplEvmClient.readContract({ address: underlying, abi: erc20MetaAbi, functionName: "decimals" }),
    ]);
    underlyingSymbol = erc20Symbol;
    underlyingDecimals = erc20Decimals;
  }

  const blocksPerYear = await xrplEvmClient.readContract({
    ...irmContract(irmAddress),
    functionName: "blocksPerYear",
  });

  const priceUSD = Number(rawPrice) / 10 ** (36 - underlyingDecimals);
  const totalSupplyUnderlyingRaw = (totalSupply * exchangeRate) / 10n ** 18n;

  return {
    snapshot_at: snapshotAt,
    chain_id: xrplEvm.id,
    c_token: cToken.toLowerCase(),
    underlying: underlying.toLowerCase(),
    symbol,
    underlying_symbol: underlyingSymbol,
    underlying_decimals: underlyingDecimals,
    supply_apy: calcSupplyAPY(supplyRatePerBlock, blocksPerYear),
    borrow_apy: calcBorrowAPY(borrowRatePerBlock, blocksPerYear),
    utilization: calcUtilization(totalCash, totalBorrows, totalReserves),
    total_supply_usd: toUSD(totalSupplyUnderlyingRaw, underlyingDecimals, priceUSD),
    total_borrows_usd: toUSD(totalBorrows, underlyingDecimals, priceUSD),
    available_liquidity_usd: toUSD(totalCash, underlyingDecimals, priceUSD),
    price_usd: priceUSD,
    total_cash_raw: totalCash.toString(),
    total_borrows_raw: totalBorrows.toString(),
    total_reserves_raw: totalReserves.toString(),
    total_supply_raw: totalSupply.toString(),
    exchange_rate_raw: exchangeRate.toString(),
    supply_rate_per_block_raw: supplyRatePerBlock.toString(),
    borrow_rate_per_block_raw: borrowRatePerBlock.toString(),
  };
}
