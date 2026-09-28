import type { Address } from "viem";
import { NATIVE_UNDERLYING } from "@/lib/constants/markets";

export const SQUID_NATIVE_TOKEN =
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address;

export const SQUID_XRPL_EVM_MAINNET_CHAIN_ID = "1440000";

const DEFAULT_SQUID_APP_URL = "https://app.squidrouter.com/";
const DEFAULT_SOURCE_CHAIN_ID = "1";

// NEXT_PUBLIC_ vars must be referenced literally (process.env.NEXT_PUBLIC_X)
// for Next.js to inline them into client bundles — process.env[dynamicKey]
// resolves to undefined in the browser. This helper only trims the value.
function trimmed(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
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
    appUrl:
      trimmed(process.env.NEXT_PUBLIC_SQUID_APP_URL) ?? DEFAULT_SQUID_APP_URL,
    widgetIframeUrl: trimmed(process.env.NEXT_PUBLIC_SQUID_WIDGET_IFRAME_URL),
    destinationChainId:
      trimmed(process.env.NEXT_PUBLIC_SQUID_DESTINATION_CHAIN_ID) ??
      SQUID_XRPL_EVM_MAINNET_CHAIN_ID,
    defaultSourceChainId:
      trimmed(process.env.NEXT_PUBLIC_SQUID_DEFAULT_SOURCE_CHAIN_ID) ??
      DEFAULT_SOURCE_CHAIN_ID,
    defaultSourceToken:
      (trimmed(process.env.NEXT_PUBLIC_SQUID_DEFAULT_SOURCE_TOKEN) as
        | Address
        | undefined) ?? SQUID_NATIVE_TOKEN,
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

// The Widget Studio iframe route parses everything after `?config=` as one
// JSON blob, so appending extra query params (chains/tokens) corrupts it and
// the widget renders blank. Prefill must instead be merged into the config
// JSON itself via `initialAssets`. If the URL has no parseable config param,
// return it untouched rather than risk breaking it.
export function buildSquidWidgetUrl(
  widgetIframeUrl: string,
  {
    destinationToken,
    destinationChainId,
    sourceChainId,
    sourceToken,
  }: SquidBridgeUrlParams,
): string {
  const cfg = getSquidBridgeConfig();
  const url = new URL(widgetIframeUrl);
  const rawConfig = url.searchParams.get("config");
  if (!rawConfig) return widgetIframeUrl;

  let widgetConfig: Record<string, unknown>;
  try {
    widgetConfig = JSON.parse(rawConfig);
  } catch {
    return widgetIframeUrl;
  }

  widgetConfig.initialAssets = {
    from: {
      chainId: sourceChainId ?? cfg.defaultSourceChainId,
      address: sourceToken ?? cfg.defaultSourceToken,
    },
    to: {
      chainId: destinationChainId ?? cfg.destinationChainId,
      address: destinationToken,
    },
  };

  url.searchParams.set("config", JSON.stringify(widgetConfig));
  return url.toString();
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
