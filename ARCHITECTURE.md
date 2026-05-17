# Securd — Architecture

## Overview

Securd bridges two networks: the **XRPL Ledger** (where users hold assets and sign transactions) and **XRPL EVM** (where the lending protocol lives). Users never interact with XRPL EVM directly — every action is a native XRPL Payment that Axelar relays and the BridgeAdapter routes to the correct on-chain operation.

---

## System layers

```
┌─────────────────────────────────────────────────────────┐
│                    USER (XRPL Ledger)                   │
│           Xumm / Gem wallet via HyperGate               │
└─────────────────────┬───────────────────────────────────┘
                      │ XRPL Payment (with Axelar memo)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   AXELAR NETWORK                        │
│   GMP relay  ──────────────────────►  XRPL EVM          │
│   ITS transfer (with token) ────────►  XRPL EVM          │
└─────────────────────────────────────┬───────────────────┘
                                      │
                      ┌───────────────▼───────────────┐
                      │        BridgeAdapter.sol       │
                      │  - verifies IntentEnvelope sig │
                      │  - checks nonce & deadline     │
                      │  - routes to XRPLUserProxy     │
                      └───────────────┬───────────────┘
                                      │
                      ┌───────────────▼───────────────┐
                      │       XRPLUserProxy.sol        │
                      │  (one per XRPL address,        │
                      │   CREATE2 deterministic)       │
                      └───────────────┬───────────────┘
                                      │
                      ┌───────────────▼───────────────┐
                      │         Lending Core           │
                      │  Comptroller                   │
                      │  cToken markets (CErc20)       │
                      │  SecurdPriceOracle             │
                      │  JumpRateModelV2               │
                      └───────────────────────────────┘
```

---

## XRPL Ledger side

### Wallets

Users connect Xumm or Gem via **HyperGate** (`@hyper-gate/react`). The dapp only ever sees the user's XRPL `r-address` — no EVM private key exists on the client side.

```typescript
const { address } = useAccount();  // e.g. "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"
```

### XRPL Payments

All writes are standard XRPL Payments sent to the **Axelar gateway** address (`rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2`). Axelar reads instruction memos attached to each payment.

Two memo patterns are used:

| Action | Axelar mechanism | What is transferred |
|--------|-----------------|---------------------|
| Supply | **ITS** (Interchain Token Service) | XRP drops + gas fee drops |
| Repay | **ITS** | XRP drops + gas fee drops |
| Enter market | **GMP** (General Message Passing) | Gas fee drops only |
| Exit market | **GMP** | Gas fee drops only |
| Borrow | **GMP** (General Message Passing) | Gas fee drops only |
| Withdraw | **GMP** | Gas fee drops only |

ITS actions transfer the actual token to XRPL EVM. GMP actions carry only a signed message — no token moves from XRPL Ledger.

### Memo encoding

All memo fields are UTF-8 hex encoded. The `payload` memo carries a raw hex-encoded ABI blob (the signed `IntentEnvelope`).

```
MemoType  = utf8Hex("payload")
MemoData  = rawHex(abiEncoded(SignedIntent))

MemoType  = utf8Hex("destination_address")
MemoData  = utf8Hex(bridgeAdapterAddress_without_0x)

MemoType  = utf8Hex("destination_chain")
MemoData  = utf8Hex("xrpl-evm")

MemoType  = utf8Hex("gas_fee_amount")     // ITS only
MemoData  = utf8Hex(gasDrops.toString())
```

---

## Intent system

Because smart contracts cannot verify XRPL signatures directly, Securd uses a server-side **intent signer** key that the BridgeAdapter trusts.

### Flow

```
Browser                 Next.js API (/api/sign-intent)       XRPL EVM
   │                            │                               │
   │── buildEnvelope() ─────────│                               │
   │── POST /api/sign-intent ──►│                               │
   │                            │── signMessage(digest) ───────►│
   │◄── { signature } ──────────│                               │
   │── buildXrplPayment() ──────│                               │
   │── HyperGate.submit() ──────────────────────────────────────►
```

### IntentEnvelope fields

| Field | Type | Description |
|-------|------|-------------|
| `intentId` | `bytes32` | `keccak256(utf8("intent:" + uuid))` — unique per tx |
| `xrplAccount` | `bytes32` | `keccak256(utf8(xrplAddress))` — matches proxy salt |
| `market` | `address` | cToken contract address |
| `underlying` | `address` | Underlying token address |
| `actionType` | `uint8` | 0=SUPPLY 1=BORROW 2=REPAY 3=WITHDRAW 4=ENTER_MARKET 5=EXIT_MARKET |
| `amount` | `uint256` | 18-decimal EVM wei |
| `nonce` | `uint64` | Fetched from `adapter.nextNonceByXrplAccount` |
| `deadline` | `uint256` | Unix timestamp (now + 30 min) |
| `destinationAddress` | `bytes` | SUPPLY/REPAY: `0x`; BORROW/WITHDRAW: UTF-8 bytes of r-address |
| `version` | `uint8` | Always `1` |

