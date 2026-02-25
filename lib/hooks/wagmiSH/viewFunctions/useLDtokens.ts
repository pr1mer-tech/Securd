import { abiUSDT } from "@/lib/constants/abi/abi";
import type { BalanceLDToken } from "@/lib/types/global.types";
import type { ReserveInfo } from "@/lib/types/save.types";
import type { Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";

const useLDtokens = (reserveInfos: ReserveInfo[]) => {
  const { address } = useAccount();
  const { data } = useReadContracts({
    contracts: reserveInfos.flatMap((reserve) => [
      {
        address: reserve.tokenInfo?.dToken,
        abi: abiUSDT,
        functionName: "balanceOf",
        args: [address as Address],
      },
      {
        address: reserve.tokenInfo?.dToken,
        abi: abiUSDT,
        functionName: "totalSupply",
        args: [],
      },
      {
        address: reserve.tokenInfo?.lToken,
        abi: abiUSDT,
        functionName: "balanceOf",
        args: [address as Address],
      },
      {
        address: reserve.tokenInfo?.lToken,
        abi: abiUSDT,
        functionName: "totalSupply",
        args: [],
      },
    ]),
    query: {
      // enabled: isConnected,
      // refetchInterval: 10000,
    },
  });

  if (!data)
    return {
      balanceLDTokens: {},
    };

  const flatArray = data.map((item) => item.result);
  const balanceLDTokens: Record<Address, BalanceLDToken> = Object.fromEntries(
    [...Array(Math.ceil(flatArray.length / 4))]
      .map(() => flatArray.splice(0, 4))
      .map((item, i) => {
        const reserve = reserveInfos[i];
        if (!reserve) return null;
        return [
          reserve.address,
          {
            dToken: (item[0] as bigint) ?? 0n,
            dTokenSupply: (item[1] as bigint) ?? 0n,
            lToken: (item[2] as bigint) ?? 0n,
            lTokenSupply: (item[3] as bigint) ?? 0n,
          },
        ];
      })
      .filter((entry): entry is [Address, BalanceLDToken] => entry !== null),
  );

  return {
    balanceLDTokens,
  };
};
export default useLDtokens;
