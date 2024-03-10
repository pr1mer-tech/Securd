import { abiUSDT } from "@/lib/constants/abi/abi";
import { BalanceLDToken } from "@/lib/types/global.types";
import { ReserveInfo } from "@/lib/types/save.types";
import { useState } from "react";
import { Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";

const useLDtokens = (
  // addressDToken: Address | undefined,
  // addressLToken: Address | undefined

  reserveInfos: ReserveInfo[]
) => {
  const { isConnected, address } = useAccount();

  const { data } = useReadContracts({
    contracts: reserveInfos.map((reserve) => [
      {
        address: reserve.tokenInfo.dToken,
        abi: abiUSDT as any,
        functionName: "balanceOf",
        args: [address as Address],
      },
      {
        address: reserve.tokenInfo.lToken,
        abi: abiUSDT as any,
        functionName: "balanceOf",
        args: [address as Address],
      },
    ]).flat(),
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  if (!data) return {
    balanceLDTokens: {},
  };

  const flatArray = data.map((item) => item.result);
  const balanceLDTokens: Record<Address, BalanceLDToken> = Object.fromEntries([...Array(Math.ceil(flatArray.length / 2))].map(() => flatArray.splice(0, 2)).map((item, i) => ([reserveInfos[i].address, {
    dToken: BigInt(item[0] as string),
    lToken: BigInt(item[1] as string),
  }])))

  return {
    balanceLDTokens,
  };
};
export default useLDtokens;
