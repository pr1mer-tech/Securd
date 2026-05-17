# Securd — XRPL Lending Protocol

Securd is a decentralized lending protocol deployed on **XRPL EVM** (chain ID 1449000). Users supply assets to earn interest and borrow against their collateral. All interaction happens from the **XRPL Ledger** using Xumm or Gem wallets — no EVM wallet is ever required. Cross-chain communication is handled by **Axelar GMP and ITS**.

---

## How it works

```
XRPL Ledger (user)
      │
      │  XRPL Payment with Axelar memo
      │  (signed by Xumm / Gem via HyperGate)
      ▼
Axelar Network
      │
      │  GMP relay  (borrow / withdraw)
      │  ITS transfer (supply / repay)
      ▼
BridgeAdapter.sol  ──►  XRPLUserProxy.sol  ──►  Lending core
                         (per XRPL account,      (Comptroller,
                          CREATE2 deterministic)   cToken markets,
                                                   SecurdPriceOracle)
```

Each XRPL address gets a deterministic **proxy contract** on XRPL EVM (salt = `keccak256(utf8(xrplAddress))` via CREATE2). All on-chain positions belong to that proxy. Users never need an EVM private key.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Smart contracts | Solidity — lending core + Axelar adapters |
| XRPL EVM reads | viem `publicClient` (chain ID 1449000) |
| XRPL wallet | HyperGate (Xumm + Gem) via `@hyper-gate/react` |
| Cross-chain bridge | Axelar GMP (enter/exit collateral, borrow/withdraw) + ITS (supply/repay) |
| Frontend | Next.js 14 App Router, Tailwind CSS, Zustand |
| Tx tracking | Axelarscan GMP API |

---

## Deployed contracts — testnet

| Contract | Address |
|----------|---------|
| Comptroller | `0x46d364257112230022E72b086Df85a6b0f8D3F86` |
| SecurdPriceOracle | `0x517475AFaFfaE71491d9Bad598E07AAFD050Ca80` |
| XRPLUserProxyFactory | `0xB7f3ECe856063F48BC3bcC7A381aE875841663aA` |
| BridgeAdapter | `0x7AC8Df85448037c6fE1eD5732c6ca71060069237` |
| sXRP (cToken) | `0x6ec503Ad093B8b8B74AD9168Acb3f547C79f0318` |
| XRPL Axelar Gateway | `rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2` |

- XRPL EVM Explorer: https://explorer.testnet.xrplevm.org
- Axelarscan: https://testnet.axelarscan.io

---

## Local setup

### Prerequisites

- Node.js 18+
- An XRPL testnet account funded via the [XRPL Faucet](https://faucet.altnet.rippletest.net/)
- An EVM private key registered as the intent signer in the BridgeAdapter

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# EVM private key of the intent signer registered in BridgeAdapter.
# On testnet this is the deployer key.
INTENT_SIGNER_PRIVATE_KEY=0x<your-evm-private-key>

# WalletConnect project ID (required by HyperGate)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-project-id>

# Optional — Xumm API key for the Xumm connector
NEXT_PUBLIC_XUMM_API_KEY=<your-xumm-api-key>
```

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000, connect your Xumm or Gem wallet, and navigate to **Markets**.

---

## Project structure

```
app/
  markets/               # Main lending UI (supply, borrow, market detail)
  api/
    sign-intent/         # Server-side intent signing (private key never reaches browser)

components/
  layout/                # Header, navigation
  markets/               # All lending UI components

lib/
  constants/             # Chain config, contract ABIs, market registry
  data/                  # Zustand store (markets[], userAccount)
  helpers/               # Formatting and math (market.helpers.ts)
  hooks/                 # useMarketsData, useUserData, useXrplBalance
  types/                 # TypeScript types (market.types.ts, enums.ts)
  utils/                 # Proxy address derivation (xrplProxy.ts)
  xrpl/                  # Intent builder, XRPL payment builder, Axelar status
```

---

## Further reading

- [ARCHITECTURE.md](ARCHITECTURE.md) — full technical deep-dive
- [CONTRIBUTING.md](CONTRIBUTING.md) — adding markets, local development guide
