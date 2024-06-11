import type { LenderPool, LightLenderPool } from "../api/generated/schemas";
import { LENDER_POOL_ERRORS } from "../errors/lenderPool.errors";
import type { Coins, ReserveInfo, GraphData } from "../types/save.types";
import { getAssetDecimals } from "./asset.helper";
import { getSaveRate } from "./borrow.helpers";
import { BLOCKS_IN_YEAR } from "./dates.helpers";
import { bigIntToDecimal } from "./main.helpers";
import { MAIN_ERRORS } from "../errors/main.errors";
import type { Address } from "viem";

/**
 * Returns the asset address of a lender pool
 * @param lenderPool Lender pool to get data from
 * @returns Address => Asset address
 */
export const getAssetAddress = (lenderPool: LenderPool): Address => {
  try {
    return lenderPool.asset.fa12?.address as Address;
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.ASSET_ADDRESS_NOT_FOUND);
  }
};

/**
 * Returns the d token price for a given pool
 * @param pool pool to get data from
 * @returns number / undefined
 */
export const getDtokenprice = (
  reserveInfo: ReserveInfo
): bigint | undefined => {
  try {
    return reserveInfo.tokenInfo.dTokenPrice
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.D_TOKEN_PRICE_FAILED);
  }
};

export const getFormattedInterestRate = (
  pool: LenderPool | LightLenderPool
) => {
  try {
    const rate = pool.model_contract.interest_rate;

    return rate / 100;
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.FORMATTED_INTEREST_RATE_FAILED);
  }
};

/**
 * Return the pool APY (live computed)
 * @param pool pool to get data from
 * @param interest_rate_history history of interest rate
 * @param nbCoumpound componding frequency
 * @returns Pool APY (in percent)
 */
export const getPoolAPY = (
  pool?: LenderPool | LightLenderPool,
  interest_rate_history?: number
): number | undefined => {
  try {
    const blocksPerYear = BLOCKS_IN_YEAR;

    const interest_rate = pool
      ? getFormattedInterestRate(pool)
      : interest_rate_history;

    return interest_rate
      ? (1 + interest_rate / blocksPerYear) ** blocksPerYear - 1
      : undefined;
  } catch (error) {
    throw new Error(MAIN_ERRORS.FAILED_HELPER + error);
  }
};

/**
 *
 * @param interestRate
 * @returns apy
 */
export const aprToApy = (interestRate: number) => {
  try {
    const blocksPerYear = BLOCKS_IN_YEAR;

    return (1 + interestRate / blocksPerYear) ** blocksPerYear - 1;
  } catch (error) {
    throw new Error(MAIN_ERRORS.FAILED_HELPER + error);
  }
};

/**
 * Returns the pool size
 * @param pool pool to get data from
 * @returns
 */
export const getPoolSize = (
  reserveInfo: ReserveInfo,
  coinsPrice: Coins
): number | undefined => {
  try {
    const depositBalance = bigIntToDecimal(getDepositBalance(reserveInfo), reserveInfo.decimals);
    const price = coinsPrice[reserveInfo.symbol as keyof Coins];
    if (depositBalance !== undefined) {
      return depositBalance * price;
    }
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.POOL_SIZE_FAILED);
  }
};

/**
 * Returns the pool utilization rate
 * @param pool pool to get data from
 * @returns number or undefined
 */
export const getPoolUtilization = (
  reserveInfo: ReserveInfo | undefined
): number | undefined => {
  try {
    if (reserveInfo !== undefined) {
      const lendingPool = getDepositBalance(reserveInfo);
      const liquidityA = getPoolLiquidity(reserveInfo);
      const loan = (bigIntToDecimal(lendingPool, reserveInfo?.decimals) ?? 0) - (bigIntToDecimal(liquidityA, reserveInfo?.decimals) ?? 0);
      return loan / (bigIntToDecimal(lendingPool, reserveInfo?.decimals) ?? 0);
    }
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.POOL_UTILIZATION_FAILED);
  }
};

/**
 * Return the token icons
 * @param lenderPools lenderPools to get data from
 * @return string[]
 */
export const getSaveAssetIcons = (lenderPools: LenderPool[]): string[] => {
  try {
    const assetIcons: string[] = [];

    lenderPools.forEach((set) => {
      const icon_uri = set?.asset.fa12?.thumbnail_uri;
      if (icon_uri) assetIcons.push(icon_uri || "");
    });

    return assetIcons;
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.GET_SAVE_ASSET_ICON_FAILED);
  }
};

/**
 * Return saving apy of a pool
 * @param pool lenderPool to get data from
 * @param interest_rate pool interest rate
 * @param utilization_rate pool utilization rate
 * @param nbPeriods number of period to compute apy
 * @returns Savings APY
 */
