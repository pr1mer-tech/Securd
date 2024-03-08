import { MainContext } from "@/context/Main.context";
import { lendingPoolContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { bigIntToDecimal } from "@/utils/helpers/main.helpers";
import { useContext, useState } from "react";
import { Address, useContractReads } from "wagmi";

const useGetLenderSupply = (asset: Address) => {
  const { isConnected, userAddress } = useContext(MainContext);
  const [userDeposit, setUserDeposit] = useState<number>(0);

  useContractReads({
    contracts: [
      {
        ...lendingPoolContract,
        functionName: "getLenderSupply",
        args: [asset, userAddress as string],
      },
    ],
    onSuccess(data: any) {
      const userDepositDecimal = bigIntToDecimal(data[0].result, 18);
      userDepositDecimal !== undefined && setUserDeposit(userDepositDecimal);
    },
    enabled: isConnected,
    watch: true,
  });

  return {
    userDeposit,
  };
};

export default useGetLenderSupply;
