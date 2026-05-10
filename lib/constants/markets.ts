import type { Address } from "viem";

export const NATIVE_UNDERLYING = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address;

export type MarketConfig = {
  cToken: Address;
  underlying: Address;
  symbol: string;
  name: string;
  underlyingSymbol: string;
  underlyingDecimals: number;
  // Axelar ITS token ID for cross-chain bridging
  bridgeTokenId: `0x${string}`;
  // XRPL Ledger identity for wallet balance lookup via account_lines.
  // Omit both for native XRP (uses account_info Balance instead).
  // For IOUs: currency = 3-char code (e.g. "USD") or 40-char hex for long names;
  //           issuer   = XRPL r-address of the token issuer on the Ledger.
  xrplCurrency?: string;
  xrplIssuer?: string;
};

// Registry of all active markets on XRPL EVM testnet
export const MARKETS: MarketConfig[] = [
  {
    cToken:             "0xcD881baC550Ae161942c93CF393822E97c745811",
    underlying:         NATIVE_UNDERLYING,
    symbol:             "sXRP",
    name:               "Securd XRPL",
    underlyingSymbol:   "XRP",
    underlyingDecimals: 6,
    // Axelar ITS token ID — set from bridge adapter marketConfigOf mapping
    bridgeTokenId:      "0x0000000000000000000000000000000000000000000000000000000000000000",
    // Native XRP — no xrplCurrency / xrplIssuer needed
  },
  // Future IOU markets — add xrplCurrency and xrplIssuer from the XRPL Ledger issuer:
  // {
  //   cToken:             "0x...",
  //   underlying:         "0x...",
  //   symbol:             "sUSDC",
  //   name:               "Securd USDC",
  //   underlyingSymbol:   "USDC",
  //   underlyingDecimals: 6,
  //   bridgeTokenId:      "0x...",
  //   xrplCurrency:       "USD",
  //   xrplIssuer:         "r<IssuerAddress>",
  // },
];

export function getMarketByAddress(cToken: Address): MarketConfig | undefined {
  return MARKETS.find(
    (m) => m.cToken.toLowerCase() === cToken.toLowerCase()
  );
}
