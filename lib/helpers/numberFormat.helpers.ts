import { PERCENTAGE_FACTOR } from "./constants";
import { getFloor } from "./main.helpers";

function toSuperscript(str: string) {
  const superscriptMap = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻'
  };

  //@ts-expect-error - Dumb stuff
  return str.split('').map(char => superscriptMap[char] || char).join('');
}


export const securdFormat = (
  num: number | undefined,
  decimals?: number
): string => {
  try {
    if (num !== undefined && num !== null && !isNaN(num)) {
      if ((num < 1e-3 && num > 0) || (num > -1e-3 && num < 0)) {
        // Use scientific notation for very small numbers
        return new Intl.NumberFormat("en-US", {
          notation: "scientific",
          minimumFractionDigits: decimals || 0,
          maximumFractionDigits: decimals || 0,
        }).format(num)
          .toLowerCase()
          .split("e")
          // Superscript notation
          .map((v, i) => (i === 0 ? v : toSuperscript(v)))
          .join("×10");
      }
      const isBigNumber = num > 9999;

      return new Intl.NumberFormat("en-US", {
        notation: isBigNumber ? "compact" : undefined,
        minimumFractionDigits: decimals || 0,
        maximumFractionDigits: decimals || 0,
      }).format(num);
    } else {
      return "--";
    }
  } catch (error) {
    throw new Error("securdFormat failed : " + error);
  }
};

/**
 * Converts a number to an asset format
 *
 * Example : (10000000).toAsset(6) => 1
 * @param decimals asset decimals
 * @returns formatted number
 */
export const toAsset = (num: number, decimals: number): number => {
  return num * 10 ** -decimals;
};

/**
 * Converts a number to an asset decimals format
 *
 * Example : (1).toAssetDecimals(6) => 10000000
 * @param decimals asset decimals
 * @returns formatted number
 */
export const toAssetDecimals = function (
  num: number,
  decimals: number
): number {
  return num * 10 ** decimals;
};

/**
 * Converts a number to its corresponding percentage format in string
 *
 * Example : for 10% -> (10).toPercentage(2) => "10.00%"
 * @param decimals number of decimals that should be displayed
 * @returns The formatted percentage
 */
export const toFormattedPercentage = (
  num: number | undefined,
  decimals: number | undefined
): string => {
  try {
    if (num !== undefined && num !== null && !isNaN(num.valueOf())) {
      return `${(num * 100).toFixed(decimals || 0)}%`;
    } else {
      return "--";
    }
  } catch (error) {
    throw new Error("toLeverage failed : " + error);
  }
};

/**
 * Converts a number to its corresponding leverage format in string
 *
 * Example : for a 10x leverage -> (10).toLeverage() => "x10"
 * @returns
 */
export const toLeverage = (num: number | undefined): string => {
  try {
    if (num !== undefined && num !== null && !isNaN(num)) {
      return `x${num.toFixed(1)}`;
    } else {
      return "--";
    }
  } catch (error) {
    throw new Error("toLeverage failed : " + error);
  }
};

export const toNoDecimal = (num: number | undefined): string => {
  try {
    if (num !== undefined && num !== null && !isNaN(num)) {
      return new Intl.NumberFormat("en-US", {
        notation: undefined,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
    } else {
      return "--";
    }
  } catch (error) {
    throw new Error("toNoDecimal failed : " + error);
  }
};

/**
 * Return the percentage format of a smart contract formatted percentage
 *
 * Example : for 10% -> (10000).toPercentage() => 10
 * @returns The formatted percentage
 */
export const toPercentage = (num: number | undefined) => {
  if (num !== undefined) {
    return num / PERCENTAGE_FACTOR;
  }
};

/**
 * Converts a number to its corresponding smart contract percentage format
 *
 * Example : for 10% -> (10).toSmartContractPercentage() => 10000
 * @returns the formatted percentage
 */
export const toSmartContractPercentage = (num: number): number => {
  return num * PERCENTAGE_FACTOR;
};

export const securdFormatFloor = (num?: number, decimals?: number): string => {
  if (num !== undefined && num !== null && !isNaN(num)) {
    const isBigNumber = num > 999999;

    return new Intl.NumberFormat("en-US", {
      notation: isBigNumber ? "compact" : undefined,
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0,
    }).format(getFloor(num, decimals) || 0);
  } else {
    return "--";
  }
};

export const formatPCTFactor = (factor?: number): string => {
  if (factor && !isNaN(factor)) {
    return factor < 1000 ? `${factor.toFixed(0)}%` : "∞";
  } else {
    return "--";
  }
};
