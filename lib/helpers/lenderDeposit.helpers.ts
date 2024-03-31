import { Address } from "viem";
import { LENDER_DEPOSIT_ERRORS } from "../errors/lenderDeposit.errors";
import { MAIN_ERRORS } from "../errors/main.errors";
import { ReserveInfo } from "../types/save.types";

/**
 * Returns the account balance of the user in a specific pool
 * @param pool
 * @param dTokenAmount
 * @returns
 */
export const getAccountBalance = () => {
  return 0;
};

export const getSelectedReserveInfo = (
  reservesInfo: ReserveInfo[],
  asset: Address
) => {
  try {
    if (reservesInfo && reservesInfo.length !== 0) {
      return reservesInfo.find(
        (reserveInfo: ReserveInfo) => reserveInfo.address === asset
      );
    }
  } catch (error) {
    throw new Error(MAIN_ERRORS.FAILED_HELPER + error);
  }
};

/**
 * retrieves the interests earned
 * @param accountBalance
 * @param userDeposit
 * @returns number
 */
export const getInterestAmount = (
  accountBalance: bigint | undefined,
  userDeposit: bigint | undefined
) => {
  try {
    if (accountBalance !== undefined && userDeposit !== undefined) {
      return accountBalance - userDeposit;
    } else {
      return 0n;
    }
  } catch (error) {
    throw new Error(LENDER_DEPOSIT_ERRORS.INTEREST_AMOUNT);
  }
};
