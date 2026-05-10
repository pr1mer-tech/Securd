import { createPublicClient, http } from "viem";
import { xrplEvmTestnet } from "./xrplEvmChain";

// Read-only client for XRPL EVM — no wallet needed, queries proxy positions
export const xrplEvmClient = createPublicClient({
  chain: xrplEvmTestnet,
  transport: http("https://rpc.testnet.xrplevm.org"),
});
