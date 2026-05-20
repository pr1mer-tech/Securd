# Securd — Deployment & Testing Guide

This guide walks a developer through every step needed to get the dapp running locally, verify the end-to-end transaction flow against XRPL EVM testnet, and deploy to Vercel.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Local setup](#2-local-setup)
3. [Environment variables explained](#3-environment-variables-explained)
4. [Register the intent signer on-chain](#4-register-the-intent-signer-on-chain)
5. [Wallet setup](#5-wallet-setup)
6. [Run the dapp and verify it loads](#6-run-the-dapp-and-verify-it-loads)
7. [End-to-end transaction testing](#7-end-to-end-transaction-testing)
8. [Vercel production deployment](#8-vercel-production-deployment)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

Before starting, make sure you have all of the following:

### Tools

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 22 | https://nodejs.org |
| Bun | 1.3.10 | `curl -fsSL https://bun.sh/install \| bash` |
| Git | any | system package manager |

> Bun is the package manager and runtime used by this project. Do not use `npm` or `yarn` — they will produce a different lockfile.

### Accounts and keys you need to prepare

| What | Why | How to get it |
|------|-----|---------------|
| **XRPL testnet account** | The wallet users connect with (Xumm/Gem) | [XRPL Testnet Faucet](https://faucet.altnet.rippletest.net/) — generates a funded r-address |
| **EVM private key (intent signer)** | Signs intent envelopes server-side so the BridgeAdapter trusts them | Generate a fresh EVM keypair (see below) |
| **WalletConnect project ID** | Used by the WalletConnect adapter in XRPL Connect | [cloud.walletconnect.com](https://cloud.walletconnect.com) — free account, create a project |
| **Xaman/Xumm API key** *(optional)* | Enables the native Xaman adapter (without it Xaman still works via WalletConnect) | [developer.xumm.dev](https://developer.xumm.dev) |

#### Generate a fresh EVM intent signer keypair

You need a dedicated EVM keypair for the intent signer — do not reuse a personal wallet. Generate one with cast (from Foundry):

```bash
cast wallet new
```

Output example:
```
Address:     0xAbCd...
Private key: 0x1234...
```

Save both values. You will register the **address** on-chain and put the **private key** in `.env.local`.

If you do not have Foundry installed, you can also generate a keypair with Node:

```js
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
const pk = generatePrivateKey();
const account = privateKeyToAccount(pk);
console.log("Private key:", pk);
console.log("Address:", account.address);
```

---

## 2. Local setup

### Clone and install

```bash
git clone <repo-url>
cd Securd
git checkout smart_contracts_integration
bun install
```

### Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the three variables (see [Section 3](#3-environment-variables-explained) for what each one means):

```env
INTENT_SIGNER_PRIVATE_KEY=0x<your-evm-private-key>
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-walletconnect-project-id>
NEXT_PUBLIC_XUMM_API_KEY=<your-xumm-api-key>   # optional
```

### TypeScript check

Before running, confirm there are no type errors:

```bash
bunx tsc --noEmit
```

---

## 3. Environment variables explained

### `INTENT_SIGNER_PRIVATE_KEY`

**Server-side only. Never exposed to the browser.**

This is the EVM private key of the account registered as the intent signer in the `BridgeAdapter` contract. When a user initiates a transaction (supply, borrow, repay, withdraw), the Next.js API route `/api/sign-intent` uses this key to countersign the intent envelope before it is submitted to Axelar.

The BridgeAdapter stores a mapping: `xrplAccount → authorised signer address`. This key must match the address registered for each user's XRPL account.

On testnet, the deployer key is typically registered as the global signer. In production, each user's XRPL account would register its own signer.

> **Security:** This key never leaves the Next.js server. Do not commit it, log it, or include it in any client-side bundle.

### `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

Required by the WalletConnect adapter so wallets that connect over WalletConnect (mobile apps, Xaman, etc.) can pair with the dapp. Without it, the WalletConnect adapter will fail to initialise.

Get a free project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com):
1. Create an account
2. Create a new project (type: "App")
3. Copy the **Project ID** (not the secret)

### `NEXT_PUBLIC_XUMM_API_KEY` *(optional)*

Enables the native Xaman adapter in XRPL Connect. Without it:
- Xaman still works via the WalletConnect adapter (users scan a QR code)
- The native Xaman flow (deep link / push notification) is unavailable

Get an API key at [developer.xumm.dev](https://developer.xumm.dev).

---

## 4. Register the intent signer on-chain

This is the most critical setup step. Before any transaction can succeed, the BridgeAdapter must know which EVM address is authorised to sign intents for your test XRPL account.

### Contract details

| Contract | Address |
|----------|---------|
| BridgeAdapter | `0x7AC8Df85448037c6fE1eD5732c6ca71060069237` |
| Network | XRPL EVM Testnet (chain ID `1449000`) |
| RPC | `https://rpc.testnet.xrplevm.org` |

### What to call

The BridgeAdapter exposes a function:

```solidity
function setIntentSigner(bytes32 xrplAccount, address signer) external;
```

- `xrplAccount` — the `keccak256(utf8(xrplAddress))` of the XRPL r-address you will use for testing
- `signer` — the EVM address of the intent signer keypair you generated in Section 1

### Deriving `xrplAccount` from your r-address

```ts
import { keccak256, toBytes } from "viem";
const xrplAccount = keccak256(toBytes("rYourXRPLAddress..."));
// e.g. keccak256(toBytes("rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"))
```

Or in the browser console (after `bun run dev` is running):
```js
const { keccak256, toBytes } = await import("viem");
keccak256(toBytes("rYourXRPLAddress..."));
```

### Call `setIntentSigner` with cast

```bash
cast send \
  0x7AC8Df85448037c6fE1eD5732c6ca71060069237 \
  "setIntentSigner(bytes32,address)" \
  <xrplAccount_bytes32> \
  <signer_address> \
  --rpc-url https://rpc.testnet.xrplevm.org \
  --private-key <deployer_or_owner_private_key>
```

> **Note:** Only the contract owner or an authorised caller can invoke `setIntentSigner`. On testnet this is typically the deployer. If you do not control the deployer key, ask the person who deployed the contracts to register your signer address.

### Verify the registration

```bash
cast call \
  0x7AC8Df85448037c6fE1eD5732c6ca71060069237 \
  "intentSignerOfXrplAccount(bytes32)(address)" \
  <xrplAccount_bytes32> \
  --rpc-url https://rpc.testnet.xrplevm.org
```

The returned address should match the signer address you put in `INTENT_SIGNER_PRIVATE_KEY`.

---

## 5. Wallet setup

### Install a wallet

Install any one of:
- **Xaman / Xumm** — [xumm.app](https://xumm.app) (iOS / Android)
- **Crossmark** — [crossmark.io](https://crossmark.io) (browser extension)
- **GemWallet** — [gemwallet.app](https://gemwallet.app) (browser extension)
- Any wallet that supports XRPL via **WalletConnect**

All of the above are supported by XRPL Connect through their respective adapters.

### Fund your XRPL testnet account

1. Open [XRPL Testnet Faucet](https://faucet.altnet.rippletest.net/)
2. Enter your r-address
3. Click **Generate** — you receive 1,000 test XRP

Confirm the balance in your wallet or on [testnet.xrpl.org](https://testnet.xrpl.org).

> You need at least 20 XRP as a reserve plus the amount you plan to supply. For testing, 100+ XRP is recommended.

### Configure the wallet for XRPL testnet

**Xumm:**
1. Settings → Advanced → Node → select **Testnet** (`wss://s.altnet.rippletest.net:51233`)

**Gem Wallet:**
1. Settings → Network → XRPL Testnet

---

## 6. Run the dapp and verify it loads

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### What you should see on first load

- The **Markets** page lists the sXRP market with on-chain data: supply APY, borrow APY, total supplied, total borrowed, available liquidity
- The **Account Summary** panel shows "Connect your XRPL wallet"
- No errors in the browser console

### Connect your wallet

1. Click **Connect Wallet** in the header
2. Select Xumm or Gem Wallet
3. Scan the QR code (Xumm) or approve in the extension (Gem)
4. After connecting, the Account Summary should show your borrow limit, health factor, and net APY (all zero until you supply)

### Verify the signing endpoint

Test that the server is correctly configured before any transaction:

```bash
curl -s -X POST http://localhost:3000/api/sign-intent \
  -H "Content-Type: application/json" \
  -H "x-xrpl-address: rYourXRPLAddress" \
  -d '{
    "envelope": {
      "intentId": "0x0000000000000000000000000000000000000000000000000000000000000001",
      "xrplAccount": "<keccak256 of your r-address>",
      "market": "0x6ec503Ad093B8b8B74AD9168Acb3f547C79f0318",
      "underlying": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      "actionType": 0,
      "amount": "1000000000000000000",
      "nonce": "0",
      "deadline": "9999999999",
      "destinationAddress": "0x",
      "version": 1
    }
  }'
```

Expected response: `{"signature":"0x..."}` (a 65-byte hex signature).

If you get `{"error":"Intent signer not configured"}` — check `INTENT_SIGNER_PRIVATE_KEY` in `.env.local`.
If you get `{"error":"Unknown market"}` — the market address does not match `lib/constants/markets.ts`.

---

## 7. End-to-end transaction testing

Each test step should be verified at three levels:
- **XRPL Ledger** — [testnet.xrpl.org](https://testnet.xrpl.org) — the XRPL payment was submitted
- **Axelarscan** — [testnet.axelarscan.io](https://testnet.axelarscan.io) — the Axelar relay completed
- **XRPL EVM Explorer** — [explorer.testnet.xrplevm.org](https://explorer.testnet.xrplevm.org) — the EVM transaction executed on the proxy

The dapp's **TxStatusModal** shows a 4-step progress indicator that polls Axelarscan automatically every 5 seconds — you can follow the relay live without leaving the app.

---

### Step 1 — Supply XRP

1. On the Markets page, click **Supply** on the sXRP row
2. Enter an amount (e.g. `10` XRP) — leave some XRP for gas and reserve
3. Click **Supply XRP** — your wallet will prompt you to sign the XRPL payment
4. Approve in Xumm / Gem
5. The TxStatusModal opens and tracks the relay

**What to verify:**
- TxStatusModal reaches Step 4 "Executed on XRPL EVM" ✓
- On XRPL EVM Explorer, your proxy address shows a cToken balance increase
- On the Markets page, "Supplied" balance updates on the next 30-second refresh
- Supply APY displayed matches the on-chain `supplyRatePerBlock`

> **Proxy address:** If you don't know your proxy address, open the browser console and run:
> ```js
> const { getProxyAddress } = await import("/lib/utils/xrplProxy.js");
> await getProxyAddress("rYourXRPLAddress");
> ```

---

### Step 2 — Borrow XRP

> You must supply first. Borrowing requires collateral, but note that supply does **not** automatically enable collateral — the collateral toggle is currently disabled (coming soon). For now, verify borrow limit is based on whatever collateral state was set during contract setup.

1. Click **Borrow** on the sXRP row
2. Enter an amount below 80% of your borrow limit (shown in the modal preview)
3. Click **Borrow XRP** — sign in your wallet
4. Wait for TxStatusModal to complete

**What to verify:**
- Borrowed XRP arrives in your XRPL Ledger wallet (check balance in Xumm / testnet.xrpl.org)
- "Borrowed" balance updates in the UI
- Health factor decreases (moves closer to 1.0)
- Borrow limit bar fills proportionally

---

### Step 3 — Repay XRP

1. Click **Repay** on the sXRP row
2. Click the **Borrowed** MAX button — the amount fills automatically with a +0.5% accrual buffer
3. Click **Repay XRP** — sign in your wallet
4. Wait for completion

**What to verify:**
- "Borrowed" balance returns to 0 after relay
- Health factor returns to ∞ (no debt)
- On XRPL EVM Explorer, the proxy's borrow balance is 0

---

### Step 4 — Withdraw XRP

1. Click **Withdraw** on the sXRP row (or via the market detail page)
2. Enter an amount up to your full supply balance
3. Click **Withdraw XRP** — sign in your wallet
4. Wait for completion

**What to verify:**
- Withdrawn XRP arrives in your XRPL Ledger wallet
- "Supplied" balance decreases in the UI
- On XRPL EVM Explorer, cToken balance of the proxy decreases

---

### Step 5 — Verify display consistency

After running the full cycle:

- [ ] AccountSummary shows borrow limit = 0, health factor = ∞, net APY = 0
- [ ] SupplyMarketsTable shows 0 in the "Supplied" and "Borrowed" columns for your account
- [ ] Wallet balance column still shows live XRPL balance (fetched from `account_info`)
- [ ] Refresh the page — all balances persist correctly (data comes from on-chain, not local state)
- [ ] Disconnect wallet — UI reverts to "Connect your XRPL wallet" state
- [ ] Reconnect — balances reload correctly

---

### What to watch for during testing

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| "Transaction failed — Intent signer not configured" | `INTENT_SIGNER_PRIVATE_KEY` missing or invalid in `.env.local` | Check the env var and restart `bun run dev` |
| "Transaction failed — xrplAccount mismatch" | The connected wallet address does not match the envelope | Clear browser state, reconnect wallet |
| "Transaction failed — Action type not permitted" | Attempting ENTER/EXIT_MARKET (collateral toggle is disabled) | Expected — this feature is not yet implemented |
| TxStatusModal stuck at Step 1 | XRPL payment not submitted — wallet rejected or timed out | Re-submit; check wallet for a pending approval |
| TxStatusModal stuck at Step 2 | Axelar relay not picking up the payment | Check Axelarscan manually; gas drops may be too low |
| TxStatusModal stuck at Step 3 | Axelar approved but EVM tx reverted | Check XRPL EVM Explorer for revert reason — likely a signature or nonce mismatch |
| UI balances do not update | Data refresh interval is 30s | Wait 30 seconds or navigate away and back |
| "Nonce mismatch" on second transaction | Previous tx failed after nonce was incremented | Reload the page — nonce is re-fetched fresh each time |
| Borrow limit shows 0 after supply | Collateral toggle is disabled; supply does not auto-enter collateral | Expected — collateral must be enabled separately (not yet supported in the UI) |

---

## 8. Vercel production deployment

### Steps

1. **Push the branch** to GitHub / GitLab
2. **Import the repository** into [vercel.com](https://vercel.com)
   - Framework preset: **Next.js**
   - Root directory: `.` (repository root)
   - Build command: `bun run build` *(Vercel detects this automatically)*
3. **Set environment variables** in the Vercel dashboard → Settings → Environment Variables:

   | Variable | Environment |
   |----------|-------------|
   | `INTENT_SIGNER_PRIVATE_KEY` | Production, Preview |
   | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Production, Preview |
   | `NEXT_PUBLIC_XUMM_API_KEY` | Production, Preview *(optional)* |

4. **Deploy** — click Deploy. The `/api/sign-intent` route is automatically deployed as a Vercel Serverless Function.
5. **Verify** the deployed URL loads the Markets page and the signing endpoint responds:

   ```bash
   curl -s https://your-app.vercel.app/api/sign-intent \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{}' | jq .
   # Expected: {"error":"Missing x-xrpl-address header"}
   ```

   A 400 with the above message confirms the endpoint is live and validating correctly.

### Environment variable security on Vercel

- `INTENT_SIGNER_PRIVATE_KEY` has **no** `NEXT_PUBLIC_` prefix — Vercel keeps it server-side only
- `NEXT_PUBLIC_*` variables are embedded in the client bundle — do not put secrets in them
- Never commit `.env.local` to git (it is already in `.gitignore`)

### Bun version on Vercel

Vercel uses its own Node.js version by default. To ensure Bun is used as the package manager:
- The `packageManager` field in `package.json` is already set to `bun@1.3.10`
- The `.tool-versions` file pins `bun 1.3.10` and `nodejs 22.22.0`
- If Vercel defaults to npm, override the install command to `bun install`

---

## 9. Troubleshooting

### Build fails with module not found

```bash
bun install   # ensure all packages are installed
bunx tsc --noEmit   # check for type errors first
bun run build
```

### `INTENT_SIGNER_PRIVATE_KEY` is set but signing fails

The private key must start with `0x` and be 32 bytes (64 hex chars after the prefix):
```
0x0000000000000000000000000000000000000000000000000000000000000001
```
Viem's `privateKeyToAccount` will throw if the format is wrong.

### The intent signer address does not match on-chain

Run the verification command from Section 4. If the address returned by `intentSignerOfXrplAccount` does not match the address derived from your `INTENT_SIGNER_PRIVATE_KEY`, transactions will always fail with a BridgeAdapter revert.

Re-register by calling `setIntentSigner` again with the correct address.

### Axelar relay never completes

- Check [testnet.axelarscan.io](https://testnet.axelarscan.io) for your XRPL tx hash
- If the relay shows "Insufficient fee" — the gas drops constants in `lib/xrpl/types.ts` (`ITS_GAS_FEE_DROPS`, `GMP_GAS_DROPS`) may need to be increased
- If the relay shows "Error" — check the memo encoding by reading the raw transaction on [testnet.xrpl.org](https://testnet.xrpl.org)

### Wallet picker modal does not open

- Confirm `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set and valid (required for the WalletConnect adapter to register)
- Check the browser console for an XRPL Connect or WalletConnect error
- The project ID is tied to a domain — localhost should work by default, but if deploying you may need to add the Vercel domain to the allowed origins in the WalletConnect dashboard
- If the modal opens but lists no wallets, `manager.getAvailableWallets()` returned empty — likely a browser-side adapter availability issue (no extension installed, etc.)

### XRP balance shows 0 in the Wallet column

- `useXrplBalance` fetches from `s.altnet.rippletest.net` using `account_info`
- If the wallet is connected but shows 0, the XRPL RPC may be rate-limiting — wait 15 seconds (the hook refreshes every 15s)
- Confirm the connected r-address is funded on testnet using [testnet.xrpl.org](https://testnet.xrpl.org)