export const getSavingApy = (
  reserveInfo: ReserveInfo | undefined
): number | undefined => {
  try {
    if (reserveInfo !== undefined) {
      const interest_fees = bigIntToDecimal(reserveInfo.fee.reserveFee, 18);
      const utilizationRate = getPoolUtilization(reserveInfo);
      const pool_interest_rate = getInterestRate(reserveInfo);

      let saveRate =
        pool_interest_rate !== undefined &&
          interest_fees !== undefined &&
          utilizationRate !== undefined
          ? (getSaveRate(pool_interest_rate, interest_fees, utilizationRate) ?? 0) * 10000
          : 0;

      if (utilizationRate === 0) {
        saveRate = 0;
      }

      if (saveRate !== undefined) {
        return aprToApy(saveRate);
      }
    }
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.GET_SAVING_APY_FAILED);
  }
};

export const getInterestRate = (reserveInfo: ReserveInfo | undefined) => {
  try {
    if (reserveInfo !== undefined) {
      return bigIntToDecimal(reserveInfo.interestRateInfo.interestRate, 18);
    }
  } catch (error) {
    throw new Error(MAIN_ERRORS.FAILED_HELPER + error);
  }
};

/**
 *
 * @param reserveInfo
 * @returns an amount equal to deposits and interests
 */
export const getDepositBalance = (reserveInfo: ReserveInfo | undefined) => {
  try {
    if (reserveInfo !== undefined) {
      const supply = reserveInfo.supply;
      const dTokenPrice = getDtokenprice(reserveInfo);
      if (supply !== undefined && dTokenPrice !== undefined) {
        return supply * dTokenPrice / 10n ** BigInt(reserveInfo.decimals);
      }
    }
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.GET_DEPOSIT_BALANCE_FAILED);
  }
};

export const getPoolGlobalDeposit = (pool?: LenderPool) => {
  try {
    const global_deposit = pool?.global_deposit || 0;
    const decimals = getAssetDecimals(pool?.asset);

    return global_deposit * 10 ** -decimals;
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.GET_POOL_GLOBAL_DEPOSIT_FAILED);
  }
};

/**
 *
 * @param reserveInfo data corresponding for an asset
 * @returns amount of liquidity available
 */
export const getPoolLiquidity = (reserveInfo: ReserveInfo | undefined) => {
  try {
    if (reserveInfo !== undefined) {
      return reserveInfo.liquidity;
    }
  } catch (error) {
    throw new Error(MAIN_ERRORS.FAILED_HELPER + error);
  }
};

/**
 *
 * @param reserveInfo
 * @returns amount of deposits made by depositors
 */
export const getDeposit = (reserveInfo: ReserveInfo | undefined) => {
  try {
    if (reserveInfo !== undefined) {
      return reserveInfo.supply;
    }
  } catch (error) {
    throw new Error(MAIN_ERRORS.FAILED_HELPER + error);
  }
};

export const getUtilizedToken = (reserveInfo: ReserveInfo) => {
  try {
    return reserveInfo.debt;
  } catch (error) {
    throw new Error(MAIN_ERRORS.FAILED_HELPER + error);
  }
};

/**
 *
 * @param reserveInfo data corresponding for an asset
 * @returns LtokenPrice, it's decimal unit
 */
export const getLtokenprice = (reserveInfo: ReserveInfo | undefined) => {
  try {
    return bigIntToDecimal(reserveInfo?.tokenInfo.lTokenPrice, 18);
  } catch (error) {
    throw new Error(MAIN_ERRORS.FAILED_HELPER + error);
  }
};

export const getAverageMinMaxApy = (interestHistory: GraphData[]) => {
  try {
    const min = Math.min(
      ...interestHistory.map(
        (interestPeriod: GraphData) => interestPeriod.value
      )
    );
    const max = Math.max(
      ...interestHistory.map(
        (interestPeriod: GraphData) => interestPeriod.value
      )
    );

    const average =
      Array.from(interestHistory, (x) => x.value).reduce(
        (partialSum, a) => partialSum + a,
        0
      ) / interestHistory.length;

    return average !== undefined && !Number.isNaN(average)
      ? [average, max, min]
      : [undefined, undefined, undefined];
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.GET_AVERAGE_MIN_MAX_APY_FAILED);
  }
};

export const getMinDepositAmount = (
  pool: LenderPool | undefined
): number | undefined => {
  try {
    return pool?.data_contract.min_deposit_amount;
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.GET_MIN_DEPOSIT_AMOUNT_FAILED);
  }
};

export const getPoolContractAddress = (
  pool?: LenderPool
): string | undefined => {
  try {
    return pool?.data_contract.address as string | undefined;
  } catch (error) {
    throw new Error(LENDER_POOL_ERRORS.GET_POOL_CONTRACT_ADDRESS_FAILED);
  }
};
