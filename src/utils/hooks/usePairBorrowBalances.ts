import { Address } from "viem";
import useCollateralAmountPrice from "./wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import { ReserveInfo } from "../types/save.types";
import { useEffect, useMemo, useState } from "react";
import { getLtokenprice } from "../helpers/lenderPool.helpers";
import { BorrowerBalances } from "../types/farm.types";
import { bigIntToDecimal } from "../helpers/main.helpers";

const usePairBorrowBalances = (
  assetLp: Address | undefined,
  reserveInfoTokenA: ReserveInfo | undefined,
  reserveInfoTokenB: ReserveInfo | undefined
) => {
  const [borrowBalances, setBorrowBalances] = useState<BorrowerBalances>();
  const { debts } = useCollateralAmountPrice(assetLp);

  const dtokenPriceA: number | undefined = useMemo(() => {
    return getLtokenprice(reserveInfoTokenA);
  }, [reserveInfoTokenA]);

  const dtokenPriceB: number | undefined = useMemo(() => {
    return getLtokenprice(reserveInfoTokenB);
  }, [reserveInfoTokenA]);

  useEffect(() => {
    const debtA = bigIntToDecimal(debts?.tokenA, 18);
    const debtB = bigIntToDecimal(debts?.tokenB, 18);
    if (
      debtA !== undefined &&
      debtB !== undefined &&
      dtokenPriceA &&
      dtokenPriceB
    ) {
      setBorrowBalances({
        borrowBalanceA: debtA * dtokenPriceA,
        borrowBalanceB: debtB * dtokenPriceB,
      });
    }
  }, [debts, dtokenPriceA, dtokenPriceB]);

  return {
    borrowBalances,
  };
};
export default usePairBorrowBalances;
