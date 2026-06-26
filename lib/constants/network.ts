import { type Chain } from "viem";

// Single source of truth for the XRPL EVM network. Env-driven so the same code
// runs on testnet (default) and mainnet — set the NEXT_PUBLIC_ vars per
// deployment/branch. NEXT_PUBLIC_ prefix is required: these are read in the
// browser, and the values must be referenced literally for Next.js to inline
// them at build time (process.env[dynamicKey] is NOT inlined).
export const XRPL_EVM_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_XRPL_EVM_CHAIN_ID ?? 1449000,
);
export const XRPL_EVM_RPC_URL =
  process.env.NEXT_PUBLIC_XRPL_EVM_RPC_URL ??
  "https://rpc.testnet.xrplevm.org";

// XRPL EVM mainnet is chain id 1440000; anything else is treated as testnet.
const IS_MAINNET = XRPL_EVM_CHAIN_ID === 1440000;

// Block explorer base URLs (no trailing slash). Each falls back to the right
// network default, overridable via NEXT_PUBLIC_ env. Call sites append paths.
export const EXPLORER_XRPL_EVM =
  process.env.NEXT_PUBLIC_EXPLORER_XRPL_EVM ??
  (IS_MAINNET
    ? "https://explorer.xrplevm.org"
    : "https://explorer.testnet.xrplevm.org");
export const EXPLORER_XRPL_LEDGER =
  process.env.NEXT_PUBLIC_EXPLORER_XRPL_LEDGER ??
  (IS_MAINNET ? "https://livenet.xrpl.org" : "https://testnet.xrpl.org");
export const AXELARSCAN_URL =
  process.env.NEXT_PUBLIC_AXELARSCAN_URL ??
  (IS_MAINNET ? "https://axelarscan.io" : "https://testnet.axelarscan.io");
export const AXELARSCAN_API_URL =
  process.env.NEXT_PUBLIC_AXELARSCAN_API_URL ??
  (IS_MAINNET ? "https://api.axelarscan.io" : "https://testnet.api.axelarscan.io");

export const xrplEvm = {
  id: XRPL_EVM_CHAIN_ID,
  name: IS_MAINNET ? "XRPL EVM" : "XRPL EVM Testnet",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: { http: [XRPL_EVM_RPC_URL] },
    public: { http: [XRPL_EVM_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "XRPL EVM Explorer", url: EXPLORER_XRPL_EVM },
  },
  testnet: !IS_MAINNET,
} as const satisfies Chain;
