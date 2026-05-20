# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev          # Start Next.js dev server (http://localhost:3000)
bun run build        # Production build
bun run lint         # ESLint via next lint

# TypeScript check (no build output)
npx tsc --noEmit

# Drizzle migrations
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

**Package manager:** `bun` (v1.3.10). Use `bun install` not `npm install`. Node ≥ 24 required.

## Architecture

Securd is an XRPL-native lending protocol. Users on the **XRPL Ledger** (Xaman/Xumm, GemWallet, Crossmark, WalletConnect) interact with lending contracts on **XRPL EVM** (chain ID 1449000) without ever needing an EVM private key.

```
XRPL Ledger (user, r-address)
      │  XRPL Payment with Axelar memo (XRPL Connect)
      ▼
Axelar Network
      │  GMP relay (borrow/withdraw/enter/exit market)
      │  ITS transfer with token (supply/repay)
      ▼
BridgeAdapter.sol → XRPLUserProxy.sol → Lending core
                    (CREATE2 per user)   (Comptroller, CErc20, Oracle)
```

### Wallet layer (XRPL Connect)

Wallet connection and XRPL transaction signing go through `@xrpl-connect/core`. The provider lives in `lib/xrpl/walletContext.tsx` and instantiates a singleton `WalletManager` with adapters for Xaman, Crossmark, GemWallet, and WalletConnect. Components consume it via:

- `useWallet()` → `{ manager, account, connected, connect, disconnect, openPicker }`
- `useAccount()` → `{ address }` — drop-in shim for legacy call sites

Wallet picker UI is a custom Radix Dialog (`WalletPickerModal` inside `walletContext.tsx`) that lists adapters from `manager.getAvailableWallets()`.

### Intent system

Smart contracts cannot verify XRPL signatures. Every write action flows through a server-side **intent signer**:

1. Browser builds an `IntentEnvelope` (fields: `intentId`, `xrplAccount`, `market`, `underlying`, `actionType`, `amount`, `nonce`, `deadline`, `destinationAddress`, `version`)
2. Browser POSTs to `/api/sign-intent` — the server signs and returns a signature
3. Browser encodes envelope + signature into a hex ABI blob, attaches it as Axelar memos to an XRPL Payment, submits via `manager.signAndSubmit(payment)`

### Frontend data flow

`ContractDataSync` (mounted in `app/markets/layout.tsx`) drives all polling:
- `useMarketsData` — reads all cToken contracts on XRPL EVM every 30s → Zustand `markets[]`
- `useUserData` — reads proxy snapshot on wallet connect/change → Zustand `userAccount`, `positions[]`
- `useXrplBalance` — polls XRPL Ledger RPC every 15s for native XRP and IOU balances

State lives in a single Zustand store: `lib/data/marketsStore.ts` (`useMarketsStore`).

## Key conventions

### viem only — no ethers.js

```typescript
import { encodeAbiParameters, keccak256, toHex, toBytes } from "viem";
```

Do not add ethers.js.

### Amount conversions

```
user input (XRP float) → drops (× 1e6) → EVM wei (× 1e12)
```

`IntentEnvelope.amount` always stores 18-decimal EVM wei. The helpers `xrpToDrops` and `dropsToEvmWei` live in `lib/xrpl/useSubmitIntent.ts`.

### Proxy addresses

Never hardcode a proxy address — always derive at runtime:

```typescript
import { getProxyAddress } from "@/lib/utils/xrplProxy";
const proxyAddress = await getProxyAddress(xrplAddress);
```

Factory uses CREATE2 with salt = `keccak256(utf8(xrplAddress))`.

### Server-side signing constraint

`INTENT_SIGNER_PRIVATE_KEY` is only accessed in `app/api/sign-intent/route.ts`. Never import it in `app/` (other than `app/api/`), `components/`, or `lib/`.

### UI components

- All market components live in `components/markets/`
- Named exports only — no default exports
- Tailwind for all styling — no inline styles
- Use `formatUSD` / `formatAPY` from `lib/helpers/market.helpers.ts` for number display

## Adding a new market

1. Deploy `CErc20Delegator` on XRPL EVM, configure collateral factor and oracle
2. Register in `lib/constants/markets.ts` (add `MarketConfig` entry with `cToken`, `underlying`, `bridgeTokenId`; add `xrplCurrency`/`xrplIssuer` for IOU tokens)
3. `useMarketsData` and `useXrplBalance` pick it up automatically

## Adding a new action type

1. Add constant to `ACTION_TYPE` in `lib/xrpl/types.ts`
2. Update `buildXrplPayment` in `lib/xrpl/xrplPayment.ts` (GMP vs ITS)
3. Update `buildEnvelope` in `lib/xrpl/intentBuilder.ts`
4. **Add to `SIGNABLE_ACTION_TYPES` in `app/api/sign-intent/route.ts`** (unsigned actions are rejected at the API level)
5. Update the BridgeAdapter contract

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `INTENT_SIGNER_PRIVATE_KEY` | Yes | EVM private key registered in BridgeAdapter as intent signer |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | WalletConnect adapter project ID |
| `NEXT_PUBLIC_XUMM_API_KEY` | No | Xaman/Xumm adapter (other adapters work without it) |

Copy `.env.local.example` to `.env.local` to get started.

## Deployed contracts (testnet — XRPL EVM chain ID 1449000)

| Contract | Address |
|----------|---------|
| Comptroller | `0x46d364257112230022E72b086Df85a6b0f8D3F86` |
| BridgeAdapter | `0x7AC8Df85448037c6fE1eD5732c6ca71060069237` |
| XRPLUserProxyFactory | `0xB7f3ECe856063F48BC3bcC7A381aE875841663aA` |
| SecurdPriceOracle | `0x517475AFaFfaE71491d9Bad598E07AAFD050Ca80` |
| sXRP cToken | `0x6ec503Ad093B8b8B74AD9168Acb3f547C79f0318` |
| XRPL Axelar Gateway | `rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2` |
