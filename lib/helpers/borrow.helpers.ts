import type { BorrowerPool, LightLenderPool } from "../api/generated/schemas";
import type {
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
import { bigIntToDecimal, isEqualAddress } from "./main.helpers";
import type { Coins, ReserveInfo } from "../types/save.types";
import type { Address } from "viem";
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
    throw new Error(`Error : ${error}`);
  }
};

/**
 * Return the lp token icons
 * @param pool pool to get data from
 * @return string[]
 */
export const getBorrowAssetIcons = (pool?: BorrowerPool) => {
  try {
    const borrowPoolAssets = pool?.lenderpool_set;
    const assetIcons: string[] = [];

    borrowPoolAssets?.forEach((set) => {
      const thumbnail_uri = set?.asset.fa12?.thumbnail_uri;
      if (thumbnail_uri) assetIcons.push(thumbnail_uri);
    });

    return assetIcons;
  } catch (error) {
    throw new Error(`Error : ${error}`);
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
    const address = pool?.dex_info.lp.lp_address;

    return address;
  } catch (error) {
    throw Error(`Error : ${error}`);
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
    }
      const lightLenderPoolA = pool.lenderpool_set.find(
        (lightLenderPool: LightLenderPool) =>
          lightLenderPool.asset.fa12?.address?.toLowerCase() ===
          pool.dex_info.token_a.fa12?.address?.toLowerCase()
      );
      const lightLenderPoolB = pool.lenderpool_set.find(
        (lightLenderPool: LightLenderPool) =>
          lightLenderPool.asset.fa12?.address?.toLowerCase() ===
          pool.dex_info.token_b.fa12?.address?.toLowerCase()
      );
      return {
        lenderPoolSetA: lightLenderPoolA,
        lenderPoolSetB: lightLenderPoolB,
      };
  } catch (error) {
    throw new Error(`Error : ${error}`);
  }
};

export const getBorrowerPoolTokens = (pool?: BorrowerPool): string[] => {
  try {
    const tokens: string[] = [];

    const { lenderPoolSetA, lenderPoolSetB } = getLightLenderPool(pool);
    const symbolA = getAssetSymbol(lenderPoolSetA?.asset);
    symbolA && tokens.push(symbolA);

    const symbolB = getAssetSymbol(lenderPoolSetB?.asset);
    symbolB && tokens.push(symbolB);

    return tokens;
  } catch (error) {
    throw new Error(`Error : ${error}`);
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
    throw new Error(`Error : ${error}`);
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
    throw new Error(`Error : ${error}`);
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
    throw new Error(`Error${error}`);
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
  }
    // modify source of price TokenA
    const priceTokenA = 1;

    const amountA = pool.dex_info.token_a_dex_supply;
    const amountB = pool.dex_info.token_b_dex_supply;
    let priceTokenB = 0;
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
};

export const getBorrowAPYLP = (
  borrowApyA: number | undefined,
  borrowApyB: number | undefined
) => {
  try {
    if (borrowApyA !== undefined && borrowApyB !== undefined) {
      return (borrowApyA + borrowApyB) / 2;
    }
  } catch (error) {
    throw new Error(`Error${error}`);
  }
};

export const getPairBorrowApy = (
  reservesInfo: ReserveInfo[] | undefined,
  collateralsInfos: CollateralInfos | undefined
): BorrowPoolsApy => {
  try {
    if (reservesInfo === undefined || collateralsInfos === undefined) {
      return { apyA: undefined, apyB: undefined };
    }
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, collateralsInfos.token_0)
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, collateralsInfos.token_1)
      );

      return {
        apyA: getBorrowApy(reserveInfoTokenUn),
        apyB: getBorrowApy(reserveInfoTokenDeux),
      };
  } catch (error) {
    throw new Error(`Error${error}`);
  }
};

export const getPairPoolSize = (
  reservesInfo: ReserveInfo[] | undefined,
  collateralsInfos: CollateralInfos | undefined
): PoolSizes => {
  try {
    if (reservesInfo === undefined || collateralsInfos === undefined) {
      return { poolSizeA: undefined, poolSizeB: undefined };
    }
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, collateralsInfos.token_0)
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, collateralsInfos.token_1)
      );

      return {
        poolSizeA: bigIntToDecimal(getDepositBalance(reserveInfoTokenUn), reserveInfoTokenUn?.decimals),
        poolSizeB: bigIntToDecimal(getDepositBalance(reserveInfoTokenDeux), reserveInfoTokenDeux?.decimals),
      };
  } catch (error) {
    throw new Error(`Error${error}`);
  }
};

