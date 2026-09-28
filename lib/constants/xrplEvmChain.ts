// Env-driven XRPL EVM chain definition lives in ./network.
// `xrplEvmTestnet` kept as a back-compat alias for existing imports.
export {
  xrplEvm,
  xrplEvm as xrplEvmTestnet,
  XRPL_EVM_CHAIN_ID,
  XRPL_EVM_RPC_URL,
} from "./network";
