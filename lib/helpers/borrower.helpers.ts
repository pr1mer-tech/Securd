/**
 * converts leverage factor to LpTokens
 * @param factor leverage factor
 * @param borrower borrower to get data from
 * @returns number | undefined
 */
export const leverageToLp = (
  _leverageFactor: number,
  collateralAmount: bigint,
): bigint | undefined => {
  // Leverage is calculated as collateralFactor / (collateralFactor - 1)
  const unit = BigInt(10) ** BigInt(18);
  const leverageFactor = BigInt(Math.round(_leverageFactor * 1000)) * unit / 1000n - unit;
  return leverageFactor * collateralAmount / unit;
};

export const getLeverage = (borrowerCF: number | undefined) => {
  try {
    if (borrowerCF !== undefined) {
      if (borrowerCF !== 1) {
        return borrowerCF / (borrowerCF - 1);
      }
      return 1;
    }
  } catch (error) {
    throw new Error(`Error : ${error}`);
  }
};

export const getFloor = (
  num: number | undefined,
  decimal: number | undefined
) => {
  try {
    if (num !== undefined && decimal !== undefined)
      return Math.floor(num * 10 ** decimal) / 10 ** decimal;
  } catch (error) {
    throw new Error(`Error : ${error}`);
  }
};
