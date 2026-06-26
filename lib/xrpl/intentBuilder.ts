import { encodeAbiParameters, keccak256, toHex } from "viem";
import { ADDRESSES } from "@/lib/constants/contracts";
import { XRPL_EVM_CHAIN_ID } from "@/lib/constants/network";
import { xrplAddressToBytes32 } from "@/lib/utils/xrplProxy";
import {
  ACTION_TYPE,
  ENVELOPE_VERSION,
  type ActionType,
  type IntentEnvelope,
} from "./types";
import type { Address } from "viem";

// ABI types for encoding the IntentEnvelope
const ENVELOPE_ABI = [
  { type: "bytes32" }, // intentId
  { type: "bytes32" }, // xrplAccount
  { type: "address" }, // market
  { type: "address" }, // underlying
  { type: "uint8" },   // actionType
  { type: "uint256" }, // amount
  { type: "uint64" },  // nonce
  { type: "uint64" },  // deadline
  { type: "bytes" },   // destinationAddress
  { type: "uint16" },  // version
] as const;

const SIGNED_INTENT_ABI = [
  {
    type: "tuple",
    components: [
      {
        type: "tuple",
        components: ENVELOPE_ABI,
      },
      { type: "bytes" }, // signature
    ],
  },
] as const;

// ─── Build ────────────────────────────────────────────────────────────────────

// 6-hour window — long enough to absorb Axelar testnet relay delays
// without expiring the intent before delivery to xrpl-evm.
const INTENT_TTL_SECONDS = 21600n;

export function buildEnvelope(params: {
  xrplAddress: string;
  market: Address;
  underlying: Address;
  actionType: ActionType;
  amountEvm: bigint;  // 18-decimal EVM wei (0 for ENTER/EXIT_MARKET)
  nonce: bigint;
  deadline?: bigint;
}): IntentEnvelope {
  const xrplAccount = xrplAddressToBytes32(params.xrplAddress);

  // For SUPPLY and REPAY: no egress — destinationAddress is empty
  // For BORROW and WITHDRAW: egress to the user's XRPL address
  const destinationAddress: `0x${string}` =
    params.actionType === ACTION_TYPE.BORROW ||
    params.actionType === ACTION_TYPE.WITHDRAW
      ? toHex(new TextEncoder().encode(params.xrplAddress))
      : "0x";

  const intentId = keccak256(
    toHex(
      new TextEncoder().encode(
        `securd:${params.xrplAddress}:${params.actionType}:${params.nonce}:${Date.now()}`,
      ),
    ),
  );

  return {
    intentId,
    xrplAccount,
    market: params.market,
    underlying: params.underlying,
    actionType: params.actionType,
    amount: params.amountEvm,
    nonce: params.nonce,
    deadline: params.deadline ?? (BigInt(Math.floor(Date.now() / 1000)) + INTENT_TTL_SECONDS),
    destinationAddress,
    version: ENVELOPE_VERSION,
  };
}

// ─── Hash ─────────────────────────────────────────────────────────────────────

export function hashEnvelope(envelope: IntentEnvelope): `0x${string}` {
  return keccak256(
    encodeAbiParameters(ENVELOPE_ABI, [
      envelope.intentId,
      envelope.xrplAccount,
      envelope.market,
      envelope.underlying,
      envelope.actionType,
      envelope.amount,
      envelope.nonce,
      envelope.deadline,
      envelope.destinationAddress,
      envelope.version,
    ]),
  );
}

export function buildSigningDigest(payloadHash: `0x${string}`): `0x${string}` {
  return keccak256(
    encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }, { type: "bytes32" }],
      [ADDRESSES.bridgeAdapter, BigInt(XRPL_EVM_CHAIN_ID), payloadHash],
    ),
  );
}

// ─── Encode ───────────────────────────────────────────────────────────────────

export function encodeSignedIntent(
  envelope: IntentEnvelope,
  signature: `0x${string}`,
): `0x${string}` {
  return encodeAbiParameters(SIGNED_INTENT_ABI, [
    [
      [
        envelope.intentId,
        envelope.xrplAccount,
        envelope.market,
        envelope.underlying,
        envelope.actionType,
        envelope.amount,
        envelope.nonce,
        envelope.deadline,
        envelope.destinationAddress,
        envelope.version,
      ],
      signature,
    ],
  ]);
}