### Signing digest

```typescript
const payloadHash = keccak256(encodeAbiParameters(ENVELOPE_ABI, [...envelopeFields]));
const digest = keccak256(encodeAbiParameters(
  [{ type: "address" }, { type: "uint256" }, { type: "bytes32" }],
  [adapterAddress, 1449000n, payloadHash]
));
// Server signs with EIP-191 prefix: signMessage({ message: { raw: toBytes(digest) } })
```

### Amount conversion

```
userInputXrp  →  drops (× 1e6)  →  EVM wei (× 1e12)
```
ITS auto-scales the token from XRPL 6-decimal drops to EVM 18-decimal wei. The envelope always stores the 18-decimal EVM wei amount.

---

## XRPL EVM side

### XRPLUserProxy

Each XRPL address has exactly one proxy contract, deployed deterministically:

```solidity
salt = keccak256(abi.encodePacked(xrplAddress_utf8_bytes))
proxy = CREATE2(salt, XRPLUserProxy bytecode)
```

The proxy holds the user's collateral and debt positions. The BridgeAdapter calls into the proxy after verifying the intent signature.

### Lending core contracts

| Contract | Role |
|----------|------|
| `Comptroller` | Risk manager — collateral factors, market entry, account liquidity |
| `CErc20Delegator` | cToken market — tracks supply/borrow balances, exchange rate |
| `SecurdPriceOracle` | Price feeds for USD valuation of each asset |
| `JumpRateModelV2` | Interest rate model — utilization-based borrow/supply APY |

### Key reads used by the frontend

| Function | Contract | Purpose |
|----------|----------|---------|
| `getAccountLiquidity(proxy)` | Comptroller | Borrow limit and shortfall |
| `getAssetsIn(proxy)` | Comptroller | Which markets the user has entered as collateral |
| `markets(cToken)` | Comptroller | Collateral factor for each market |
| `getAccountSnapshot(proxy)` | cToken | cToken balance, borrow balance, exchange rate |
| `getUnderlyingPrice(cToken)` | Oracle | USD price (36 - underlyingDecimals decimals) |
| `getCash()` | cToken | Available liquidity |
| `totalBorrows()` | cToken | Total borrowed from market |
| `borrowRatePerBlock()` | cToken | Current borrow rate |
| `supplyRatePerBlock()` | cToken | Current supply rate |
| `nextNonceByXrplAccount(bytes32)` | BridgeAdapter | Replay protection nonce |

---

## Frontend data flow

```
ContractDataSync (mounts in markets layout)
      │
      ├── useMarketsData()   ──────► xrplEvmClient.readContract × 10 per market
      │   (every 30 s)               → Zustand: markets[]
      │
      └── useUserData()      ──────► getProxyAddress(xrplAddress)
          (on address/market         → 3 + N parallel readContract calls
           change)                   → Zustand: userAccount
                                              positions[]
                                              borrowLimitUSD
                                              healthFactor
                                              netAPY

useXrplBalance()   ──────────────► XRPL Ledger RPC (account_info + account_lines)
(every 15 s)                        → getWalletBalance(market) per asset
```

---

## Transaction UX flow

```
User clicks "Supply"
      │
      ▼
useSubmitIntent.submit()
      │
      ├── 1. getNextNonce(xrplAddress)          [XRPL EVM read]
      ├── 2. buildEnvelope(...)                  [local]
      ├── 3. POST /api/sign-intent               [server signs]
      ├── 4. buildXrplPayment(envelope, sig)     [local]
      └── 5. HyperGate.signMessageAsync(payment) [Xumm/Gem popup]
                    │
                    ▼ txHash returned
      TxStatusModal opens
      useAxelarStatus(txHash) polls every 5 s
            │
            ├── Step 1: XRPL submitted      (immediate)
            ├── Step 2: Axelar relay detected
            ├── Step 3: Axelar approved
            └── Step 4: Executed on XRPL EVM
```

---

## Security notes

- **Intent signer key** lives only in `INTENT_SIGNER_PRIVATE_KEY` on the server. The browser never sees it. The Next.js API route `/api/sign-intent` is the only signer.
- **Nonce** is fetched on-chain before each transaction. Replaying an old payload is not possible.
- **Deadline** is 30 minutes from signing. Stale payloads are rejected by the BridgeAdapter.
- **Proxy isolation** — each user's proxy is independent. A bug in one user's intent cannot affect another user's positions.
