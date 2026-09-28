import type { MarketData } from "@/lib/types/market.types";

const MANTISSA = 10n ** 18n;

// APY = ratePerBlock × blocksPerYear × 100 / 1e18.
// blocksPerYear is read per-market from the IRM (`irm.blocksPerYear()`) — it is
// not hardcoded: markets may use separate IRMs and the value can be recalibrated
// on-chain, either of which would otherwise silently skew the displayed APY.
// The ×1e6 / ÷1e4 split keeps precision through BigInt integer division.
export function calcSupplyAPY(
  supplyRatePerBlock: bigint,
  blocksPerYear: bigint,
): number {
  return Number((supplyRatePerBlock * blocksPerYear * 1000000n) / MANTISSA) / 10000;
}

export function calcBorrowAPY(
  borrowRatePerBlock: bigint,
  blocksPerYear: bigint,
): number {
  return Number((borrowRatePerBlock * blocksPerYear * 1000000n) / MANTISSA) / 10000;
}

export function annualizeRatePerBlock(
  ratePerBlock: bigint,
  blocksPerYear: bigint,
): number {
  return Number((ratePerBlock * blocksPerYear * 1000000n) / MANTISSA) / 10000;
}

export function mantissaToPercent(value: bigint): number {
  return Number((value * 10000n) / MANTISSA) / 100;
}

export function calcBorrowRateAtUtilization(params: {
  utilizationMantissa: bigint;
  baseRatePerBlock: bigint;
  multiplierPerBlock: bigint;
  jumpMultiplierPerBlock: bigint;
  kink: bigint;
  blocksPerYear: bigint;
}): number {
  const {
    utilizationMantissa,
    baseRatePerBlock,
    multiplierPerBlock,
    jumpMultiplierPerBlock,
    kink,
    blocksPerYear,
  } = params;

  const ratePerBlock =
    utilizationMantissa <= kink
      ? baseRatePerBlock + (utilizationMantissa * multiplierPerBlock) / MANTISSA
      : baseRatePerBlock +
        (kink * multiplierPerBlock) / MANTISSA +
        ((utilizationMantissa - kink) * jumpMultiplierPerBlock) / MANTISSA;

  return annualizeRatePerBlock(ratePerBlock, blocksPerYear);
}

export function calcSupplyRateAtUtilization(params: {
  borrowRateAPY: number;
  utilizationPct: number;
  reserveFactorPct: number;
}): number {
  const utilization = params.utilizationPct / 100;
  const reserveShare = 1 - params.reserveFactorPct / 100;
  return params.borrowRateAPY * utilization * reserveShare;
}

export function calcUtilization(
  cash: bigint,
  borrows: bigint,
  reserves: bigint,
): number {
  const total = cash + borrows - reserves;
  // total can be non-positive in a thin/near-drained market (reserves close
  // to cash+borrows) — clamp here rather than at every call site, since a
  // negative bigint division would otherwise surface as a nonsensical
  // negative utilization percentage in the UI.
  if (total <= 0n) return 0;
  const pct = Number((borrows * 10000n) / total) / 100;
  return Math.min(Math.max(pct, 0), 100);
}

export type RateCurvePoint = {
  utilizationPct: number;
  borrowAPY: number;
  supplyAPY: number;
};

type IrmCurveParams = Pick<
  MarketData,
  | "kink"
  | "baseRatePerBlock"
  | "multiplierPerBlock"
  | "jumpMultiplierPerBlock"
  | "reserveFactor"
  | "blocksPerYear"
>;

// Replicates the on-chain JumpRateModel formula (getBorrowRate/getSupplyRate)
// at a synthetic utilization rather than the market's real cash/borrows/
// reserves — lets the UI plot the full 0–100% rate curve from four static IRM
// params instead of needing N separate contract calls.
function borrowRatePerBlockAtUtilization(
  utilizationMantissa: bigint,
  params: IrmCurveParams,
): bigint {
  if (utilizationMantissa <= params.kink) {
    return (
      (utilizationMantissa * params.multiplierPerBlock) / MANTISSA +
      params.baseRatePerBlock
    );
  }
  const normalRate =
    (params.kink * params.multiplierPerBlock) / MANTISSA + params.baseRatePerBlock;
  const excessUtilization = utilizationMantissa - params.kink;
  return (
    (excessUtilization * params.jumpMultiplierPerBlock) / MANTISSA + normalRate
  );
}

function supplyRatePerBlockAtUtilization(
  utilizationMantissa: bigint,
  borrowRatePerBlock: bigint,
  reserveFactorMantissa: bigint,
): bigint {
  const oneMinusReserveFactor = MANTISSA - reserveFactorMantissa;
  const rateToPool = (borrowRatePerBlock * oneMinusReserveFactor) / MANTISSA;
  return (utilizationMantissa * rateToPool) / MANTISSA;
}

/**
 * Samples the market's real on-chain rate model across the full 0–100%
 * utilization range, so the UI can plot the actual curve shape (including
 * where the kink sits) instead of a single current-utilization snapshot.
 */
export function buildRateCurve(market: IrmCurveParams, steps = 20): RateCurvePoint[] {
  const kinkPct = Math.round(Number(market.kink) / 1e16);
  const samplePcts = new Set<number>();
  for (let i = 0; i <= steps; i += 1) {
    samplePcts.add(Math.round((i * 100) / steps));
  }
  samplePcts.add(Math.min(100, Math.max(0, kinkPct))); // exact corner at the kink

  return Array.from(samplePcts)
    .sort((a, b) => a - b)
    .map((utilizationPct) => {
      const utilizationMantissa = (BigInt(utilizationPct) * MANTISSA) / 100n;
      const borrowRatePerBlock = borrowRatePerBlockAtUtilization(
        utilizationMantissa,
        market,
      );
      const supplyRatePerBlock = supplyRatePerBlockAtUtilization(
        utilizationMantissa,
        borrowRatePerBlock,
        market.reserveFactor,
      );
      return {
        utilizationPct,
        borrowAPY: calcBorrowAPY(borrowRatePerBlock, market.blocksPerYear),
        supplyAPY: calcSupplyAPY(supplyRatePerBlock, market.blocksPerYear),
      };
    });
}

// Converts cToken balance to underlying amount using exchange rate (1e18 mantissa)
export function cTokenToUnderlying(
  cTokenBalance: bigint,
  exchangeRate: bigint,
): bigint {
  return (cTokenBalance * exchangeRate) / MANTISSA;
}

export function toUSD(amount: bigint, decimals: number, priceUSD: number): number {
  return (Number(amount) / 10 ** decimals) * priceUSD;
}

export function calcHealthFactor(
  liquidity: bigint,
  shortfall: bigint,
): number {
  if (shortfall > 0n) return 0;
  if (liquidity === 0n) return Infinity;
  // Health factor: ratio of collateral value to borrow value
  // Approximated as 1 + liquidity/totalBorrow in USD mantissa
  return Number(liquidity) / 1e18;
}

export function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatTokenAmount(value: number, decimals = 4): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(decimals);
}

export function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`;
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function healthFactorColor(hf: number): string {
  if (hf === Infinity || hf > 2) return "text-systemGreen";
  if (hf > 1.25) return "text-systemYellow";
  return "text-systemRed";
}

export function healthFactorLabel(hf: number): string {
  if (hf === Infinity) return "—";
  if (hf > 2) return "Safe";
  if (hf > 1.25) return "Caution";
  return "At risk";
}
