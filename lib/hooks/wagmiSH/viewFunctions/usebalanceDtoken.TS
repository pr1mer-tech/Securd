import { useState } from "react";
import { type Address, useAccount, useContractReads } from "wagmi";
import { abiUSDT } from "../../../constants/abi/abi";

const useBalanceDtoken = (addressDToken: Address) => {
  const { isConnected, address } = useAccount();
  const [balanceDToken, setBalancedDToken] = useState<number>(0);

  useContractReads({
    contracts: [
      {
        address: addressDToken,
        abi: abiUSDT as any,
        functionName: "balanceOf",
        args: [address as Address],
      },
    ],
    onSuccess(data: any) {
      setBalancedDToken(data[0].result);
    },
    enabled: isConnected,
    watch: true,
  });

  return {
    balanceDToken,
  };
};
export default useBalanceDtoken;
