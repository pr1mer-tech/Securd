# Advanced Strategies Design

## Scope

This feature integrates planning support for the LP leverage and XRP delta-neutral
strategies described in `smart contracts222/docs/securd-lp-leverage-delta-neutral-strategy-spec.md`.

The strategy is mainnet only:

- XRPL Ledger mainnet
- XRPL EVM mainnet, chain ID `1440000`
- Axelar mainnet GMP / ITS routes

Testnet wallets, testnet RPCs, and unlisted chain IDs must be blocked before any
execution flow is enabled.

## Strategy Pools

The first supported LP collateral pools are:

- XRP / USDC LP
  - XRPL AMM account: `rM7cHVPfhe9yxQNk2kDNBEQqoQmMcQGPWE`
  - LP currency: `03B20F3A7D26D33C6DA3503E5CCE3E67B102D4D2`
  - USDC issuer: `rGm7WCVp9gb4jZHWTEtGUr4dd74z2XuWhE`
  - Wrapped LP token: `0xbAF2e0ef5D0dD17646F85129892E40fAA8065f53`
  - Collateral factor: `57%`
  - Theoretical max leverage: `1 / (1 - 0.57) = 2.326x`

- XRP / ARMY LP
  - XRPL AMM account: `rnsRq5ahgbFeRiAgBVvFTafyAgiS9x9Ztn`
  - LP currency: `037C2A57B0011520DE389E332043EC0FAF858ACE`
  - ARMY issuer: `rGG3wQ4kUzd7Jnmk1n5NWPZjjut62kCBfC`
  - Wrapped LP token: `0xD66b43e8a145e3b9e2d7e0F12f28255CB647Db7e`
  - Collateral factor: `35%`
  - Theoretical max leverage: `1 / (1 - 0.35) = 1.538x`

## Math Verification

For starting LP equity `E0`, collateral factor `c`, and `n` completed loops:

```text
targetLeverage = 1 + c + c^2 + ... + c^n
targetLeverage = (1 - c^(n + 1)) / (1 - c)
maxLeverage    = 1 / (1 - collateralFactor)
collateralUSD  = E0 * targetLeverage
debtUSD        = collateralUSD - E0
```

The DApp applies a user-selected safety buffer before sizing each loop:

```text
effectiveC = collateralFactor * (1 - safetyBuffer)
```

Each loop borrows equal USD notional of XRP and the paired asset, then deposits
both legs into the XRPL AMM with `tfTwoAsset`.

For the delta-neutral variant, LP XRP delta is the account's LP share of XRP
reserves:

```text
xrpDelta = f * x
```

Where `f` is the user's LP share and `x` is total XRP reserve. The planner uses a
balanced-pool approximation for initial sizing:

```text
hedgeTargetXrp = (collateralUSD / 2) / xrpPriceUSD
```

Before live execution this must be replaced or confirmed by fresh XRPL
`amm_info` reserve data and the user's exact LP token share.

## Execution Process

The complete flow is intentionally non-atomic:

1. Bridge and supply LP collateral to Securd on XRPL EVM mainnet.
2. Enter the LP market as collateral.
3. For each loop:
   - Borrow XRP on XRPL EVM via Axelar.
   - Borrow the paired asset on XRPL EVM via Axelar.
   - Add both borrowed assets to the XRPL AMM using `AMMDeposit`.
   - Bridge newly minted LP tokens back to XRPL EVM and supply them.
4. For delta-neutral mode:
   - Borrow the XRP hedge amount.
   - Sell borrowed XRP into the paired asset on XRPL Ledger.
   - Monitor `f * x` drift and rebalance when the configured trigger is crossed.

## Implementation Choice

The implemented DApp feature is a mainnet-only planner and execution runbook.
It does not submit live strategy transactions yet.

This is deliberate because one-click execution needs production controls that are
not safe to infer from static configuration:

- Mainnet deployment verification for every cToken, wrapped LP token, bridge
  adapter, oracle, and interest-rate model.
- Fresh `amm_info` reads for pool ratio, LP supply, trading fee, and reserve
  values before every deposit or hedge rebalance.
- Oracle freshness checks and circuit-breaker awareness for XRP, USDC, ARMY,
  and LP collateral prices.
- Axelar Add Gas policy for every LP ITS leg.
- Strict nonce sequencing because the bridge adapter rejects stale or duplicated
  intent nonces.
- Session signing or multisign controls so users do not manually sign an unsafe
  partially executed sequence.
- Abort and unwind handling for failed intermediate legs.

## Production Execution Audit

The current DApp has a single-intent execution path for ordinary market actions.
It already protects against one class of nonce failure by blocking a new intent
while another intent is pending. That is necessary but not sufficient for an
advanced strategy, because a strategy is a sequence of dependent intents and
XRPL transactions.