export const getPairLiquidities = (
  reservesInfo: ReserveInfo[] | undefined,
  collateralsInfos: CollateralInfos | undefined
): PoolLiquidities => {
  try {
    if (reservesInfo === undefined || collateralsInfos === undefined) {
      return { poolLiquiditieA: undefined, poolLiquiditieB: undefined };
    }
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, collateralsInfos.token_0)
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, collateralsInfos.token_1)
      );

      return {
        poolLiquiditieA: bigIntToDecimal(getPoolLiquidity(reserveInfoTokenUn), reserveInfoTokenUn?.decimals),
        poolLiquiditieB: bigIntToDecimal(getPoolLiquidity(reserveInfoTokenDeux), reserveInfoTokenDeux?.decimals),
      };
  } catch (error) {
    throw new Error(`Error${error}`);
  }
};

export const getPairPrice = (
  coinPrices: Coins,
  reservesInfo?: ReserveInfo[],
  userCollateralsInfo?: CollateralInfos
): TokenPrices => {
  try {
    if (!reservesInfo || !userCollateralsInfo) {
      return { tokenA: undefined, tokenB: undefined };
    }
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, userCollateralsInfo.token_0)
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, userCollateralsInfo.token_1)
      );

      return {
        tokenA: coinPrices[reserveInfoTokenUn?.symbol as keyof Coins],
        tokenB: coinPrices[reserveInfoTokenDeux?.symbol as keyof Coins],
      };
  } catch (error) {
    throw new Error(`Error${error}`);
  }
};

export const getPairReservesInfos = (
  reservesInfo: ReserveInfo[] | undefined,
  collateralsInfos: CollateralInfos | undefined
): PairReservesInfos => {
  try {
    if (reservesInfo === undefined || collateralsInfos === undefined) {
      return { reserveInfoTokenA: undefined, reserveInfoTokenB: undefined };
    }
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, collateralsInfos.token_0)
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, collateralsInfos.token_1)
      );

      return {
        reserveInfoTokenA: reserveInfoTokenUn,
        reserveInfoTokenB: reserveInfoTokenDeux,
      };
  } catch (error) {
    throw new Error(`Error${error}`);
  }
};

export const getPairUtilizations = (
  reservesInfo: ReserveInfo[] | undefined,
  collateralsInfos: CollateralInfos | undefined
): PoolUtilizations => {
  try {
    if (reservesInfo === undefined || collateralsInfos === undefined) {
      return { poolUtilizationsA: undefined, poolUtilizationsB: undefined };
    }
      const reserveInfoTokenUn = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, collateralsInfos.token_0)
      );

      const reserveInfoTokenDeux = reservesInfo.find(
        (reserveInfo) => isEqualAddress(reserveInfo.address, collateralsInfos.token_1)
      );

      return {
        poolUtilizationsA: getPoolUtilization(reserveInfoTokenUn),
        poolUtilizationsB: getPoolUtilization(reserveInfoTokenDeux),
      };
  } catch (error) {
    throw new Error(`Error${error}`);
  }
};

export const getBorrowApy = (reserveInfo: ReserveInfo | undefined) => {
  try {
    const interestRate = getInterestRate(reserveInfo);
    if (interestRate !== undefined) {
      return aprToApy(interestRate);
    }
  } catch (error) {
    throw new Error(`Error${error}`);
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
    throw new Error(`Error${error}`);
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
      }
        return (
          (loanA * tokenPrices.tokenA * borrowApyA +
            loanB * tokenPrices.tokenA * borrowApyB) /
          (loanA * tokenPrices.tokenA + loanB * tokenPrices.tokenB)
        );
    }
  } catch (error) {
    throw new Error(`Error${error}`);
  }
};

export const getTotalLpLocked = (borrowerPool: BorrowerPool) => {
  try {
    return borrowerPool.data_contract.supply || 0;
  } catch (error) {
    throw new Error(`Error : ${error}`);
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
    throw new Error(`Error${error}`);
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
    throw new Error(`Error : ${error}`);
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
    throw new Error(`Error : ${error}`);
  }
};

/**
 * returns the liquidation for the token (in percentage)
 * @param blt balanced loan threshold
 * @param ult unbalanced loan threshold
 * @param loanUSD loan in USD for the token
 * @param totalUSD total loan in USD
 */
