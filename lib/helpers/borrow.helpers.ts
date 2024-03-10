import { BorrowerPool, LightLenderPool } from "../api/generated/schemas";
import {
  BorrowPoolsApy,
  CollateralInfos,
  DecimalTokens,
  LenderPoolSet,
  PairReservesInfos,
  PoolLiquidities,
  PoolSizes,
  PoolUtilizations,
  TokenPrices,
} from "../types/farm.types";
import { getAssetSymbol, getPairAssetDecimals } from "./asset.helper";
import {
  aprToApy,
  getDepositBalance,
  getInterestRate,
  getPoolLiquidity,
  getPoolUtilization,
} from "./lenderPool.helpers";
import { toPercentage } from "./numberFormat.helpers";
import { bigIntToDecimal } from "./main.helpers";
import { Coins, ReserveInfo } from "../types/save.types";
import { Address } from "viem";
import { MAIN_ERRORS } from "../errors/main.errors";

export const getSaveRate = (
  interestRate: number,
  interestFees: number,
  utilizationRate: number
): number | undefined => {
  const rate = (1 - interestFees) * interestRate * utilizationRate;

  const formattedRate = toPercentage(rate);
  return formattedRate;
};

export const getUserLeverage = (farmerCF: number | undefined) => {
  try {
    if (farmerCF !== undefined) {
      if (farmerCF !== 1) {
        return farmerCF / (farmerCF - 1);
      }
    }
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

/**
 * Return the lp token icons
 * @param pool pool to get data from
 * @return string[]
 */
export const getBorrowAssetIcons = (pool?: BorrowerPool) => {
  try {
    let borrowPoolAssets = pool?.lenderpool_set;
    var assetIcons: string[] = [];

    borrowPoolAssets?.forEach((set) => {
      const thumbnail_uri = set?.asset.fa12?.thumbnail_uri;
      if (thumbnail_uri) assetIcons.push(thumbnail_uri);
    });

    return assetIcons;
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

/**
 * Retrieves the pool LP Address
 * @param pool pool to get data from
 * @returns string or undefined
 */
export const getBorrowerPoolLpAddress = (
  pool?: BorrowerPool
): string | undefined => {
  try {
    let address = pool?.dex_info.lp.lp_address;

    return address;
  } catch (error) {
    throw Error("Error : " + error);
  }
};
export const getLightLenderPool = (
  pool: BorrowerPool | undefined
): LenderPoolSet => {
  try {
    if (!pool) {
      return {
        lenderPoolSetA: undefined,
        lenderPoolSetB: undefined,
      };
    } else {
      const lightLenderPoolA = pool.lenderpool_set.find(
        (lightLenderPool: LightLenderPool) =>
          lightLenderPool.asset.fa12?.address ===
          pool.dex_info.token_a.fa12?.address
      );
      const lightLenderPoolB = pool.lenderpool_set.find(
        (lightLenderPool: LightLenderPool) =>
          lightLenderPool.asset.fa12?.address ===
          pool.dex_info.token_b.fa12?.address
      );
      return {
        lenderPoolSetA: lightLenderPoolA,
        lenderPoolSetB: lightLenderPoolB,
      };
    }
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

export const getBorrowerPoolTokens = (pool?: BorrowerPool): string[] => {
  try {
    var tokens: string[] = [];

    const { lenderPoolSetA, lenderPoolSetB } = getLightLenderPool(pool);
    const symbolA = getAssetSymbol(lenderPoolSetA?.asset);
    symbolA && tokens.push(symbolA);

    const symbolB = getAssetSymbol(lenderPoolSetB?.asset);
    symbolB && tokens.push(symbolB);

    return tokens;
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

/**
 * Returns the name of the pool in the format of "tokenA/tokenB"
 * @param pool pool to get data from
 * @return string
 */
export const getFormattedPoolName = (
  collateralInfos?: CollateralInfos
): string | undefined => {
  try {
    return collateralInfos?.symbol;
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

export const getSelectedCollateralInfos = (
  collateralsInfos: CollateralInfos[],
  assetLP: Address
) => {
  try {
    if (collateralsInfos && collateralsInfos.length !== 0) {
      return collateralsInfos.find(
        (collateralInfos: CollateralInfos) =>
          collateralInfos.addressLP === assetLP
      );
    }
  } catch (error) {
    throw new Error(MAIN_ERRORS.FAILED_HELPER + error);
  }
};

export const getTokensSymbol = (
  collateralInfos: CollateralInfos | undefined
): string[] => {
  try {
    if (collateralInfos !== undefined) {
      return collateralInfos?.symbol.split("/");
    }
    return [];
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

export const getCollateralPriceToken = (
  borrowerPool: BorrowerPool | undefined,
  tokenA_price: number | undefined,
  tokenB_price: number | undefined
) => {
  try {
    if (
      borrowerPool &&
      tokenA_price &&
      tokenB_price &&
      borrowerPool.dex_info.token_a_dex_supply &&
      borrowerPool.dex_info.token_b_dex_supply &&
      borrowerPool.dex_info.lp_total_supply
    ) {
      return (
        (borrowerPool.dex_info.token_a_dex_supply * tokenA_price +
          borrowerPool.dex_info.token_b_dex_supply * tokenB_price) /
        borrowerPool.dex_info.lp_total_supply
      );
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getPricePairTokens = (
  pool: BorrowerPool | undefined
): TokenPrices => {
  if (!pool) {
    return {
      tokenA: undefined,
      tokenB: undefined,
    };
  } else {
    // modify source of price TokenA
    const priceTokenA = 1;

    const amountA = pool.dex_info.token_a_dex_supply;
    const amountB = pool.dex_info.token_b_dex_supply;
    var priceTokenB = 0;
    const { decimalTokenA, decimalTokenB }: DecimalTokens =
      getPairAssetDecimals(pool);
    if (
      amountA !== undefined &&
      amountB &&
      decimalTokenA !== undefined &&
      decimalTokenB !== undefined
    ) {
      priceTokenB =
        ((amountA * 10 ** -decimalTokenA) / (amountB * 10 ** -decimalTokenB)) *
        priceTokenA;
    }

    return {
      tokenA:
        decimalTokenA !== undefined
          ? priceTokenA * 10 ** -decimalTokenA
          : undefined,
      tokenB:
        decimalTokenB !== undefined
          ? priceTokenB * 10 ** -decimalTokenB
          : undefined,
    };
  }
};

export const getBorrowAPYLP = (
  borrowApyA: number | undefined,
  borrowApyB: number | undefined
) => {
  try {
    if (borrowApyA !== undefined && borrowApyB != undefined) {
      return (borrowApyA + borrowApyB) / 2;
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getPairBorrowApy = (
  reservesInfo: ReserveInfo[] | undefined,
  tokens: string[] | undefined
): BorrowPoolsApy => {
  try {
    if (reservesInfo === undefined || tokens === undefined) {
      return { apyA: undefined, apyB: undefined };
    } else {
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[0]
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[1]
      );

      return {
        apyA: getBorrowApy(reserveInfoTokenUn),
        apyB: getBorrowApy(reserveInfoTokenDeux),
      };
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getPairPoolSize = (
  reservesInfo: ReserveInfo[] | undefined,
  tokens: string[] | undefined
): PoolSizes => {
  try {
    if (reservesInfo === undefined || tokens === undefined) {
      return { poolSizeA: undefined, poolSizeB: undefined };
    } else {
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[0]
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[1]
      );

      return {
        poolSizeA: getDepositBalance(reserveInfoTokenUn),
        poolSizeB: getDepositBalance(reserveInfoTokenDeux),
      };
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getPairLiquidities = (
  reservesInfo: ReserveInfo[] | undefined,
  tokens: string[] | undefined
): PoolLiquidities => {
  try {
    if (reservesInfo === undefined || tokens === undefined) {
      return { poolLiquiditieA: undefined, poolLiquiditieB: undefined };
    } else {
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[0]
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[1]
      );

      return {
        poolLiquiditieA: getPoolLiquidity(reserveInfoTokenUn),
        poolLiquiditieB: getPoolLiquidity(reserveInfoTokenDeux),
      };
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getPairPrice = (
  coinPrices: Coins,
  reservesInfo?: ReserveInfo[],
  tokens?: string[]
): TokenPrices => {
  try {
    if (!reservesInfo || !tokens || tokens.length < 2) {
      return { tokenA: undefined, tokenB: undefined };
    } else {
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[0]
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[1]
      );

      return {
        tokenA: coinPrices[reserveInfoTokenUn?.symbol as keyof Coins],
        tokenB: coinPrices[reserveInfoTokenDeux?.symbol as keyof Coins],
      };
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getPairReservesInfos = (
  reservesInfo: ReserveInfo[] | undefined,
  tokens: string[] | undefined
): PairReservesInfos => {
  try {
    if (reservesInfo === undefined || tokens === undefined) {
      return { reserveInfoTokenA: undefined, reserveInfoTokenB: undefined };
    } else {
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[0]
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[1]
      );

      return {
        reserveInfoTokenA: reserveInfoTokenUn,
        reserveInfoTokenB: reserveInfoTokenDeux,
      };
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getPairUtilizations = (
  reservesInfo: ReserveInfo[] | undefined,
  tokens: string[] | undefined
): PoolUtilizations => {
  try {
    if (reservesInfo === undefined || tokens === undefined) {
      return { poolUtilizationsA: undefined, poolUtilizationsB: undefined };
    } else {
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[0]
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => reserveInfo.symbol === tokens[1]
      );

      return {
        poolUtilizationsA: getPoolUtilization(reserveInfoTokenUn),
        poolUtilizationsB: getPoolUtilization(reserveInfoTokenDeux),
      };
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getBorrowApy = (reserveInfo: ReserveInfo | undefined) => {
  try {
    const interestRate = getInterestRate(reserveInfo);
    if (interestRate !== undefined) {
      return aprToApy(interestRate);
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getTotalApy = (
  collateral: number | undefined,
  lpApy: number | undefined,
  loan: number | undefined,
  borrowAPY: number | undefined
) => {
  try {
    if (
      collateral !== undefined &&
      lpApy !== undefined &&
      loan !== undefined &&
      borrowAPY !== undefined
    ) {
      if (collateral - loan === 0) {
        return 0;
      }
      return (collateral * lpApy - loan * borrowAPY) / (collateral - loan);
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getBorrowAPY = (
  tokenPrices: TokenPrices,
  borrowApyA?: number,
  borrowApyB?: number,
  loanA?: number,
  loanB?: number
) => {
  try {
    if (
      loanA &&
      borrowApyA &&
      loanB &&
      borrowApyB &&
      tokenPrices.tokenA &&
      tokenPrices.tokenB
    ) {
      if (loanA === 0 && loanB === 0) {
        return 0;
      } else {
        return (
          (loanA * tokenPrices.tokenA * borrowApyA +
            loanB * tokenPrices.tokenA * borrowApyB) /
          (loanA * tokenPrices.tokenA + loanB * tokenPrices.tokenB)
        );
      }
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getTotalLpLocked = (borrowerPool: BorrowerPool) => {
  try {
    return borrowerPool.data_contract.supply || 0;
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

export const getMaxLpApy = (
  maxLeverage: number | undefined,
  borrowAPY: number | undefined,
  lpAPy: number | undefined
) => {
  try {
    if (
      maxLeverage !== undefined &&
      borrowAPY !== undefined &&
      lpAPy !== undefined
    ) {
      return maxLeverage * lpAPy - (maxLeverage - 1) * borrowAPY;
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

export const getMaxLT = (collateralInfos: CollateralInfos | undefined) => {
  try {
    if (collateralInfos !== undefined) {
      return bigIntToDecimal(
        collateralInfos.liquidationThresholdInfo.unBalancedLoanThreshold,
        18
      );
    }
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

/**
 * returns the balance liquidation threshold of the pool in percentage
 * @param pool pool to get data from
 * @returns number | undefined
 */
export const getBorrowerPoolBalanceLT = (
  collateralInfos: CollateralInfos | undefined
): number | undefined => {
  try {
    if (collateralInfos !== undefined) {
      return bigIntToDecimal(
        collateralInfos.liquidationThresholdInfo.balancedLoanThreshold,
        18
      );
    }
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

/**
 * returns the minimum collateral factor of the pool in percentage
 * @param pool pool to get data from
 * @returns number | undefined
 */
export const getBorrowerPoolMinCF = (
  collateralInfos: CollateralInfos
): number | undefined => {
  try {
    let balance = getBorrowerPoolBalanceLT(collateralInfos);

    return balance !== undefined ? balance * 1.1 : undefined;
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

export const getBorrowerPoolMaxLeverage = (
  collateralInfos: CollateralInfos | undefined
): number | undefined => {
  try {
    if (collateralInfos !== undefined) {
      let minCF = getBorrowerPoolMinCF(collateralInfos);

      if (minCF !== undefined && minCF !== 1) {
        return minCF / (minCF - 1);
      }
    }
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

// Warning this function dont take fi but should be
export const getBorrowerMaxLeverage = (
  collateralValue: number | undefined,
  collateralPrice: number | undefined,
  loanA: number | undefined,
  loanB: number | undefined,
  blt: number | undefined,
  ult: number | undefined
): number | undefined => {
  try {
    if (
      loanA !== undefined &&
      loanB !== undefined &&
      collateralValue !== undefined &&
      collateralPrice !== undefined &&
      blt !== undefined &&
      ult !== undefined
    ) {
      const buffer = 0.1;

      if (loanA < loanB) {
        return (
          ((1 / (blt - 1 / (1 + buffer))) *
            (collateralValue / (1 + buffer) -
              2 * loanA * blt +
              (loanA - loanB) * ult)) /
          collateralPrice
        );
      } else {
        return (
          ((1 / (blt - 1 / (1 + buffer))) *
            (collateralValue / (1 + buffer) -
              2 * loanB * blt +
              (loanB - loanA) * ult)) /
          collateralPrice
        );
      }
    }
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

export const lpToLeverage = (
  collateralAmount: number | undefined,
  amount: number,
  borrowerLeverage: number | undefined,
  maxLeverageFactor: number | undefined,
  borrowerMaxLeverageLP: number | undefined
) => {
  try {
    if (
      borrowerLeverage !== undefined &&
      maxLeverageFactor !== undefined &&
      borrowerMaxLeverageLP !== undefined
    ) {
      if (borrowerLeverage > 1 && collateralAmount) {
        return (
          (((borrowerMaxLeverageLP - amount < 1
            ? borrowerMaxLeverageLP
            : amount) +
            collateralAmount) /
            (borrowerMaxLeverageLP + collateralAmount)) *
          maxLeverageFactor
        );
      } else {
        if (collateralAmount) {
          return amount / collateralAmount + 1;
        }
      }
    }
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

export const getMaxRelease = (
  collateralValue: number | undefined,
  collateralPrice: number | undefined,
  loanA: number | undefined,
  loanB: number | undefined,
  borrowerLT: number | undefined
) => {
  try {
    if (
      borrowerLT !== undefined &&
      loanA !== undefined &&
      loanB !== undefined &&
      collateralPrice !== undefined &&
      collateralValue !== undefined
    ) {
      const buffer = 0.1;

      return (
        (collateralValue - borrowerLT * (1 + buffer) * (loanA + loanB)) /
        collateralPrice
      );
    }
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

// export const getColor = (totalApy: number | undefined) => {
//   try {
//     if (totalApy === undefined || isNaN(totalApy) || totalApy === 0) {
//       return main.colors.securdBlack;
//     } else if (totalApy > 0) {
//       return main.colors.systemGreen;
//     } else {
//       return main.colors.systemRed;
//     }
//   } catch (error) {
//     throw new Error("getColor failed : " + error);
//   }
// };

export const getTokenUnit = (
  numberA: number | undefined,
  numberB: number | undefined,
  borrowerPool: BorrowerPool | undefined
) => {
  try {
    const { decimalTokenA, decimalTokenB }: DecimalTokens =
      getPairAssetDecimals(borrowerPool);

    if (
      numberA !== undefined &&
      numberB !== undefined &&
      decimalTokenA !== undefined &&
      decimalTokenB !== undefined
    ) {
      return {
        numberA: numberA * 10 ** -decimalTokenA,
        numberB: numberB * 10 ** -decimalTokenB,
      };
    } else {
      return {
        numberA: undefined,
        numberB: undefined,
      };
    }
  } catch (error) {
    throw new Error("Error" + error);
  }
};

/**
 * Returns the contract address of borrower pool
 * @param pool pool to get data from
 * @returns string or undefined
 */
export const getBorrowerPoolAddress = (
  pool?: BorrowerPool
): string | undefined => {
  try {
    let address = pool?.data_contract?.address as string | undefined;

    return address;
  } catch (error) {
    throw Error("Error : " + error);
  }
};

export const getMaximumRepayToken = (
  amountLoan: number,
  walletBalance: number
) => {
  try {
    return Math.min(amountLoan, walletBalance);
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

export const getMaximumBorrow = (
  token: "a" | "b",
  loanA: number,
  loanB: number,
  blt: number,
  ult: number,
  buffer: number,
  tokenA_Lprice: number,
  tokenB_Lprice: number,
  tokenA_price: number,
  tokenB_price: number,
  collateral: number
) => {
  if (blt && ult) {
    loanA = loanA * tokenA_Lprice * tokenA_price;
    loanB = loanB * tokenB_Lprice * tokenB_price;

    const maxBorrow_v1 =
      (1 / (2 * blt - ult)) *
      (collateral / (1 + buffer) -
        2 * blt * (token === "a" ? loanA : loanB) +
        ult * (token === "a" ? loanA - loanB : loanB - loanA));

    const maxBorrow_v2 =
      (1 / ult) *
      (collateral / (1 + buffer) -
        2 * blt * (token === "a" ? loanB : loanA) +
        ult * (token === "a" ? loanB - loanA : loanA - loanB));
    if (token === "a") {
      if (maxBorrow_v1 < loanB - loanA && maxBorrow_v1 > 0) {
        return maxBorrow_v1 / tokenA_price;
      } else {
        return maxBorrow_v2 / tokenA_price;
      }
    } else {
      if (maxBorrow_v1 < loanA - loanB && maxBorrow_v1 > 0) {
        return maxBorrow_v1 / tokenB_price;
      } else {
        return maxBorrow_v2 / tokenB_price;
      }
    }
  }
};
