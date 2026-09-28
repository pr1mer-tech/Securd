import { xrplEvmClient } from "@/lib/constants/xrplEvmClient";
import { bridgeAdapterContract } from "@/lib/constants/contracts";
import { xrplAddressToBytes32 } from "@/lib/utils/xrplProxy";

export async function getNextNonce(xrplAddress: string): Promise<bigint> {
  const xrplAccount = xrplAddressToBytes32(xrplAddress);
  const nonce = await xrplEvmClient.readContract({
    ...bridgeAdapterContract,
    functionName: "nextNonceByXrplAccount",
    args: [xrplAccount],
  });
  return BigInt(nonce);
}
