import type { Address } from "viem";

// Placeholder underlying for native XRP — it has no ERC20 contract.
// The BridgeAdapter's marketConfigOf() returns this for the native XRP market.
export const NATIVE_UNDERLYING = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address;

/**
 * XRPL Ledger identity for an IOU market — the one piece of market data that
 * cannot be read from XRPL EVM. Everything else (symbol, underlying, decimals,
 * rates, bridge token id, ...) is read from chain; `getAllMarkets()` on the
 * Comptroller is the single source of truth for which markets exist.
 *
 * currency = 3-char code, or 40-char hex form for long names.
 * issuer   = XRPL r-address of the token issuer on the Ledger.
 * Native XRP markets need no entry here.
 */
export type XrplTokenIdentity = {
  xrplCurrency: string;
  xrplIssuer: string;
};

// Per-cToken XRPL Ledger identity, keyed by lowercase cToken address.
// A market absent from this map still appears (chain is the source of truth) —
// only its IOU supply/repay path needs an entry.
export const MARKET_METADATA: Record<string, XrplTokenIdentity> = {
  // sSTST — IOU on XRPL Ledger, issued by the Axelar gateway.
  // currency is the 40-char hex form of "STST".
  "0x2f874d87e685ec28be749b781dc99119f27cf0be": {
    xrplCurrency: "5354535400000000000000000000000000000000",
    xrplIssuer:   "rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2",
  },
};

export function getMarketMetadata(cToken: Address): XrplTokenIdentity | undefined {
  return MARKET_METADATA[cToken.toLowerCase()];
}
