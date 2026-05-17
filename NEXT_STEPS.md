# Next Steps

## 1. Dapp validation against v4 contracts

The smart contracts now support all six XRPL Ledger actions: SUPPLY, ENTER_MARKET,
EXIT_MARKET, BORROW, REPAY, and WITHDRAW. The frontend must be verified against the
v4 deployment from `smart-contracts/deployments/xrpl-evm-testnet.json`.

### Checklist

- [ ] Connect Xumm wallet on XRPL testnet
- [ ] Supply XRP → confirm Axelar relay completes → confirm sXRP balance on XRPL EVM proxy
- [ ] Confirm supply does **not** automatically enable collateral
- [ ] Enter market → confirm sXRP appears in `getAssetsIn(proxy)`
- [ ] Borrow XRP → confirm funds received on XRPL Ledger
- [ ] Repay XRP → confirm borrow balance decreases on-chain
- [ ] Exit market after debt is cleared → confirm sXRP is removed from `getAssetsIn(proxy)`
- [ ] Withdraw XRP → confirm supply balance decreases and XRP returned to XRPL Ledger
- [ ] Verify `AccountSummary` reflects correct balances after each action
- [ ] Verify health factor and borrow limit update correctly
- [ ] Test disconnected state → connect wallet CTA appears
- [ ] Test with zero positions → Wallet column shows real XRP balance

### What to watch for

- Memo encoding mismatches (MemoType / MemoData hex encoding)
- Gas drop amounts too low → Axelar relay times out
- Intent signature mismatch → BridgeAdapter reverts
- Nonce desync after a failed tx → next tx rejected
- Exit market rejected when the position has debt or would create a shortfall

---

## 2. Collateral UX

`enterMarkets` and `exitMarket` are now bridgeable through the v4 BridgeAdapter:

- `ENTER_MARKET = 4`
- `EXIT_MARKET = 5`

SUPPLY intentionally no longer auto-enters collateral. Users must explicitly enter
the market before borrowing.

### Dapp work

- [x] Update v4 addresses in `lib/constants/contracts.ts`
- [x] Update sXRP market address and ITS token ID in `lib/constants/markets.ts`
- [x] Add `ENTER_MARKET` and `EXIT_MARKET` to `ACTION_TYPE`
- [x] Add collateral action button in `SupplyMarketsTable`
- [x] Add the same collateral control to the market detail page
- [x] Disable/clarify exit when the user has debt
- [x] Estimate per-market exit shortfall from current positions and collateral factors
- [x] Improve exit-market guard with `getHypotheticalAccountLiquidity`
- [x] Replace the local exit estimate with exact on-chain hypothetical liquidity

---

## 3. Vercel deployment

### Steps

1. Import the repository into Vercel
2. Set environment variables in the Vercel dashboard:
   - `INTENT_SIGNER_PRIVATE_KEY`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_XUMM_API_KEY`
3. Deploy — the `/api/sign-intent` route runs as a serverless function automatically
4. Verify the deployed URL works end-to-end with testnet

### Notes

- Never commit `.env.local` — it is already in `.gitignore`
- The intent signer key on Vercel must match the key registered in `BridgeAdapter.intentSignerOfXrplAccount` for each user

---

## 4. Additional markets

When new assets are deployed on XRPL EVM testnet (e.g. USDC, ETH), adding them to the dapp requires only adding an entry to `lib/constants/markets.ts`. The entire data layer, UI, and wallet balance hook handle new markets automatically.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the exact fields required.

---

## 5. Precise impact preview (hypothetical liquidity)

The modals now use `getHypotheticalAccountLiquidity` where the Comptroller supports exact previews.

### Completed

- [x] Add a debounced read helper for `comptroller.getHypotheticalAccountLiquidity(proxy, cToken, redeemTokens, borrowAmount)`
- [x] Use exact on-chain preview for Borrow
- [x] Use exact on-chain preview for Withdraw
- [x] Block Borrow/Withdraw submission when the preview returns a shortfall

### Notes

- Supply and Repay remain deterministic projected previews because Compound's hypothetical liquidity API has parameters for borrow and redeem, but not mint or repay.

---

## 6. Production mainnet

Once testnet validation is complete and all the above steps are done:

- [ ] Deploy smart contracts to XRPL EVM mainnet
- [ ] Register new contract addresses in `lib/constants/contracts.ts` and `lib/constants/markets.ts`
- [ ] Switch XRPL RPC from `s.altnet.rippletest.net` to a mainnet node
- [ ] Switch Axelarscan polling URL from `testnet.api.axelarscan.io` to `api.axelarscan.io`
- [ ] Switch chain ID from `1449000` (testnet) to the XRPL EVM mainnet chain ID
- [ ] Audit the intent signing flow and BridgeAdapter before opening to public
