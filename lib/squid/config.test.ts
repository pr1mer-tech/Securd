import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { NATIVE_UNDERLYING } from "@/lib/constants/markets";
import {
  SQUID_NATIVE_TOKEN,
  SQUID_XRPL_EVM_MAINNET_CHAIN_ID,
  buildSquidBridgeUrl,
  buildSquidWidgetUrl,
  getSquidBridgeConfig,
  getSquidDestinationToken,
} from "./config";

// A non-native ERC20 underlying used across the URL-building assertions.
const ERC20_UNDERLYING =
  "0x1234567890123456789012345678901234567890" as const;

// getSquidBridgeConfig / buildSquidUrl read NEXT_PUBLIC_SQUID_* at call time,
// so snapshot and restore the relevant env between tests.
const ENV_KEYS = [
  "NEXT_PUBLIC_SQUID_APP_URL",
  "NEXT_PUBLIC_SQUID_WIDGET_IFRAME_URL",
  "NEXT_PUBLIC_SQUID_DESTINATION_CHAIN_ID",
  "NEXT_PUBLIC_SQUID_DEFAULT_SOURCE_CHAIN_ID",
  "NEXT_PUBLIC_SQUID_DEFAULT_SOURCE_TOKEN",
] as const;

let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = {};
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

describe("getSquidDestinationToken", () => {
  test("maps the native underlying to Squid's native sentinel", () => {
    expect(getSquidDestinationToken(NATIVE_UNDERLYING)).toBe(SQUID_NATIVE_TOKEN);
  });

  test("is case-insensitive when matching the native underlying", () => {
    const lowered = NATIVE_UNDERLYING.toLowerCase() as typeof NATIVE_UNDERLYING;
    expect(getSquidDestinationToken(lowered)).toBe(SQUID_NATIVE_TOKEN);
  });

  test("passes ERC20 underlyings through unchanged", () => {
    expect(getSquidDestinationToken(ERC20_UNDERLYING)).toBe(ERC20_UNDERLYING);
  });
});

describe("getSquidBridgeConfig defaults", () => {
  test("falls back to documented defaults when env is unset", () => {
    const cfg = getSquidBridgeConfig();
    expect(cfg.appUrl).toBe("https://app.squidrouter.com/");
    expect(cfg.widgetIframeUrl).toBeUndefined();
    expect(cfg.destinationChainId).toBe(SQUID_XRPL_EVM_MAINNET_CHAIN_ID);
    expect(cfg.defaultSourceChainId).toBe("1");
    expect(cfg.defaultSourceToken).toBe(SQUID_NATIVE_TOKEN);
  });

  test("trims blank env values back to the defaults", () => {
    process.env.NEXT_PUBLIC_SQUID_APP_URL = "   ";
    expect(getSquidBridgeConfig().appUrl).toBe("https://app.squidrouter.com/");
  });

  test("honours overrides from env", () => {
    process.env.NEXT_PUBLIC_SQUID_DESTINATION_CHAIN_ID = "1449000";
    process.env.NEXT_PUBLIC_SQUID_DEFAULT_SOURCE_CHAIN_ID = "137";
    const cfg = getSquidBridgeConfig();
    expect(cfg.destinationChainId).toBe("1449000");
    expect(cfg.defaultSourceChainId).toBe("137");
  });
});

describe("buildSquidBridgeUrl", () => {
  test("encodes chains and tokens from defaults plus destination", () => {
    const url = new URL(
      buildSquidBridgeUrl({ destinationToken: ERC20_UNDERLYING }),
    );
    expect(url.origin + url.pathname).toBe("https://app.squidrouter.com/");
    expect(url.searchParams.get("chains")).toBe(
      `1,${SQUID_XRPL_EVM_MAINNET_CHAIN_ID}`,
    );
    expect(url.searchParams.get("tokens")).toBe(
      `${SQUID_NATIVE_TOKEN},${ERC20_UNDERLYING}`,
    );
  });

  test("explicit params override the config defaults", () => {
    const url = new URL(
      buildSquidBridgeUrl({
        destinationToken: ERC20_UNDERLYING,
        destinationChainId: "1449000",
        sourceChainId: "10",
        sourceToken: "0x00000000000000000000000000000000000000aa",
      }),
    );
    expect(url.searchParams.get("chains")).toBe("10,1449000");
    expect(url.searchParams.get("tokens")).toBe(
      `0x00000000000000000000000000000000000000aa,${ERC20_UNDERLYING}`,
    );
  });
});

describe("buildSquidWidgetUrl", () => {
  const widgetBase =
    "https://studio.example/iframe?config=" +
    encodeURIComponent(JSON.stringify({ integratorId: "test-integrator" }));

  test("merges initialAssets into the config JSON without extra params", () => {
    const url = new URL(
      buildSquidWidgetUrl(widgetBase, { destinationToken: ERC20_UNDERLYING }),
    );
    expect(url.origin + url.pathname).toBe("https://studio.example/iframe");
    // No loose chains/tokens params — the studio iframe would fail to parse them.
    expect(url.searchParams.get("chains")).toBeNull();
    expect(url.searchParams.get("tokens")).toBeNull();

    const config = JSON.parse(url.searchParams.get("config")!);
    expect(config.integratorId).toBe("test-integrator");
    expect(config.initialAssets).toEqual({
      from: { chainId: "1", address: SQUID_NATIVE_TOKEN },
      to: {
        chainId: SQUID_XRPL_EVM_MAINNET_CHAIN_ID,
        address: ERC20_UNDERLYING,
      },
    });
  });

  test("explicit params override the config defaults", () => {
    const url = new URL(
      buildSquidWidgetUrl(widgetBase, {
        destinationToken: ERC20_UNDERLYING,
        destinationChainId: "1449000",
        sourceChainId: "10",
        sourceToken: "0x00000000000000000000000000000000000000aa",
      }),
    );
    const config = JSON.parse(url.searchParams.get("config")!);
    expect(config.initialAssets).toEqual({
      from: {
        chainId: "10",
        address: "0x00000000000000000000000000000000000000aa",
      },
      to: { chainId: "1449000", address: ERC20_UNDERLYING },
    });
  });

  test("returns the URL untouched when it has no parseable config param", () => {
    expect(
      buildSquidWidgetUrl("https://widget.example/swap", {
        destinationToken: ERC20_UNDERLYING,
      }),
    ).toBe("https://widget.example/swap");
    expect(
      buildSquidWidgetUrl("https://widget.example/swap?config=not-json", {
        destinationToken: ERC20_UNDERLYING,
      }),
    ).toBe("https://widget.example/swap?config=not-json");
  });
});
