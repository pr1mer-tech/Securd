import { FarmContext } from "@/context/Farm.context";
import { useContext, useMemo } from "react";
import { BorrowOptions, FarmActionMode, LockOptions } from "../types/enums";
import { PositionDataParams } from "../types/farm.types";
import useGetAmounts from "./wagmiSH/viewFunctions/useGetAmounts";
import { bigIntToDecimal } from "../helpers/main.helpers";

const useGetTransactionDetails = () => {
  const {
    activeAction,
    borrowAction,
    collateralAmount,
    isLeverage,
    lockAction,
    selectedCollateralInfo,
    tokenSelected,
    transactionAmount,
  } = useContext(FarmContext);

  const { amountsData } = useGetAmounts();

  const transactionName = useMemo(() => {
    if (activeAction === FarmActionMode.LOCK) {
      return lockAction;
    } else if (activeAction === FarmActionMode.BORROW) {
      return borrowAction;
    } else if (activeAction === FarmActionMode.LEVERAGE) {
      return "Leverage";
    }
  }, [activeAction]);

  const positionDataParams = useMemo(() => {
    let loanADirection = false;
    let loanBDirection = false;
    let collateralDirection = lockAction === LockOptions.LOCK;
    let collateral = 0;
    let loanA = 0;
    let loanB = 0;

    if (activeAction === FarmActionMode.LEVERAGE) {
      collateralDirection = isLeverage;
      loanADirection = isLeverage;
      loanBDirection = isLeverage;
      collateral = bigIntToDecimal(collateralAmount, 18) || 0;
      loanA = amountsData?.amount0 || 0;
      loanB = amountsData?.amount1 || 0;
    } else if (activeAction === FarmActionMode.BORROW) {
      collateralDirection = false;
      loanADirection =
        tokenSelected === 0 && borrowAction === BorrowOptions.BORROW;
      loanBDirection =
        tokenSelected === 1 && borrowAction === BorrowOptions.BORROW;
      collateral = 0;
      loanA = tokenSelected === 0 ? transactionAmount : 0;
      loanB = tokenSelected === 1 ? transactionAmount : 0;
    }

    const params: PositionDataParams = {
      directionCollateral: collateralDirection,
      directionLoanA: loanADirection,
      directionLoanB: loanBDirection,
      tokenAddress: selectedCollateralInfo?.addressLP,
      collateralAmount: BigInt(collateral * 10 ** 18),
      loanA: loanA * 10 ** 18,
      loanB: loanB * 10 ** 18,
    };

    return params;
  }, [
    lockAction,
    activeAction,
    selectedCollateralInfo,
    transactionAmount,
    tokenSelected,
  ]);

  return { transactionName, positionDataParams };
};

export default useGetTransactionDetails;
