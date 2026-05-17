# Contributing

## Local development

### Requirements

- Node.js 18+
- `.env.local` configured (see [README.md](README.md#local-setup))

```bash
npm install
npm run dev
```

TypeScript check:

```bash
npx tsc --noEmit
```

---

## Adding a new market

Adding a new asset to Securd requires changes in two places: the market registry and (if it's an IOU on the XRPL Ledger) the XRPL identity fields.

### 1. Deploy the cToken on XRPL EVM

Deploy a `CErc20Delegator` pointing to the new underlying token, set its collateral factor in the Comptroller, and configure the oracle price feed. Record the cToken address and the Axelar ITS token ID.

### 2. Register in `lib/constants/markets.ts`

```typescript
{
  cToken:             "0x<cToken address>",
  underlying:         "0x<underlying ERC-20 address>",
  symbol:             "s<SYMBOL>",       // e.g. "sUSDC"
  name:               "Securd <Name>",   // e.g. "Securd USDC"
  underlyingSymbol:   "<SYMBOL>",        // e.g. "USDC"
  underlyingDecimals: 6,                 // decimals of the underlying token
  bridgeTokenId:      "0x<ITS token ID>",

  // XRPL Ledger identity for wallet balance lookup:
  // - Omit both for native XRP.
  // - For IOU tokens, set the currency code and the issuer r-address.
  xrplCurrency: "USD",                           // 3-char or 40-char hex
  xrplIssuer:   "r<IssuerAddressOnXRPLLedger>",
},
```

That is all that is needed on the frontend. The `useMarketsData` hook fetches all market data automatically for every entry in `MARKETS`. The `useXrplBalance` hook resolves the wallet balance via `account_lines` using `xrplCurrency` + `xrplIssuer`.

### 3. Verify Axelar ITS configuration

Ensure the BridgeAdapter has the market configured (`marketConfigOf(cToken)`) and that the ITS token ID matches the registered Axelar ITS token for that asset on XRPL EVM.

---

## Code structure

### Adding a UI component

All market-facing components live in `components/markets/`. Follow the existing pattern:

- Props typed at the top of the file
- No default exports — named exports only
- Tailwind for all styling — no inline styles
- Use `formatUSD` and `formatAPY` from `lib/helpers/market.helpers.ts` for number display

### Adding a new on-chain read

1. Add the function to the relevant ABI file in `lib/constants/abi/`
2. Add a typed contract helper in `lib/constants/contracts.ts` if needed
3. Add the read inside `useMarketsData` (market-level data) or `useUserData` (per-user data)
4. Expose new fields via the Zustand store types in `lib/types/market.types.ts`

### Adding a new action type

Action types are defined in `lib/xrpl/types.ts`:

```typescript
export const ACTION_TYPE = {
  SUPPLY:       0,
  BORROW:       1,
  REPAY:        2,
  WITHDRAW:     3,
  ENTER_MARKET: 4,
  EXIT_MARKET:  5,
} as const;
```

To add a new action:
1. Add the constant to `ACTION_TYPE` in `lib/xrpl/types.ts`
2. Update `buildXrplPayment` in `lib/xrpl/xrplPayment.ts` — decide if it uses GMP or ITS
3. Update `buildEnvelope` in `lib/xrpl/intentBuilder.ts` — set `destinationAddress` appropriately
4. **Add the new value to `SIGNABLE_ACTION_TYPES` in `app/api/sign-intent/route.ts`** — the endpoint rejects any action type not in this allowlist
5. Update the BridgeAdapter contract to handle the new `actionType` value

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `INTENT_SIGNER_PRIVATE_KEY` | Yes | EVM private key of the intent signer. Must match the address registered in `BridgeAdapter.intentSignerOfXrplAccount` for each user. On testnet this is the deployer key. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | WalletConnect project ID — required by HyperGate for wallet discovery. Get one at https://cloud.walletconnect.com |
| `NEXT_PUBLIC_XUMM_API_KEY` | No | Xumm API key for the native Xumm connector. Without it, Xumm still works via WalletConnect. |

---

## Key conventions

### Amount handling

User input is always in human-readable token units (e.g. `1.5` XRP). Conversions:

```
human units  →  drops  =  Math.floor(amount × 1e6)
drops        →  EVM wei  =  drops × 10n ** 12n
```

The `IntentEnvelope.amount` field always stores **18-decimal EVM wei**.

### Proxy address

Never hardcode a proxy address. Always derive it at runtime:

```typescript
import { getProxyAddress } from "@/lib/utils/xrplProxy";
const proxyAddress = await getProxyAddress(xrplAddress);
```

The factory uses CREATE2 with salt = `keccak256(utf8(xrplAddress))`, so the result is deterministic but must be read from the factory contract to handle the case where the proxy has not yet been deployed.

### viem only — no ethers.js

All ABI encoding, hashing, and hex utilities use **viem**:

```typescript
import { encodeAbiParameters, keccak256, toHex, toBytes } from "viem";
```

Do not add ethers.js as a dependency.

### Server-side signing only

The `INTENT_SIGNER_PRIVATE_KEY` must never be imported in any file under `app/` (except `app/api/`), `components/`, or `lib/`. Signing happens exclusively in `app/api/sign-intent/route.ts`.

### `/api/sign-intent` validation rules

The signing endpoint enforces these checks before issuing a signature. Any new feature that routes through it must satisfy all of them:

| Rule | Enforcement |
|------|-------------|
| `x-xrpl-address` header must be present | `fetchSignature` in `useSubmitIntent.ts` sets this automatically from the connected wallet address |
| `envelope.xrplAccount` must equal `keccak256(utf8(header address))` | Ensures the signed account matches the declared caller |
| `envelope.market` must be in `MARKETS` (see `lib/constants/markets.ts`) | New markets must be registered there before they can be used |
| `envelope.underlying` must match the registered market's `underlying` | Cannot be overridden per-call |
| `envelope.actionType` must be in `SIGNABLE_ACTION_TYPES` | Currently `SUPPLY(0)`, `BORROW(1)`, `REPAY(2)`, `WITHDRAW(3)` |
| `envelope.amount` must be `> 0` | Zero-amount intents are rejected |
