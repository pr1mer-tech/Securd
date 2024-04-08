import { MAIN_ERRORS } from "../errors/main.errors";
import { Address, formatEther, isAddressEqual } from "viem";
import { toast } from "sonner"


/**
 * Format user address to make it more readable
 * pattern : tz1a3b...5c7d
 * @param address user address
 * @returns string => formatted address
 */
export const formatAddress = (address?: Address): string => {
  return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
};

/**
 * Copy text to clipboard and render a toast
 * to notify the user that the text has been copied
 * @param text text to copy
 * @returns Promise<void>
 */
export const copyToClipboard = async (text?: string): Promise<void> => {
  try {
    if (text) {
      toast.promise(() => navigator.clipboard.writeText(text), {
        success: "Copied !",
        error: "Error while copying address : " + text,
      });
    }
  } catch (error) {
    throw new Error("Error while copying address");
  }
};

/**
 * Ewample : getFloor(4.8949,2) => 4.89
 * @param num number
 * @param decimal amount of decimal
 * @returns number rounded down
 */
export const getFloor = (
  num: number | undefined,
  decimal: number | undefined
) => {
  try {
    if (num !== undefined && decimal !== undefined)
      return Math.floor(num * 10 ** decimal) / 10 ** decimal;
  } catch (error) {
    throw new Error(MAIN_ERRORS.GET_FLOOR_FAILED);
  }
};

export const getRounded = (
  num: number | undefined,
  decimal: number | undefined
) => {
  try {
    if (num !== undefined && decimal !== undefined)
      return Math.round(num * 10 ** decimal) / 10 ** decimal;
  } catch (error) {
    throw new Error(MAIN_ERRORS.GET_FLOOR_FAILED);
  }
};

/**
 *
 * @param num amount to convert
 * @returns num converted from wei to eth units
 */
export const weiToEth = (num: bigint) => {
  return parseFloat(formatEther(num));
};

/**
 *
 * @param num amount to convert
 * @returns num converted from eth to wei units
 */
export const ethToWei = (num: number) => {
  return BigInt(num) * 10n ** 18n;
};

function countDigits(num: bigint) {
  return num.toString().length;
}

export const bigIntToDecimal = (
  num: bigint | undefined,
  decimals: number | undefined
): number | undefined => {
  if (num !== undefined && decimals !== undefined) {
    const wholePart = num / BigInt(10 ** decimals);
    const decimalPart = num % BigInt(10 ** decimals);
    const leadingZerosAfterDecimal =
      decimals - Number(countDigits(decimalPart));
    return Number(
      String(wholePart) +
      "." +
      "0".repeat(Math.max(leadingZerosAfterDecimal, 0)) +
      String(decimalPart)
    );
  }
};

export const getDepositAmountBigInt = (
  amount: number | undefined,
  decimal: number | undefined
): bigint | undefined => {
  try {
    if (amount && decimal !== undefined) {
      const amountNotDecimal = BigInt(amount * 10 ** 18);
      return (amountNotDecimal * BigInt(10 ** decimal)) / BigInt(10 ** 18);
    }
  } catch (error) {
    throw new Error("bigIntToDecimal failed : " + error);
  }
};


export const isEqualAddress = (address1?: Address, address2?: Address) => {
  if (
    typeof address1 === "string"
    && typeof address2 === "string"
    && address1.length === address2.length
    && address1.length === 42) {
    return isAddressEqual(address1, address2);
  }
  return false;
}