import { abiUSDT } from "@/lib/constants/abi/abi";
import type { BalanceLDToken } from "@/lib/types/global.types";
import type { ReserveInfo } from "@/lib/types/save.types";
import { useState } from "react";
import type { Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";

const useLDtokens = (
  // addressDToken: Address | undefined,
  // addressLToken: Address | undefined

  reserveInfos: ReserveInfo[]
) => {
  const { isConnected, address } = useAccount();
  const { data } = useReadContracts({
    contracts: reserveInfos.flatMap((reserve) => [
      {
        address: reserve.tokenInfo.dToken,
        abi: abiUSDT,
        functionName: "balanceOf",
        args: [address as Address],
      },
      {
        address: reserve.tokenInfo.dToken,
        abi: abiUSDT,
        functionName: "totalSupply",
        args: [],
      },
      {
        address: reserve.tokenInfo.lToken,
        abi: abiUSDT,
        functionName: "balanceOf",
        args: [address as Address],
      },
      {
        address: reserve.tokenInfo.lToken,
        abi: abiUSDT,
        functionName: "totalSupply",
        args: [],
      },
    ]) as any,
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  if (!data) return {
    balanceLDTokens: {},
  };

  const flatArray = data.map((item) => item.result);
  const balanceLDTokens: Record<Address, BalanceLDToken> = Object.fromEntries([...Array(Math.ceil(flatArray.length / 2))].map(() => flatArray.splice(0, 2)).map((item, i) => ([reserveInfos[Math.floor(i / 2)].address, {
    dToken: BigInt(item[0] as string ?? "0"),
    dTokenSupply: BigInt(item[1] as string ?? "0"),
    lToken: BigInt(item[2] as string ?? "0"),
    lTokenSupply: BigInt(item[3] as string ?? "0"),
  }])))

  return {
    balanceLDTokens,
  };
};
export default useLDtokens;
