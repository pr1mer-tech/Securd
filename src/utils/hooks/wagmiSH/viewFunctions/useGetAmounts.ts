import { AmountData } from "@/utils/types/farm.types";
import { useContext, useState } from "react";
import { useContractRead } from "wagmi";
import { collateralPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { MainContext } from "@/context/Main.context";
import { FarmContext } from "@/context/Farm.context";
import { FarmActionMode } from "@/utils/types/enums";

const useGetAmounts = () => {
  const { isConnected } = useContext(MainContext);
  const { activeAction, selectedCollateralInfo, transactionAmount } =
    useContext(FarmContext);
  const [amountsData, setAmountsData] = useState<AmountData>();

  useContractRead({
    ...collateralPoolContract,
    functionName: "getAmounts",
    args: [selectedCollateralInfo?.addressLP, transactionAmount],
    onSuccess(data: any) {
      if (data.length > 1) {
        const amountsData: AmountData = {
          amount0: Number(data[0]),
          amount1: Number(data[1]),
        };

        setAmountsData(amountsData);
      }
    },
    onError(error: Error) {
      throw new Error(error.message);
    },
    enabled: isConnected && activeAction === FarmActionMode.LEVERAGE,
    watch: true,
  });

  return {
    amountsData,
  };
};

export default useGetAmounts;
