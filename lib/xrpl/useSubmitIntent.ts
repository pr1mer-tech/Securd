"use client";

import { useState, useCallback } from "react";
import { parseUnits, formatUnits } from "viem";
import { useWallet } from "@/lib/xrpl/walletContext";
import { useMarketsStore } from "@/lib/data/marketsStore";
import { toast } from "sonner";
import { getNextNonce } from "./nonce";
import { buildEnvelope } from "./intentBuilder";
import { buildXrplPayment, type ItsDeposit } from "./xrplPayment";
import {
  ACTION_TYPE,
  DROPS_TO_EVM,
  type ActionType,
  type IntentEnvelope,
} from "./types";
import type { Address } from "viem";

export type SubmitIntentParams = {
  market: Address;
  underlying: Address;
  actionType: ActionType;
  /** EVM-side decimals of the underlying token — for envelope amount scaling. */
  underlyingDecimals: number;
  /** Human-readable decimal amount string (e.g. "1.5"). Omit for ENTER/EXIT_MARKET. */
  amount?: string;
  /**
   * IOU identity on the XRPL Ledger. Present → the token is an issued currency:
   * SUPPLY/REPAY send an XRPL Amount object. Absent → native XRP.
   */
  iou?: { currency: string; issuer: string };
};

export type SubmitIntentState = {
  status: "idle" | "signing" | "submitting" | "success" | "error";
  /** XRPL transaction hash — available once submitted; used for Axelarscan polling */
  txHash?: string;
  error?: string;
};

/** Normalizes a user-entered amount into a parseUnits-safe decimal string. */
function sanitizeAmount(raw?: string): string {
  const v = (raw ?? "").trim();
  const n = Number(v);
  if (!v || !Number.isFinite(n) || n <= 0) return "0";
  return v.startsWith(".") ? `0${v}` : v;
}

/** Derives the IOU descriptor from a market — undefined for native XRP. */
export function marketIou(
  m: { xrplCurrency?: string; xrplIssuer?: string },
): { currency: string; issuer: string } | undefined {
  return m.xrplCurrency && m.xrplIssuer
    ? { currency: m.xrplCurrency, issuer: m.xrplIssuer }
    : undefined;
}

async function fetchSignature(
  envelope: IntentEnvelope,
  xrplAddress: string,
): Promise<`0x${string}`> {
  // Serialize bigints as strings for JSON
  const body = {
    envelope: {
      ...envelope,
      amount: envelope.amount.toString(),
      nonce: envelope.nonce.toString(),
      deadline: envelope.deadline.toString(),
    },
  };

  const res = await fetch("/api/sign-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-xrpl-address": xrplAddress,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "Signing failed" }));
    throw new Error(error ?? "Signing failed");
  }

  const { signature } = await res.json();
  return signature as `0x${string}`;
}

export function useSubmitIntent() {
  const { account, manager } = useWallet();
  const xrplAddress = account?.address;
  const [state, setState] = useState<SubmitIntentState>({ status: "idle" });
  const pendingTxHash = useMarketsStore((s) => s.pendingTxHash);
  const setPendingTxHash = useMarketsStore((s) => s.setPendingTxHash);

  const submit = useCallback(
    async (params: SubmitIntentParams) => {
      if (!xrplAddress || !manager) {
        toast.error("Connect your XRPL wallet first.");
        return;
      }

      // The adapter nonce is strictly sequential — refuse a new intent while a
      // prior one is still relaying, otherwise both read the same nonce and the
      // second is rejected on-chain. getState() reads fresh, avoiding stale closure.
      if (useMarketsStore.getState().pendingTxHash) {
        toast.error("A transaction is still in progress", {
          description: "Wait for it to finish before submitting another.",
        });
        return;
      }

      setState({ status: "signing" });

      try {
        // 1. Get current nonce from on-chain adapter
        const nonce = await getNextNonce(xrplAddress);

        // 2. Convert the human amount to on-chain units.
        //    Native XRP: drops (6-dec) is the deliverable unit → envelope = drops × 1e12.
        //    IOU token:  envelope = amount × 10^underlyingDecimals.
        const human = sanitizeAmount(params.amount);
        let amountEvm: bigint;
        let deposit: ItsDeposit;
        if (params.iou) {
          amountEvm = parseUnits(human, params.underlyingDecimals);
          deposit = {
            kind: "iou",
            value: formatUnits(amountEvm, params.underlyingDecimals),
            currency: params.iou.currency,
            issuer: params.iou.issuer,
          };
        } else {
          const drops = parseUnits(human, 6);
          amountEvm = drops * DROPS_TO_EVM;
          deposit = { kind: "native", drops };
        }

        // 3. Build the intent envelope
        const envelope = buildEnvelope({
          xrplAddress,
          market: params.market,
          underlying: params.underlying,
          actionType: params.actionType,
          amountEvm,
          nonce,
        });

        // 4. Get signature from the server-side signing service
        const signature = await fetchSignature(envelope, xrplAddress);

        // 5. Build the XRPL Payment transaction (deposit used only for SUPPLY/REPAY)
        const payment = buildXrplPayment({
          xrplAddress,
          envelope,
          signature,
          deposit,
        });

        // 6. Submit via XRPL Connect (wallet user picked at connect time)
        setState({ status: "submitting" });
        const result = await manager.signAndSubmit(payment);
        const txHash = result.hash;

        setState({ status: "success", txHash });
        // Mark in-flight so no other intent submits until Axelar relay finishes.
        // Cleared by usePendingIntentWatcher once the relay completes or fails.
        if (txHash) setPendingTxHash(txHash);
        toast.success("Transaction submitted!", {
          description: txHash ? `TX: ${txHash.slice(0, 16)}…` : undefined,
        });
        return txHash;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setState({ status: "error", error: message });
        toast.error("Transaction failed", { description: message });
      }
    },
    [xrplAddress, manager, setPendingTxHash],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  // True while any intent (from any component) is still relaying — callers
  // disable their action buttons so the user can't queue a second intent.
  const isBlocked = pendingTxHash !== null;

  return { submit, state, reset, isBlocked };
}

// ─── Conversion helpers exported for modal previews ───────────────────────────

/** XRP float → drops */
export function xrpToDrops(xrp: number): bigint {
  return BigInt(Math.floor(xrp * 1_000_000));
}

/** drops → EVM wei (18-decimal) */
export function dropsToEvmWei(drops: bigint): bigint {
  return drops * DROPS_TO_EVM;
}

// Re-export ACTION_TYPE for convenience in callers
export { ACTION_TYPE };
