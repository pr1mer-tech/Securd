import { ADDRESSES } from "@/lib/constants/contracts";
import {
  ACTION_TYPE,
  AXELAR_DESTINATION_CHAIN,
  GMP_GAS_DROPS,
  ITS_GAS_FEE_DROPS,
  ITS_IOU_GAS_FEE,
  XRPL_AXELAR_GATEWAY,
  type IntentEnvelope,
} from "./types";
import { encodeSignedIntent } from "./intentBuilder";

/**
 * Inbound deposit for an ITS transfer (SUPPLY / REPAY).
 * - `native` — XRP, sent as a drops string Amount.
 * - `iou`    — issued currency, sent as an XRPL Amount object; `value` is the
 *              human-readable deposit (gas is added on top by buildItsPayment).
 */
export type ItsDeposit =
  | { kind: "native"; drops: bigint }
  | { kind: "iou"; value: string; currency: string; issuer: string };

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

/**
 * Adds a whole-token gas fee to a decimal amount string without float drift.
 * e.g. addWholeTokens("10.5", 2) → "12.5"
 */
function addWholeTokens(decimalStr: string, whole: number): string {
  const [intPart, fracPart] = decimalStr.split(".");
  const newInt = (BigInt(intPart || "0") + BigInt(whole)).toString();
  return fracPart ? `${newInt}.${fracPart}` : newInt;
}

// ─── Payment builders ─────────────────────────────────────────────────────────

/**
 * Builds an XRPL Payment for SUPPLY or REPAY via Axelar ITS.
 *
 * Native XRP: SUPPLY sends depositDrops only — native-XRP supply ingress
 *             carries no Axelar gas (gas_fee_amount = "0"). REPAY sends
 *             (depositDrops + ITS_GAS_FEE_DROPS).
 * IOU token:  the user sends an issued-currency Amount object whose value is
 *             (deposit + ITS_IOU_GAS_FEE) — gas is taken from the token itself.
 *
 * In every case the intent envelope's amount is the deposit only (net of gas).
 */
export function buildItsPayment(params: {
  xrplAddress: string;
  envelope: IntentEnvelope;
  signature: `0x${string}`;
  deposit: ItsDeposit;
}) {
  const { xrplAddress, envelope, signature, deposit } = params;
  const payload = encodeSignedIntent(envelope, signature);
  // destination_address for ITS: the bridge adapter EVM address (UTF-8 hex of "0x..." string without 0x)
  const adapterHex = utf8Hex(rawHex(ADDRESSES.bridgeAdapter));

  if (deposit.kind === "iou") {
    return {
      TransactionType: "Payment" as const,
      Account: xrplAddress,
      Amount: {
        currency: deposit.currency,
        issuer: deposit.issuer,
        value: addWholeTokens(deposit.value, ITS_IOU_GAS_FEE),
      },
      Destination: XRPL_AXELAR_GATEWAY,
      Memos: [
        buildMemo("type", utf8Hex("interchain_transfer")),
        buildMemo("destination_address", adapterHex),
        buildMemo("destination_chain", utf8Hex(AXELAR_DESTINATION_CHAIN)),
        // gas_fee_amount for an IOU is denominated in the token itself.
        buildMemo("gas_fee_amount", utf8Hex(String(ITS_IOU_GAS_FEE))),
        buildMemo("payload", rawHex(payload)),
      ],
    };
  }

  // Native-XRP SUPPLY carries no Axelar gas; REPAY pays ITS_GAS_FEE_DROPS,
  // which Axelar deducts from the Payment Amount (net bridged = deposit.drops).
  const gasDrops =
    envelope.actionType === ACTION_TYPE.SUPPLY ? 0n : ITS_GAS_FEE_DROPS;
  const totalDrops = deposit.drops + gasDrops;
  return {
    TransactionType: "Payment" as const,
    Account: xrplAddress,
    Amount: totalDrops.toString(),
    Destination: XRPL_AXELAR_GATEWAY,
    Memos: [
      buildMemo("type", utf8Hex("interchain_transfer")),
      buildMemo("destination_address", adapterHex),
      buildMemo("destination_chain", utf8Hex(AXELAR_DESTINATION_CHAIN)),
      buildMemo("gas_fee_amount", utf8Hex(gasDrops.toString())),
      buildMemo("payload", rawHex(payload)),
    ],
  };
}

/**
 * Builds an XRPL Payment for BORROW or WITHDRAW via Axelar GMP.
 * The user sends only gas XRP (no token transfer) — always native XRP drops,
 * even for IOU markets, since GMP carries an instruction, not a token.
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
  deposit: ItsDeposit; // only used for SUPPLY/REPAY (ITS)
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
