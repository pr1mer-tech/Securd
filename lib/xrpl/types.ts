import type { Address } from "viem";

export const ACTION_TYPE = {
    SUPPLY: 0,
    BORROW: 1,
    REPAY: 2,
    WITHDRAW: 3,
    ENTER_MARKET: 4,
    EXIT_MARKET: 5,
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

// Axelar XRPL routing — overridable via env. These must be NEXT_PUBLIC_-prefixed:
// this module runs in the browser, where only NEXT_PUBLIC_ vars are readable.
// Falls back to the current XRPL EVM testnet deployment when unset.
export const XRPL_AXELAR_GATEWAY =
  process.env.NEXT_PUBLIC_XRPL_AXELAR_GATEWAY ?? "rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2";
export const AXELAR_DESTINATION_CHAIN =
  process.env.NEXT_PUBLIC_AXELAR_DESTINATION_CHAIN ?? "xrpl-evm";
// Gas for ITS ingress of native XRP — SUPPLY and REPAY both pay it, in drops,
// added on top of the deposit. Axelar deducts it from the Payment Amount to
// fund the cross-chain relay; without it the message cannot be confirmed.
export const ITS_GAS_FEE_DROPS = 2_000_000n;
// Gas for ITS ingress of an IOU token — taken from the token itself, in whole
// token units. Added to the Payment Amount; the intent envelope excludes it.
export const ITS_IOU_GAS_FEE = 2;
// Gas for GMP call (enter/exit collateral, borrow/withdraw — no token transfer inbound)
export const GMP_GAS_DROPS = 3_000_000n;

// 1 XRP drop = 1e-6 XRP = 1e12 EVM wei (ITS multiplies by 10^12)
export const DROPS_TO_EVM = 10n ** 12n;