"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Circle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { useAxelarStatus, type AxelarStep } from "@/lib/xrpl/useAxelarStatus";

type Props = {
  txHash: string;
  actionLabel: string; // e.g. "Supply XRP"
  onClose: () => void;
};

const STEPS = [
  {
    key: "xrplSubmitted" as const,
    label: "XRPL Transaction Submitted",
    description: "Signed and sent to the XRPL network",
  },
  {
    key: "relayDetected" as const,
    label: "Axelar Relay Detected",
    description: "Axelar relayer picked up the cross-chain message",
  },
  {
    key: "axelarApproved" as const,
    label: "Axelar Network Approved",
    description: "Validators approved the message for execution",
  },
  {
    key: "evmExecuted" as const,
    label: "Executed on XRPL EVM",
    description: "Lending protocol action confirmed on-chain",
  },
];

export function TxStatusModal({ txHash, actionLabel, onClose }: Props) {
  const status = useAxelarStatus(txHash);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1a1d20] border border-white/10 text-securdWhite max-w-md gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="font-poppins text-base">
            {actionLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Steps */}
          <div className="flex flex-col gap-3">
            {STEPS.map((step, i) => {
              const stepStatus: AxelarStep = status?.[step.key] ?? "pending";
              // The first pending step after all done ones is "active" — show spinner
              const prevDone = STEPS.slice(0, i).every(
                (s) => (status?.[s.key] ?? "pending") === "done",
              );
              const isActive = stepStatus === "pending" && prevDone;
              return (
                <StepRow
                  key={step.key}
                  index={i + 1}
                  label={step.label}
                  description={step.description}
                  stepStatus={stepStatus}
                  isActive={isActive}
                />
              );
            })}
          </div>

          {/* Links */}
          {status && (
            <div className="flex flex-wrap gap-3 pt-2">
              {status.xrplLink && (
                <ExternalLinkButton href={status.xrplLink} label="XRPL Explorer" />
              )}
              {status.axelarLink && (
                <ExternalLinkButton href={status.axelarLink} label="Axelarscan" />
              )}
              {status.evmTxHash && (
                <ExternalLinkButton
                  href={`https://explorer.testnet.xrplevm.org/tx/${status.evmTxHash}`}
                  label="XRPL EVM Tx"
                />
              )}
            </div>
          )}

          {/* Terminal state messages */}
          {status?.isComplete && (
            <p className="text-systemGreen text-sm font-medium text-center pt-1">
              Transaction completed successfully.
            </p>
          )}
          {status?.isFailed && (
            <p className="text-systemRed text-sm font-medium text-center pt-1">
              Transaction failed on XRPL EVM. Check Axelarscan for details.
            </p>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold border border-white/20 text-securdGrey hover:text-securdWhite hover:border-white/40 transition-colors mt-1"
          >
            {status?.isComplete || status?.isFailed ? "Close" : "Track in background"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepRow({
  index,
  label,
  description,
  stepStatus,
  isActive,
}: {
  index: number;
  label: string;
  description: string;
  stepStatus: AxelarStep;
  isActive?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        <StepIcon status={stepStatus} index={index} isActive={isActive} />
      </div>
      <div className="flex flex-col">
        <span
          className={`text-sm font-medium leading-tight ${
            stepStatus === "done"
              ? "text-securdWhite"
              : stepStatus === "error"
                ? "text-systemRed"
                : "text-securdGrey"
          }`}
        >
          {label}
        </span>
        <span className="text-xs text-securdGrey/60 leading-tight mt-0.5">
          {description}
        </span>
      </div>
    </div>
  );
}

function StepIcon({
  status,
  index,
  isActive,
}: {
  status: AxelarStep;
  index: number;
  isActive?: boolean;
}) {
  if (status === "done") {
    return <CheckCircle2 size={20} className="text-systemGreen" />;
  }
  if (status === "error") {
    return <XCircle size={20} className="text-systemRed" />;
  }
  if (isActive) {
    return <Loader2 size={20} className="text-securdPrimaryLight animate-spin" />;
  }
  return (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <Circle size={20} className="text-white/20" />
      <span className="absolute text-[9px] font-bold text-white/40">{index}</span>
    </div>
  );
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-xs text-securdPrimaryLight hover:text-securdWhite transition-colors"
    >
      <ExternalLink size={12} />
      {label}
    </a>
  );
}
