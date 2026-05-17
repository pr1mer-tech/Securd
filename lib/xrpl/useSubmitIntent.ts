"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@hyper-gate/react";
import { useSendTransaction } from "@hyper-gate/react";
import { toast } from "sonner";
import { getNextNonce } from "./nonce";
import { buildEnvelope } from "./intentBuilder";
import { buildXrplPayment } from "./xrplPayment";
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
  /** Amount in XRP (float, e.g. 1.5). ENTER/EXIT_MARKET use zero. */
  amountXrp?: number;
};

export type SubmitIntentState = {
  status: "idle" | "signing" | "submitting" | "success" | "error";
  /** XRPL transaction hash — available once submitted; used for Axelarscan polling */
  txHash?: string;
  error?: string;
};

async function fetchSignature(envelope: IntentEnvelope): Promise<`0x${string}`> {
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
    headers: { "Content-Type": "application/json" },
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
  const { address: xrplAddress } = useAccount();
  const { signMessageAsync: sendTx } = useSendTransaction();
  const [state, setState] = useState<SubmitIntentState>({ status: "idle" });

  const submit = useCallback(
    async (params: SubmitIntentParams) => {
      if (!xrplAddress) {
        toast.error("Connect your XRPL wallet first.");
        return;
      }

      setState({ status: "signing" });

      try {
        // 1. Get current nonce from on-chain adapter
        const nonce = await getNextNonce(xrplAddress);

        // 2. Convert XRP float to drops (6-decimal)
        const amountDrops = BigInt(Math.floor((params.amountXrp ?? 0) * 1_000_000));

        // 3. Build the intent envelope
        const envelope = buildEnvelope({
          xrplAddress,
          market: params.market,
          underlying: params.underlying,
          actionType: params.actionType,
          amountDrops,
          nonce,
        });

        // 4. Get signature from the server-side signing service
        const signature = await fetchSignature(envelope);

        // 5. Build the XRPL Payment transaction
        const payment = buildXrplPayment({
          xrplAddress,
          envelope,
          signature,
          depositDrops: amountDrops, // only relevant for SUPPLY/REPAY
        });

        // 6. Submit via HyperGate (Xumm / Gem wallet)
        setState({ status: "submitting" });
        const txHash = await sendTx(payment as Parameters<typeof sendTx>[0]);

        setState({ status: "success", txHash: txHash as string });
        toast.success("Transaction submitted!", {
          description: txHash
            ? `TX: ${(txHash as string).slice(0, 16)}…`
            : undefined,
        });
        return txHash as string;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setState({ status: "error", error: message });
        toast.error("Transaction failed", { description: message });
      }
    },
    [xrplAddress, sendTx],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { submit, state, reset };
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
