import type { Address } from "viem";
import { NATIVE_UNDERLYING } from "@/lib/constants/markets";

export const SQUID_NATIVE_TOKEN =
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address;

export const SQUID_XRPL_EVM_MAINNET_CHAIN_ID = "1440000";

const DEFAULT_SQUID_APP_URL = "https://apiplus.squidrouter.com/";
const DEFAULT_SOURCE_CHAIN_ID = "1";

function publicEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

type SquidBridgeUrlParams = {
  destinationToken: Address;
  destinationChainId?: string;
  sourceChainId?: string;
  sourceToken?: Address;
};

export function getSquidDestinationToken(underlying: Address): Address {
  return underlying.toLowerCase() === NATIVE_UNDERLYING.toLowerCase()
    ? SQUID_NATIVE_TOKEN
    : underlying;
}

export function getSquidBridgeConfig() {
  return {
    appUrl: publicEnv("NEXT_PUBLIC_SQUID_APP_URL") ?? DEFAULT_SQUID_APP_URL,
    widgetIframeUrl: publicEnv("NEXT_PUBLIC_SQUID_WIDGET_IFRAME_URL"),
    destinationChainId:
      publicEnv("NEXT_PUBLIC_SQUID_DESTINATION_CHAIN_ID") ??
      SQUID_XRPL_EVM_MAINNET_CHAIN_ID,
    defaultSourceChainId:
      publicEnv("NEXT_PUBLIC_SQUID_DEFAULT_SOURCE_CHAIN_ID") ??
      DEFAULT_SOURCE_CHAIN_ID,
    defaultSourceToken:
      (publicEnv("NEXT_PUBLIC_SQUID_DEFAULT_SOURCE_TOKEN") as Address | undefined) ??
      SQUID_NATIVE_TOKEN,
  };
}

export function buildSquidBridgeUrl({
  destinationToken,
  destinationChainId,
  sourceChainId,
  sourceToken,
}: SquidBridgeUrlParams): string {
  const cfg = getSquidBridgeConfig();
  return buildSquidUrl(cfg.appUrl, {
    destinationToken,
    destinationChainId,
    sourceChainId,
    sourceToken,
  });
}

export function buildSquidWidgetUrl(
  widgetIframeUrl: string,
  params: SquidBridgeUrlParams,
): string {
  return buildSquidUrl(widgetIframeUrl, params);
}

function buildSquidUrl(
  baseUrl: string,
  {
    destinationToken,
    destinationChainId,
    sourceChainId,
    sourceToken,
  }: SquidBridgeUrlParams,
): string {
  const cfg = getSquidBridgeConfig();
  const url = new URL(baseUrl);
  const fromChain = sourceChainId ?? cfg.defaultSourceChainId;
  const toChain = destinationChainId ?? cfg.destinationChainId;
  const fromToken = sourceToken ?? cfg.defaultSourceToken;

  url.searchParams.set("chains", `${fromChain},${toChain}`);
  url.searchParams.set("tokens", `${fromToken},${destinationToken}`);

  return url.toString();
}
