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
};

type GmpEvent = {
  status?: string;
  call?: { transactionHash?: string };
  gas_paid?: object;
  approved?: { transactionHash?: string };
  executed?: { transactionHash?: string };
  error?: object | null;
};

function parseStatus(event: GmpEvent | null, txHash: string): AxelarStatus {
  const xrplLink = `https://testnet.xrpl.org/transactions/${txHash}`;
  const axelarLink = `https://testnet.axelarscan.io/gmp/${txHash.toLowerCase()}`;

  if (!event) {
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

  const hasFailed = !!event.error;
  const status = event.status ?? "";

  const relayDetected: AxelarStep = event.call || event.gas_paid ? "done" : "pending";
  const axelarApproved: AxelarStep =
    event.approved || status === "executed" ? "done" : hasFailed ? "error" : "pending";
  const evmExecuted: AxelarStep =
    event.executed && !hasFailed
      ? "done"
      : hasFailed
        ? "error"
        : "pending";

  const evmTxHash = event.executed?.transactionHash;

  return {
    xrplSubmitted: "done",
    relayDetected,
    axelarApproved,
    evmExecuted,
    evmTxHash,
    xrplLink,
    axelarLink,
    isComplete: evmExecuted === "done",
    isFailed: hasFailed,
  };
}

export function useAxelarStatus(txHash: string | undefined) {
  const [status, setStatus] = useState<AxelarStatus | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const poll = useCallback(async (hash: string) => {
    try {
      const res = await fetch(
        `${AXELARSCAN_API}/gmp/search?txHash=${hash}&size=1`,
        { cache: "no-store" },
      );
      if (!res.ok) return;

      const json = await res.json();
      const event: GmpEvent | null = json?.data?.[0] ?? null;
      const parsed = parseStatus(event, hash);
      setStatus(parsed);

      if (parsed.isComplete || parsed.isFailed) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch {
      // silently ignore transient errors and keep polling
    }
  }, []);

  useEffect(() => {
    if (!txHash) {
      setStatus(null);
      return;
    }

    // Immediately show step 1 as done
    setStatus(parseStatus(null, txHash));
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
