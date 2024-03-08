import { collateralPriceContract } from "@/utils/constants/wagmiConfig/wagmiConfig";
import { bigIntToDecimal } from "@/utils/helpers/main.helpers";
import { useState } from "react";
import { Address, useAccount, useContractReads } from "wagmi";

const useCollateralPrice = (assetLp: Address | undefined) => {
  const [collateralPrice, setCollateralPrice] = useState<number>(0);

  const { isConnected } = useAccount();

  useContractReads({
    contracts: [
      {
        ...collateralPriceContract,
        functionName: "getCollateralPrice",
        args: ["0xe5947694bBbe6F36d20798a54d0dE896bFeBCfb1" as Address],
      },
    ],
    onSuccess(data: any) {
      if (data[0].result) {
        setCollateralPrice(bigIntToDecimal(data[0].result[2], 18) || 0);
      }
    },
    onError(error) {
      // eslint-disable-next-line no-console
      console.log("Error", error);
    },
    enabled: isConnected && assetLp !== undefined,
    watch: true,
  }) as any;

  return { collateralPrice };
};

export default useCollateralPrice;
