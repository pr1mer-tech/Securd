import { keccak256, toBytes, type Address } from "viem";
import { xrplEvmClient } from "@/lib/constants/xrplEvmClient";
import { proxyFactoryContract } from "@/lib/constants/contracts";

/**
 * Converts an XRPL Ledger address (rXXXX...) to the bytes32 xrplAccount
 * identifier used by the bridge adapter and proxy factory.
 */
export function xrplAddressToBytes32(xrplAddress: string): `0x${string}` {
  return keccak256(toBytes(xrplAddress));
}

/**
 * Derives the deterministic XRPL EVM proxy address for a given XRPL account.
 * Works even before the proxy is deployed (CREATE2 prediction).
 */
export async function getProxyAddress(xrplAddress: string): Promise<Address> {
  const xrplAccount = xrplAddressToBytes32(xrplAddress);
  const proxy = await xrplEvmClient.readContract({
    ...proxyFactoryContract,
    functionName: "predictProxy",
    args: [xrplAccount],
  });
  return proxy as Address;
}
