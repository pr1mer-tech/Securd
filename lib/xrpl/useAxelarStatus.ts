"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const AXELARSCAN_API = "https://testnet.api.axelarscan.io";
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export type AxelarStep =
  | "pending"   // not yet detected
  | "done"      // confirmed
  | "error";    // failed

export type AxelarStatus = {
  xrplSubmitted: AxelarStep;
  relayDetected: AxelarStep;
  axelarApproved: AxelarStep;
  evmExecuted: AxelarStep;
  evmTxHash?: string;
  axelarLink?: string;
  xrplLink?: string;
  isComplete: boolean;
  isFailed: boolean;
  errorMessage?: string;
};

type GmpEvent = {
  status?: string;
  simplified_status?: string;
  // Axelar-side confirmation failure (e.g. the relay gas fee was too low to
  // verify the message). Surfaced separately from `error`, which only carries
  // destination-chain execution reverts.
  is_insufficient_fee?: boolean;
  confirm_failed?: boolean;
  confirm_failed_event?: { error?: { code?: string; message?: string } };
  call?: { transactionHash?: string };
  gas_paid?: object;
  approved?: { transactionHash?: string };
  executed?: { transactionHash?: string; childMessageIDs?: string[] };
  error?:
    | {
        error?: { reason?: string; code?: string; message?: string };
      }
    | null;
};

function isExecuted(event: GmpEvent): boolean {
  return (
    event.simplified_status === "executed" ||
    event.status === "executed" ||
    !!event.executed?.transactionHash
  );
}

function isFailed(event: GmpEvent): boolean {
  // Execution wins over any failure flag: a message that landed on the
  // destination is never "failed". ITS Hub flows transiently report
  // is_insufficient_fee mid-relay before Axelar settles gas and proceeds —
  // so is_insufficient_fee alone is not terminal. A genuinely unconfirmable
  // message also raises confirm_failed, which is the reliable terminal signal.
  if (isExecuted(event)) return false;
  return (
    event.simplified_status === "failed" ||
    !!event.error ||
    !!event.confirm_failed
  );
}

function formatError(event: GmpEvent | null): string | undefined {
  if (!event) return undefined;
  // Confirmation-stage failure (insufficient relay gas, etc.) — lives on
  // confirm_failed_event, never on `error`.
  const cf = event.confirm_failed_event?.error;
  if (cf) {
    return [cf.message, cf.code && `(${cf.code})`].filter(Boolean).join(" ") || cf.code;
  }
  if (event.is_insufficient_fee) {
    return "Insufficient Axelar gas fee — the cross-chain message could not be confirmed.";
  }
  // Destination-chain execution revert.
  // CANNOT_EXECUTE_MESSAGE/V2 / EstimationReverted / ERROR → "EstimationReverted (ERROR)"
  const e = event.error?.error;
  if (!e) return undefined;
  const parts = [e.message, e.reason && `(${e.reason})`].filter(Boolean);
  return parts.join(" ") || e.code;
}

function parseStatus(
  source: GmpEvent | null,
  child: GmpEvent | null,
  txHash: string,
): AxelarStatus {
  const xrplLink = `https://testnet.xrpl.org/transactions/${txHash}`;
  const axelarLink = `https://testnet.axelarscan.io/gmp/${txHash.toLowerCase()}`;

  if (!source) {
    return {
      xrplSubmitted: "done",
      relayDetected: "pending",
      axelarApproved: "pending",
      evmExecuted: "pending",
      xrplLink,
      axelarLink,
      isComplete: false,
      isFailed: false,
    };
  }

  // For Hub-routed (ITS) flows the destination state lives on the child message.
  // For direct GMP, the source message carries it. `dest` picks whichever exists.
  const dest = child ?? source;

  const sourceFailed = isFailed(source);
  const destFailed = isFailed(dest);
  const hasFailed = sourceFailed || destFailed;

  const destExecuted =
    dest.simplified_status === "executed" || !!dest.executed?.transactionHash;

  const relayDetected: AxelarStep = source.call || source.gas_paid ? "done" : "pending";
  const axelarApproved: AxelarStep =
    dest.approved || destExecuted
      ? "done"
      : destFailed
        ? "error"
        : "pending";
  const evmExecuted: AxelarStep = destExecuted
    ? "done"
    : destFailed
      ? "error"
      : "pending";

  return {
    xrplSubmitted: "done",
    relayDetected,
    axelarApproved,
    evmExecuted,
    evmTxHash: dest.executed?.transactionHash,
    xrplLink,
    axelarLink,
    isComplete: evmExecuted === "done",
    isFailed: hasFailed,
    errorMessage: formatError(dest) ?? formatError(source),
  };
}

export function useAxelarStatus(txHash: string | undefined) {
  const [status, setStatus] = useState<AxelarStatus | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const poll = useCallback(async (hash: string) => {
    try {
      const fetchByTxHash = (h: string) =>
        fetch(`${AXELARSCAN_API}/gmp/searchGMP?txHash=${h}&size=1`, {
          cache: "no-store",
        });
      const fetchByMessageId = (id: string) =>
        fetch(`${AXELARSCAN_API}/gmp/searchGMP?messageId=${encodeURIComponent(id)}&size=1`, {
          cache: "no-store",
        });

      const sourceRes = await fetchByTxHash(hash);
      if (!sourceRes.ok) return;
      const sourceJson = await sourceRes.json();
      const source: GmpEvent | null = sourceJson?.data?.[0] ?? null;

      // ITS Hub flows produce a child message that carries the destination-chain
      // execution status. Fetch it so we can detect EstimationReverted / failures
      // that don't surface on the source GMP.
      let child: GmpEvent | null = null;
      const childId = source?.executed?.childMessageIDs?.[0];
      if (childId) {
        const childRes = await fetchByMessageId(childId);
        if (childRes.ok) {
          const childJson = await childRes.json();
          child = childJson?.data?.[0] ?? null;
        }
      }

      const parsed = parseStatus(source, child, hash);
      setStatus(parsed);

      if (parsed.isComplete || parsed.isFailed) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch (err) {
      // Keep polling on transient errors, but surface for debugging
      console.error("useAxelarStatus: poll failed", err);
    }
  }, []);

  useEffect(() => {
    if (!txHash) {
      setStatus(null);
      return;
    }

    // Immediately show step 1 as done
    setStatus(parseStatus(null, null, txHash));
    startTimeRef.current = Date.now();

    poll(txHash);
    timerRef.current = setInterval(() => {
      if (Date.now() - startTimeRef.current > POLL_TIMEOUT_MS) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      poll(txHash);
    }, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [txHash, poll]);

  return status;
}
