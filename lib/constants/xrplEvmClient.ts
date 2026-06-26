import { createPublicClient, http } from "viem";
import { xrplEvm, XRPL_EVM_RPC_URL } from "./network";

// Read-only client for XRPL EVM — no wallet needed, queries proxy positions
export const xrplEvmClient = createPublicClient({
  chain: xrplEvm,
  transport: http(XRPL_EVM_RPC_URL),
});
