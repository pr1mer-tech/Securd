// Re-export the canonical contract registry for backwards compatibility
export {
  comptrollerContract,
  oracleContract,
  proxyFactoryContract,
  interestRateModelContract,
  cTokenContract,
  ADDRESSES,
} from "@/lib/constants/contracts";

export { MARKETS, getMarketByAddress } from "@/lib/constants/markets";
export { xrplEvmClient } from "@/lib/constants/xrplEvmClient";
export { xrplEvmTestnet } from "@/lib/constants/xrplEvmChain";
