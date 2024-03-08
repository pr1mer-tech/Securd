import { collateralPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { Debts } from "@/utils/types/farm.types";
import { useState } from "react";
import { Address, useAccount, useContractReads } from "wagmi";

const useCollateralAmountPrice = (assetLp: Address | undefined) => {
  const [collateralAmount, setCollateralAmount] = useState<bigint>();
  const [collateralValue, setCollateralValue] = useState<bigint>();
  const [debts, setDebts] = useState<Debts>();
  const [collateralFactor, setCollateralFactor] = useState<bigint>();
  const [leverageFactor, setLeverageFactor] = useState<bigint>();
  const { isConnected, address } = useAccount();

  useContractReads({
    contracts: [
      {
        ...collateralPoolContract,
        functionName: "borrowerBalances",
        args: [address as Address, assetLp as Address],
      },
      {
        ...collateralPoolContract,
        functionName: "getCollateralValue",
        args: [address as Address, assetLp as Address],
      },
      {
        ...collateralPoolContract,
        functionName: "getCollateralFactor",
        args: [address as Address, assetLp as Address],
      },
      {
        ...collateralPoolContract,
        functionName: "getLeverageFactor",
        args: [address as Address, assetLp as Address],
      },
    ],
    onSuccess(data: any) {
      setCollateralAmount(data[0].result[0]);
      setDebts({
        tokenA: data[0].result[1],
        tokenB: data[0].result[2],
      });
      setCollateralValue(data[1].result);
      setCollateralFactor(data[2].result);
      setLeverageFactor(data[3].result);
    },
    onError(error) {
      // eslint-disable-next-line no-console
      console.log("Error", error);
    },
    enabled: isConnected && assetLp !== undefined,
    watch: true,
  }) as any;

  return {
    collateralAmount,
    collateralValue,
    debts,
    collateralFactor,
    leverageFactor,
  };
};
export default useCollateralAmountPrice;
