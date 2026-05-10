import { type Chain } from "viem";

export const xrplEvmTestnet = {
  id: 1449000,
  name: "XRPL EVM Testnet",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.xrplevm.org"] },
    public: { http: ["https://rpc.testnet.xrplevm.org"] },
  },
  blockExplorers: {
    default: {
      name: "XRPL EVM Explorer",
      url: "https://explorer.testnet.xrplevm.org",
    },
  },
  testnet: true,
} as const satisfies Chain;
