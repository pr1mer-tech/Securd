import type { Address } from "viem";

export type MarketData = {
  cToken: Address;
  underlying: Address;
  symbol: string;
  name: string;
  cTokenDecimals: number;
  underlyingSymbol: string;
  underlyingDecimals: number;
  isListed: boolean;
  isRewarded: boolean;
  // XRPL Ledger identity — present only for IOU markets (absent for native XRP).
  // Drives the IOU Amount object in SUPPLY/REPAY payments.
  xrplCurrency?: string;
  xrplIssuer?: string;

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
  borrowCap: bigint;
  mintGuardianPaused: boolean;
  borrowGuardianPaused: boolean;
  transferGuardianPaused: boolean;
  closeFactor: bigint;
  liquidationIncentive: bigint;
  protocolSeizeShare: bigint;

  // Interest rate model values
  interestRateModel: Address;
  blocksPerYear: bigint;
  baseRatePerBlock: bigint;
  multiplierPerBlock: bigint;
  jumpMultiplierPerBlock: bigint;
  kink: bigint;

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
