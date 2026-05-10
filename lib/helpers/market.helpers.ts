const BLOCKS_PER_YEAR = 2_102_400n; // ~4s blocks on XRPL EVM
const MANTISSA = 10n ** 18n;

export function calcSupplyAPY(supplyRatePerBlock: bigint): number {
  const ratePerYear = Number(supplyRatePerBlock * BLOCKS_PER_YEAR) / 1e18;
  return (Math.pow(ratePerYear / 2102400 + 1, 2102400) - 1) * 100;
}

export function calcBorrowAPY(borrowRatePerBlock: bigint): number {
  const ratePerYear = Number(borrowRatePerBlock * BLOCKS_PER_YEAR) / 1e18;
  return (Math.pow(ratePerYear / 2102400 + 1, 2102400) - 1) * 100;
}

export function calcUtilization(
  cash: bigint,
  borrows: bigint,
  reserves: bigint,
): number {
  const total = cash + borrows - reserves;
  if (total === 0n) return 0;
  return Number((borrows * 10000n) / total) / 100;
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
