import type { Address } from "viem";

export type MarketData = {
  cToken: Address;
  underlying: Address;
  symbol: string;
  name: string;
  underlyingSymbol: string;
  underlyingDecimals: number;

  // Raw on-chain values
  totalSupply: bigint;
  totalBorrows: bigint;
  totalCash: bigint;
  totalReserves: bigint;
  exchangeRate: bigint;
  borrowRatePerBlock: bigint;
  supplyRatePerBlock: bigint;
  reserveFactor: bigint;
  collateralFactor: bigint;

  // Computed display values
  supplyAPY: number;
  borrowAPY: number;
  utilization: number;
  totalSupplyUSD: number;
  totalSupplyUnderlying: number;
  totalBorrowsUSD: number;
  availableLiquidityUSD: number;
  priceUSD: number;
};

export type UserMarketPosition = {
  cToken: Address;
  cTokenBalance: bigint;
  borrowBalance: bigint;
  supplyBalanceUnderlying: bigint;
  supplyBalanceUSD: number;
  borrowBalanceUSD: number;
  isCollateral: boolean;
};

export type AccountLiquidity = {
  error: bigint;
  liquidity: bigint;
  shortfall: bigint;
};

export type UserAccount = {
  xrplAddress: string;
  proxyAddress: Address;
  totalSupplyUSD: number;
  totalBorrowUSD: number;
  netAPY: number;
  borrowLimitUSD: number;
  borrowLimitUsed: number;
  healthFactor: number;
  positions: UserMarketPosition[];
  liquidity: AccountLiquidity;
};

export type ModalAction = "supply" | "withdraw" | "borrow" | "repay";