export const getLiquidationThresholdForToken = (
  blt: number,
  ult: number,
  loanUSD: number,
  totalUSD: number // Total Loan
): number => {
  const brt = loanUSD / totalUSD;
  const balanced = 2 * Math.min(
    brt,
    1 - brt
  ) * blt;
  const unbalanced = (1 - 2 * Math.min(
    brt,
    1 - brt
  )) * ult;

  return balanced + unbalanced;
}

/**
 * returns the minimum collateral factor of the pool in percentage
 * @param pool pool to get data from
 * @returns number | undefined
 */
export const getBorrowerPoolMinCF = (
  collateralInfos: CollateralInfos
): number | undefined => {
  try {
    const balance = getBorrowerPoolBalanceLT(collateralInfos);

    return balance !== undefined ? balance * 1.1 : undefined;
  } catch (error) {
    throw new Error(`Error : ${error}`);
  }
};

export const getBorrowerPoolMaxLeverage = (
  collateralInfos: CollateralInfos | undefined
): number | undefined => {
  try {
    if (collateralInfos !== undefined) {
      const minCF = getBorrowerPoolMinCF(collateralInfos);

      if (minCF !== undefined && minCF !== 1) {
        return minCF / (minCF - 1);
      }
    }
  } catch (error) {
    throw new Error(`Error : ${error}`);
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
      }
        return (
          ((1 / (blt - 1 / (1 + buffer))) *
            (collateralValue / (1 + buffer) -
              2 * loanB * blt +
              (loanB - loanA) * ult)) /
          collateralPrice
        );
    }
  } catch (error) {
    throw new Error(`Error : ${error}`);
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
      }
        if (collateralAmount) {
          return amount / collateralAmount + 1;
        }
    }
  } catch (error) {
    throw new Error(`Error : ${error}`);
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
    throw new Error(`Error : ${error}`);
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
    }
      return {
        numberA: undefined,
        numberB: undefined,
      };
  } catch (error) {
    throw new Error(`Error${error}`);
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
    const address = pool?.data_contract?.address as string | undefined;

    return address;
  } catch (error) {
    throw Error(`Error : ${error}`);
  }
};

export const getMaximumRepayToken = (
  amountLoan: number,
  walletBalance: number
) => {
  try {
    return Math.min(amountLoan, walletBalance);
  } catch (error) {
    throw new Error(`Error : ${error}`);
  }
};

export const getMaximumBorrow = (
  token: "a" | "b",
  loanA: number,
  loanB: number,
  blt: number,
  ultA: number, // Assuming ultA is the Underlying Liquidation Threshold for Token A
  ultB: number, // Assuming ultB is the Underlying Liquidation Threshold for Token B
  buffer: number,
  tokenA_Lprice: number,
  tokenB_Lprice: number,
  tokenA_price: number,
  tokenB_price: number,
  collateralA: number,
  collateral: number
) => {
  if (blt && ultA && ultB) {
    loanA = loanA * tokenA_Lprice * tokenA_price;
    loanB = loanB * tokenB_Lprice * tokenB_price;

    const loanTotal = loanA + loanB;
    const collateralValue = collateral / (1 + buffer);

    const lr = loanA / loanTotal;
    const cr = collateralA / collateralValue;

    let maxNewLoanA;
    let maxNewLoanB;

    if (lr <= cr) {
      // Case 2.1.1
      maxNewLoanA =
        (collateralValue - ultB * loanB) *
        (cr / (blt + (cr - 1) * ultB)) -
        loanA;
    } else {
      // Case 2.1.2
      maxNewLoanA =
        (collateralValue - ((blt - cr * ultA) / (1 - cr)) * loanB) *
        (1 / ultA) -
        loanA;
    }

    if (lr <= cr) {
      // Case 2.2.1
      maxNewLoanB =
        (1 / ultB) * (collateralValue - ((blt - ultB) / cr) * loanA) -
        loanA -
        loanB;
    } else {
      // Case 2.2.2
      maxNewLoanB =
        (collateralValue - ((ultA - blt) / (1 - cr)) * loanA) *
        ((1 - cr) / (blt - cr * ultA)) -
        loanA -
        loanB;
    }

    if (token === "a") {
      return maxNewLoanA / tokenA_price;
    }
      return maxNewLoanB / tokenB_price;
  }
};

