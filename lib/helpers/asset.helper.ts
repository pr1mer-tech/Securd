import { Asset, BorrowerPool } from "../api/generated/schemas";
import { ASSET_ERRORS } from "../errors/asset.errors";
import { DecimalTokens } from "../types/farm.types";
import { getLightLenderPool } from "./borrow.helpers";

/**
 * Returns the number of decimals of one asset
 * @param asset asset to get data from
 * @returns number
 */
export const getAssetDecimals = (asset?: Asset) => {
  try {
    const decimals = asset?.fa12?.decimals;

    return decimals || 0;
  } catch (error) {
    throw new Error(ASSET_ERRORS.ASSET_DECIMAL_FAILED);
  }
};

/**
 * Returns the symbol of the asset
 * @param asset asset to get data from
 * @returns string
 */
export const getAssetSymbol = (asset?: Asset) => {
  try {
    return asset?.fa12?.symbol;
  } catch (error) {
    throw new Error("Error : " + error);
  }
};

export const getPairAssetDecimals = (
  pool: BorrowerPool | undefined
): DecimalTokens => {
  try {
    if (!pool) {
      return {
        decimalTokenA: undefined,
        decimalTokenB: undefined,
      };
    } else {
      const { lenderPoolSetA, lenderPoolSetB } = getLightLenderPool(pool);
      return {
        decimalTokenA: lenderPoolSetA?.asset.fa12?.decimals,
        decimalTokenB: lenderPoolSetB?.asset.fa12?.decimals,
      };
    }
  } catch (error) {
    throw new Error("Error : " + error);
  }
};
