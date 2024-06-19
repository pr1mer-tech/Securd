import type { Address } from "viem";
import type { LightLenderPool } from "../api/generated/schemas";
import type { ReserveInfo } from "./save.types";

export type BorrowSortsProps = {
  apy: boolean;
  poolSize: boolean;
};

export type BorrowPoolsApy = {
  apyA: number | undefined;
  apyB: number | undefined;
};

export type PoolSizes = {
  poolSizeA: number | undefined;
  poolSizeB: number | undefined;
};

export type PoolUtilizations = {
  poolUtilizationsA: number | undefined;
  poolUtilizationsB: number | undefined;
};

export type UtilizationTokens = {
  utilizationTokenA: number | undefined;
  utilizationTokenB: number | undefined;
};

export type DecimalTokens = {
  decimalTokenA: number | undefined;
  decimalTokenB: number | undefined;
};

export type BorrowTotalAmounts = {
  borrowTotalAmountA: number | undefined;
  borrowTotalAmountB: number | undefined;
};
export type LoanAmountTokens = {
  loanAmountTokenA: number | undefined;
  loanAmountTokenB: number | undefined;
};
export type PoolLiquidities = {
  poolLiquiditieA: number | undefined;
  poolLiquiditieB: number | undefined;
};

export type LenderPoolSet = {
  lenderPoolSetA: LightLenderPool | undefined;
  lenderPoolSetB: LightLenderPool | undefined;
};
export type BorrowerBalances = {
  borrowBalanceA: number | undefined;
  borrowBalanceB: number | undefined;
};

export type LtokensPrice = {
  ltokenPriceA: number | undefined;
  ltokenPriceB: number | undefined;
};

export type DtokensPrice = {
  dtokenPriceA: number | undefined;
  dtokenPriceB: number | undefined;
};

export type TokenPrices = {
  tokenA?: number;
  tokenB?: number;
};

export type TokenInfo = {
  nbAssets: bigint;
  router: Address;
  assets: readonly Address[];
};

export type LiquidationThresholdInfo = {
  balancedLoanThreshold_0: bigint;
  balancedLoanThreshold_b: bigint;
  unBalancedLoanThreshold_0: bigint;
  unBalancedLoanThreshold_b: bigint;
  buffer?: bigint;
};

export enum PoolType {
  UniswapV2 = "UNIV2",
};

export function poolLink(poolType: PoolType, address: Address): string {
  if (poolType === PoolType.UniswapV2) {
    return `https://info.uniswap.org/pair/${address}`;
  }
  return "";
}

export type CollateralInfos = {
  symbol: string;
  token_0: Address;
  token_1: Address;
  decimals: number;
  address: Address;
  addressLP: Address;
  poolType: PoolType;
  tokenInfo: TokenInfo;
  liquidationThresholdInfo: LiquidationThresholdInfo;
  liquidationPremium: bigint;
  isActivated: boolean;
  lpApr: number;
};

export type Proportions = {
  tokenA: bigint;
  tokenB: bigint;
};

export type Debts = {
  tokenA: bigint;
  tokenB: bigint;
};

export type PairReservesInfos = {
  reserveInfoTokenA: ReserveInfo | undefined;
  reserveInfoTokenB: ReserveInfo | undefined;
};

export type PositionDataParams = {
  directionCollateral: boolean;
  directionLoanA: boolean;
  directionLoanB: boolean;
  tokenAddress?: Address;
  collateralAmount?: bigint;
  loanA?: number;
  loanB?: number;
};

export type PositionData = {
  collateral: number;
  collateralValue: number;
  debt0: number;
  debtValue0: number;
  debt1: number;
  debtValue1: number;
  collateralFactor: number;
  liquidationThreshold: number;
  leverageFactor: number;
};

export type AmountData = {
  amount0: number;
  amount1: number;
};

export type Amounts = {
  amount0: number;
  amount1: number;
};

export type BorrowToken = {
  token: string;
  index: number;
};
