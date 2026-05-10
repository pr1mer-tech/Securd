# Next Steps

## 1. Testnet validation

The highest priority. All TypeScript compiles clean but the cross-chain flow must be verified end-to-end with a real Xumm or Gem wallet before any production work begins.

### Checklist

- [ ] Connect Xumm wallet on XRPL testnet
- [ ] Supply XRP → confirm Axelar relay completes → confirm sXRP balance on XRPL EVM proxy
- [ ] Borrow XRP → confirm funds received on XRPL Ledger
- [ ] Repay XRP → confirm borrow balance decreases on-chain
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

---

## 2. Collateral toggle

Users can supply assets but cannot yet toggle whether a supplied asset counts as collateral. This is a UX gap — without it users cannot actively manage their risk profile.

### What needs to be built

- A toggle switch in `SupplyMarketsTable` and the market detail page
- Two new action types in `lib/xrpl/types.ts`: `ENTER_MARKET` and `EXIT_MARKET`
- Corresponding memo/payment builders in `lib/xrpl/xrplPayment.ts`
- BridgeAdapter support for these action types on the contract side
- UI guard: prevent exiting a market if doing so would put the account into shortfall (check `getHypotheticalAccountLiquidity`)

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

The borrow/supply modals currently show an approximate impact preview. For full accuracy, each modal should call `getHypotheticalAccountLiquidity` on the Comptroller before submission to show the exact post-action borrow limit and health factor.

### What needs to be built

- A read helper that calls `comptroller.getHypotheticalAccountLiquidity(proxy, cToken, redeemTokens, borrowAmount)`
- Hook that triggers on amount input change (debounced)
- Replace the approximate math in `SupplyModal` and `BorrowModal` with the on-chain result

---

## 6. Production mainnet

Once testnet validation is complete and all the above steps are done:

- [ ] Deploy smart contracts to XRPL EVM mainnet
- [ ] Register new contract addresses in `lib/constants/contracts.ts` and `lib/constants/markets.ts`
- [ ] Switch XRPL RPC from `s.altnet.rippletest.net` to a mainnet node
- [ ] Switch Axelarscan polling URL from `testnet.api.axelarscan.io` to `api.axelarscan.io`
- [ ] Switch chain ID from `1449000` (testnet) to the XRPL EVM mainnet chain ID
- [ ] Audit the intent signing flow and BridgeAdapter before opening to public
