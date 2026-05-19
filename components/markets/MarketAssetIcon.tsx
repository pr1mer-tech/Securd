"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SYMBOL_COLORS: Record<string, string> = {
  XRP:  "bg-[#346AA9]",
  ETH:  "bg-[#627EEA]",
  USDC: "bg-[#2775CA]",
  USDT: "bg-[#26A17B]",
  BTC:  "bg-[#F7931A]",
};

const SYMBOL_ICONS: Record<string, string> = {
  XRP:  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ripple/info/logo.png",
};

type Props = {
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
};

const SIZE_PX = { sm: 28, md: 36, lg: 48 };

export function MarketAssetIcon({ symbol, size = "md", className }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const iconUrl = SYMBOL_ICONS[symbol];

  if (iconUrl && !imgFailed) {
    return (
      <Image
        src={iconUrl}
        alt={symbol}
        width={SIZE_PX[size]}
        height={SIZE_PX[size]}
        onError={() => setImgFailed(true)}
        className={cn("rounded-full shrink-0", SIZE[size], className)}
      />
    );
  }

  const color = SYMBOL_COLORS[symbol] ?? "bg-securdPrimary";
  const initials = symbol.slice(0, 3).toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        color,
        SIZE[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
