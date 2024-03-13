import { ReserveInfo } from "../types/save.types";
import { getLtokenprice } from "../helpers/lenderPool.helpers";
import { Debts } from "../types/farm.types";
import { bigIntToDecimal } from "../helpers/main.helpers";

const getPairBorrowBalances = (
  debts: Debts | undefined,
  reserveInfoTokenA: ReserveInfo | undefined,
  reserveInfoTokenB: ReserveInfo | undefined
) => {

  const dtokenPriceA = getLtokenprice(reserveInfoTokenA);
  const dtokenPriceB = getLtokenprice(reserveInfoTokenB);

  const debtA = bigIntToDecimal(debts?.tokenA, reserveInfoTokenA?.decimals);
  const debtB = bigIntToDecimal(debts?.tokenB, reserveInfoTokenB?.decimals);
  if (
    debtA !== undefined &&
    debtB !== undefined &&
    dtokenPriceA &&
    dtokenPriceB
  ) {
    return {
      borrowBalanceA: debtA * dtokenPriceA,
      borrowBalanceB: debtB * dtokenPriceB,
    };
  }
};
export default getPairBorrowBalances;
