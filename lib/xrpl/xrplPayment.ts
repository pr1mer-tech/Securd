import { ADDRESSES } from "@/lib/constants/contracts";
import {
  ACTION_TYPE,
  AXELAR_DESTINATION_CHAIN,
  GMP_GAS_DROPS,
  ITS_GAS_FEE_DROPS,
  XRPL_AXELAR_GATEWAY,
  type IntentEnvelope,
} from "./types";
import { encodeSignedIntent } from "./intentBuilder";

// ─── Memo helpers ─────────────────────────────────────────────────────────────

function utf8Hex(value: string): string {
  return Buffer.from(value, "utf8").toString("hex").toUpperCase();
}

// Strips 0x, uppercases: used for raw-hex fields like the ABI payload
function rawHex(hex: string): string {
  return (hex.startsWith("0x") ? hex.slice(2) : hex).toUpperCase();
}

function buildMemo(key: string, data: string) {
  return { Memo: { MemoType: utf8Hex(key), MemoData: data } };
}

// ─── Payment builders ─────────────────────────────────────────────────────────

/**
 * Builds an XRPL Payment for SUPPLY or REPAY via Axelar ITS.
 * The user sends (depositDrops + gasFeeDrops) XRP to the Axelar gateway.
 * Memos carry the ITS routing and the signed intent payload.
 */
export function buildItsPayment(params: {
  xrplAddress: string;
  envelope: IntentEnvelope;
  signature: `0x${string}`;
  depositDrops: bigint;
}) {
  const { xrplAddress, envelope, signature, depositDrops } = params;
  const totalDrops = depositDrops + ITS_GAS_FEE_DROPS;
  const payload = encodeSignedIntent(envelope, signature);
  // destination_address for ITS: the bridge adapter EVM address (UTF-8 hex of "0x..." string without 0x)
  const adapterHex = utf8Hex(rawHex(ADDRESSES.bridgeAdapter));

  return {
    TransactionType: "Payment" as const,
    Account: xrplAddress,
    Amount: totalDrops.toString(),
    Destination: XRPL_AXELAR_GATEWAY,
    Memos: [
      buildMemo("type", utf8Hex("interchain_transfer")),
      buildMemo("destination_address", adapterHex),
      buildMemo("destination_chain", utf8Hex(AXELAR_DESTINATION_CHAIN)),
      buildMemo("gas_fee_amount", utf8Hex(ITS_GAS_FEE_DROPS.toString())),
      buildMemo("payload", rawHex(payload)),
    ],
  };
}

/**
 * Builds an XRPL Payment for BORROW or WITHDRAW via Axelar GMP.
 * The user sends only gas XRP (no token transfer).
 * Memos carry the GMP routing and the signed intent payload.
 */
export function buildGmpPayment(params: {
  xrplAddress: string;
  envelope: IntentEnvelope;
  signature: `0x${string}`;
}) {
  const { xrplAddress, envelope, signature } = params;
  const payload = encodeSignedIntent(envelope, signature);
  // destination_address for GMP: UTF-8 hex of the adapter address string without "0x"
  const adapterHex = utf8Hex(rawHex(ADDRESSES.bridgeAdapter));

  return {
    TransactionType: "Payment" as const,
    Account: xrplAddress,
    Amount: GMP_GAS_DROPS.toString(),
    Destination: XRPL_AXELAR_GATEWAY,
    Memos: [
      buildMemo("type", utf8Hex("call_contract")),
      buildMemo("destination_address", adapterHex),
      buildMemo("destination_chain", utf8Hex(AXELAR_DESTINATION_CHAIN)),
      buildMemo("payload", rawHex(payload)),
    ],
  };
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function buildXrplPayment(params: {
  xrplAddress: string;
  envelope: IntentEnvelope;
  signature: `0x${string}`;
  depositDrops: bigint; // only used for SUPPLY/REPAY
}) {
  const { envelope } = params;
  if (
    envelope.actionType === ACTION_TYPE.SUPPLY ||
    envelope.actionType === ACTION_TYPE.REPAY
  ) {
    return buildItsPayment(params);
  }
  return buildGmpPayment(params);
}
