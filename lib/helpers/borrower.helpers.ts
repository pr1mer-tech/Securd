/**
 * converts leverage factor to LpTokens
 * @param factor leverage factor
 * @param borrower borrower to get data from
 * @returns number | undefined
 */
export const leverageToLp = (
  factor: number,
  borrowerLeverage: number | undefined,
  maxLeverageFactor: number | undefined,
  borrowerMaxLeverageLP: number | undefined
): number | undefined => {
  try {
    if (
      borrowerLeverage !== undefined &&
      maxLeverageFactor !== undefined &&
      borrowerMaxLeverageLP !== undefined
    ) {
      const result =
        (((maxLeverageFactor - factor < 0.1 ? maxLeverageFactor : factor) -
          borrowerLeverage) /
          (maxLeverageFactor - borrowerLeverage)) *
        borrowerMaxLeverageLP;

      return result;
    }
  } catch (error) {
    throw new Error(`Error : ${error}`);
  }
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
