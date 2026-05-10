import type { Address } from "viem";

export const ACTION_TYPE = {
  SUPPLY: 0,
  BORROW: 1,
  REPAY: 2,
  WITHDRAW: 3,
} as const;
export type ActionType = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];

export const ENVELOPE_VERSION = 1 as const;

export type IntentEnvelope = {
  intentId: `0x${string}`;
  xrplAccount: `0x${string}`;
  market: Address;
  underlying: Address;
  actionType: ActionType;
  amount: bigint;          // 18-decimal EVM wei
  nonce: bigint;
  deadline: bigint;        // unix timestamp, 0 = no expiry
  destinationAddress: `0x${string}`; // UTF-8 bytes of XRPL r-address for egress
  version: typeof ENVELOPE_VERSION;
};

// Axelar XRPL testnet constants
export const XRPL_AXELAR_GATEWAY = "rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2";
export const AXELAR_DESTINATION_CHAIN = "xrpl-evm";
// Gas for ITS ingress (added on top of deposit/repay amount)
export const ITS_GAS_FEE_DROPS = 2_000_000n;
// Gas for GMP call (borrow/withdraw — no token transfer)
export const GMP_GAS_DROPS = 3_000_000n;

// 1 XRP drop = 1e-6 XRP = 1e12 EVM wei (ITS multiplies by 10^12)
export const DROPS_TO_EVM = 10n ** 12n;
