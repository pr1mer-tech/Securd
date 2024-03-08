import { abiUSDT } from "@/utils/constants/abi/abi";
import { BalanceLDToken } from "@/utils/types/global.types";
import { useState } from "react";
import { Address, useAccount, useContractReads } from "wagmi";

const useLDtoken = (
  addressDToken: Address | undefined,
  addressLToken: Address | undefined
) => {
  const { isConnected, address } = useAccount();
  const [balanceLDToken, setBalancedLDToken] = useState<BalanceLDToken>();

  useContractReads({
    contracts: [
      {
        address: addressDToken,
        abi: abiUSDT as any,
        functionName: "balanceOf",
        args: [address as Address],
      },
      {
        address: addressLToken,
        abi: abiUSDT as any,
        functionName: "balanceOf",
        args: [address as Address],
      },
    ],
    onSuccess(data: any) {
      setBalancedLDToken({
        dToken: data[0].result,
        lToken: data[1].result,
      });
    },
    enabled:
      isConnected && addressDToken !== undefined && addressLToken !== undefined,
    watch: true,
  });

  return {
    balanceLDToken,
  };
};
export default useLDtoken;
