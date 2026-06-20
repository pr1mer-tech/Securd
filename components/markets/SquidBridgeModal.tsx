"use client";

import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarketAssetIcon } from "./MarketAssetIcon";
import {
  buildSquidBridgeUrl,
  buildSquidWidgetUrl,
  getSquidBridgeConfig,
  getSquidDestinationToken,
} from "@/lib/squid/config";
import type { MarketData } from "@/lib/types/market.types";

type Props = {
  market: MarketData;
  onClose: () => void;
};

export function SquidBridgeModal({ market, onClose }: Props) {
  const cfg = getSquidBridgeConfig();
  const destinationToken = getSquidDestinationToken(market.underlying);
  const bridgeUrl = useMemo(
    () => buildSquidBridgeUrl({ destinationToken }),
    [destinationToken],
  );
  const widgetUrl = useMemo(
    () =>
      cfg.widgetIframeUrl
        ? buildSquidWidgetUrl(cfg.widgetIframeUrl, { destinationToken })
        : undefined,
    [cfg.widgetIframeUrl, destinationToken],
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1a1d20] border border-white/10 text-securdWhite max-w-[480px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3 font-poppins text-base">
            <MarketAssetIcon symbol={market.underlyingSymbol} size="md" />
            <span>Bridge {market.underlyingSymbol}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-4">
          {widgetUrl ? (
            <div className="h-[620px] w-full overflow-hidden rounded-lg border border-white/10 bg-black/30">
              <iframe
                title={`Squid bridge ${market.underlyingSymbol}`}
                src={widgetUrl}
                className="h-full w-full border-0"
                allow="clipboard-read; clipboard-write; encrypted-media"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-securdGrey">Network</span>
                  <span className="font-medium text-securdWhite">
                    XRPL EVM {cfg.destinationChainId}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-securdGrey">Asset</span>
                  <span className="font-medium text-securdWhite">
                    {market.underlyingSymbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          <a
            href={bridgeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-bold text-securdWhite transition-colors hover:bg-white/10"
          >
            <ExternalLink size={16} />
            Open Squid
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