The audit found these required controls before any live strategy executor:

- Mainnet routing and contracts
  - The shared intent stack is currently testnet-oriented: contract constants
    are labelled XRPL EVM testnet, the signing digest uses chain `1449000`, and
    Axelar/XRPL status links point at testnet services.
  - Advanced strategies must use verified XRPL EVM mainnet chain `1440000`
    contracts, mainnet Axelar routes, and mainnet explorers before enabling an
    execute button.

- Fresh AMM data
  - Every AMM deposit and hedge rebalance must read XRPL `amm_info` immediately
    before signing.
  - Required fields are reserves, LP token supply, trading fee, AMM account, and
    the user's exact LP share.
  - The delta-neutral hedge must use `f * x`, not only the balanced-pool
    approximation shown in the planner.

- Oracle freshness
  - The executor must verify selected oracle price, update time, fallback state,
    and circuit-breaker state for XRP, paired asset, and wrapped LP collateral.
  - If any price is stale or circuit-broken, the sequencer must stop before the
    next borrow or supply leg.

- Add Gas policy
  - Ordinary ITS payments include a fixed gas allowance today.
  - Advanced strategy execution needs mainnet gas quotes per bridge leg and an
    automatic Add Gas path for stuck LP-token transfers.

- Nonce sequencing
  - The existing app blocks one pending intent globally.
  - Strategy execution needs a persisted sequencer that records each signed
    step, waits for Axelar completion, re-reads the next nonce, and resumes
    safely after page refresh.

- Session or multisign authorization
  - Manual signing across many steps is too error-prone for production.
  - A production executor should use constrained session permissions or
    multisign with maximum amounts, allowed markets, chain ID `1440000`, and
    expiry.

- Unwind handling
  - Each phase needs a deterministic stop and unwind action.
  - The DApp should never sign the next leverage borrow after a failed or
    unknown intermediate state.

The current implementation exposes this audit as a readiness-control matrix in
the Markets page. Because several required controls are still blocked or only
partially covered, live strategy execution remains disabled.

## Failure And Unwind Playbook

- Preflight failure
  - Stop if AMM data, oracle price, contract address, or chain ID is stale or
    missing.
  - Action: do not sign; refresh mainnet data and rebuild the plan.

- One borrow leg completed
  - Stop if the matching borrow leg or asset delivery fails.
  - Exposure: one-sided debt.
  - Action: repay the completed borrow before signing another borrow.

- Both borrow legs completed
  - Stop if AMMDeposit quote moves outside slippage or reserve-ratio bounds.
  - Exposure: debt is live but no new LP collateral is supplied.
  - Action: repay both legs or rebuild the deposit from fresh `amm_info`.

- AMMDeposit completed
  - Stop if LP bridge or supply is delayed, under-gassed, or rejected.
  - Exposure: debt is live while new LP collateral is not counted by Securd.
  - Action: Add Gas immediately; if still delayed, stop new loops and monitor
    health factor.

- Axelar timeout
  - Stop if confirmation or destination execution does not finish inside the
    timeout.
  - Action: freeze the sequencer, reconcile state on both chains, then resume or
    unwind from the last confirmed step.

- Delta hedge failure
  - Stop if borrowed XRP cannot be sold within slippage or liquidity bounds.
  - Action: repay the hedge borrow or retry the sale with fresh XRPL AMM/DEX
    liquidity data.

## Current DApp Surfaces

- `lib/strategies/advancedStrategies.ts`
  - Pool configuration.
  - Leverage and hedge math.
  - Execution step generation.
  - Mainnet-only warnings and strategy gates.
  - Production readiness controls and failure playbooks.

- `components/strategies/AdvancedStrategiesPanel.tsx`
  - Planner controls for mode, pool, equity, loops, XRP price, safety buffer,
    and rebalance trigger.
  - Borrow sizing, loop ladder, relay gas estimate, signature count, and
    execution runbook.
  - Execution-readiness blockers and unwind actions.
  - Explicit mainnet-only banner.

- `app/markets/page.tsx`
  - Adds the advanced strategy panel above market tables.

## Audit Notes

- The leverage formula matches the geometric series implied by recursive
  borrow-add-supply loops.
- The max leverage values match the collateral factors in the strategy spec.
- The loop calculator uses an effective collateral factor below the real
  collateral factor, preserving a configurable buffer for oracle drift and
  relay latency.
- The delta-neutral hedge is only an initial balanced-pool approximation; live
  execution must use `amm_info` and exact LP share.
- The UI exposes mainnet-only status and does not present a live execute button,
  preventing accidental testnet or under-controlled live execution.
