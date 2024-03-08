import { Address } from "viem";

export type Coins = {
  ETH: number;
  USDC: number;
  USDT: number;
  DAI: number;
  WBTC: number;
};

export type CoinSymbolList = "ETH" | "USDC";

export type SaveSortsProps = {
  apy: boolean;
  poolSize: boolean;
};

export type DecimalTokens = {
  decimalTokenA: number | undefined;
  decimalTokenB: number | undefined;
};

export type GraphData = {
  time: string;
  value: number;
};

export type HistoryApy = {
  timestamp: number;
  interest_rate: number;
  utilization_rate: number;
};

export type Fee = {
  loanFee: bigint;
  flashLoanFee: bigint;
  interestFee: bigint;
};

export type InterestRateInfo = {
  minValue: bigint;
  maxValue: bigint;
  optimalUtilizationRate: bigint;
  utilizationRate: bigint;
  interestRate: bigint;
};

export type TokenInfo = {
  dTokenPrice: bigint;
  lTokenPrice: bigint;
  dToken: Address;
  lToken: Address;
};

export type ReserveInfo = {
  symbol: string;
  imgSrc: string;
  address: Address;
  decimals: number;
  supplyCap: bigint;
  supply: bigint;
  debt: bigint;
  fee: Fee;
  lastBlock: number;
  lastTime: number;
  isActivated: boolean;
  interestRateInfo: InterestRateInfo;
  tokenInfo: TokenInfo;
};

export type BalanceCoins = {
  [key: string]: bigint;
  ETH: bigint;
  USDC: bigint;
  USDT: bigint;
  DAI: bigint;
  WBTC: bigint;
};
