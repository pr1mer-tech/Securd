import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, encodeAbiParameters, toBytes, hexToString } from "viem";
import type { IntentEnvelope } from "@/lib/xrpl/types";
import { ACTION_TYPE } from "@/lib/xrpl/types";
import { ADDRESSES, bridgeAdapterContract } from "@/lib/constants/contracts";
import { xrplEvmClient } from "@/lib/constants/xrplEvmClient";

const CHAIN_ID = BigInt(1449000);

// Action types permitted through the server signing service — all six
// lending actions. ENTER_MARKET / EXIT_MARKET carry no amount; the rest
// must move a positive amount (enforced below).
const SIGNABLE_ACTION_TYPES = new Set<number>([
  ACTION_TYPE.SUPPLY,
  ACTION_TYPE.BORROW,
  ACTION_TYPE.REPAY,
  ACTION_TYPE.WITHDRAW,
  ACTION_TYPE.ENTER_MARKET,
  ACTION_TYPE.EXIT_MARKET,
]);

// Actions that toggle collateral only — they must carry a zero amount.
const ZERO_AMOUNT_ACTION_TYPES = new Set<number>([
  ACTION_TYPE.ENTER_MARKET,
  ACTION_TYPE.EXIT_MARKET,
]);

// Actions that send funds out to an XRPL address — destinationAddress must
// be present and must equal the caller's own claimed address (see VULN-04
// check below). All other actions carry no egress and must leave it empty.
const EGRESS_ACTION_TYPES = new Set<number>([
  ACTION_TYPE.BORROW,
  ACTION_TYPE.WITHDRAW,
]);

function buildDigest(envelope: IntentEnvelope): `0x${string}` {
  const payloadHash = keccak256(
    encodeAbiParameters(
      [
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "address" },
        { type: "address" },
        { type: "uint8" },
        { type: "uint256" },
        { type: "uint64" },
        { type: "uint64" },
        { type: "bytes" },
        { type: "uint16" },
      ],
      [
        envelope.intentId,
        envelope.xrplAccount,
        envelope.market,
        envelope.underlying,
        envelope.actionType,
        envelope.amount,
        envelope.nonce,
        envelope.deadline,
        envelope.destinationAddress,
        envelope.version,
      ],
    ),
  );

  return keccak256(
    encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }, { type: "bytes32" }],
      [ADDRESSES.bridgeAdapter, CHAIN_ID, payloadHash],
    ),
  );
}

export async function POST(req: NextRequest) {
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    return NextResponse.json(
      { error: "Intent signer not configured" },
      { status: 500 },
    );
  }

  // VULN-01 fix: require the caller to declare which XRPL address they are
  // acting for. We verify it derives to the xrplAccount in the envelope so
  // the server never signs for an account the caller didn't explicitly claim.
  const xrplAddress = req.headers.get("x-xrpl-address");
  if (!xrplAddress) {
    return NextResponse.json(
      { error: "Missing x-xrpl-address header" },
      { status: 400 },
    );
  }

  let envelope: IntentEnvelope;
  try {
    const body = await req.json();
    // Rehydrate bigints from string (JSON doesn't support bigint)
    envelope = {
      ...body.envelope,
      amount: BigInt(body.envelope.amount),
      nonce: BigInt(body.envelope.nonce),
      deadline: BigInt(body.envelope.deadline),
    } as IntentEnvelope;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // VULN-01 fix: verify the declared XRPL address derives to the envelope's xrplAccount.
  // keccak256(utf8(xrplAddress)) is the canonical derivation used by the bridge adapter.
  const expectedXrplAccount = keccak256(toBytes(xrplAddress));
  if (
    envelope.xrplAccount.toLowerCase() !== expectedXrplAccount.toLowerCase()
  ) {
    return NextResponse.json(
      { error: "xrplAccount mismatch" },
      { status: 403 },
    );
  }

  // VULN-02 fix: validate market and underlying against the protocol's market
  // registry on-chain. marketConfigOf() is the BridgeAdapter's own record of
  // listed markets — the same source the adapter checks when relaying intents.
  // Prevents signing intents targeting arbitrary or malicious EVM contracts.
  let marketUnderlying: string;
  let marketListed: boolean;
  try {
    const [underlying, , listed] = await xrplEvmClient.readContract({
      ...bridgeAdapterContract,
      functionName: "marketConfigOf",
      args: [envelope.market],
    });
    marketUnderlying = underlying;
    marketListed = listed;
  } catch (err) {
    console.error("[sign-intent] marketConfigOf read failed", err);
    return NextResponse.json(
      { error: "Market validation unavailable" },
      { status: 502 },
    );
  }
  if (!marketListed) {
    return NextResponse.json({ error: "Unknown market" }, { status: 400 });
  }
  if (
    envelope.underlying.toLowerCase() !== marketUnderlying.toLowerCase()
  ) {
    return NextResponse.json(
      { error: "Underlying address mismatch" },
      { status: 400 },
    );
  }

  // VULN-03 fix: only sign known action types.
  if (!SIGNABLE_ACTION_TYPES.has(envelope.actionType)) {
    return NextResponse.json(
      { error: "Action type not permitted" },
      { status: 400 },
    );
  }

  // VULN-04 fix: the xrplAccount check above only proves the caller *knows*
  // the address (public info) — it does not prove key ownership. Without this
  // check, anyone could request a signed BORROW/WITHDRAW intent for a known
  // victim address with destinationAddress rewritten to their own wallet, and
  // only need to submit their own XRPL payment to trigger it. Pinning
  // destinationAddress to the same address asserted in the header closes that
  // off: funds from a BORROW/WITHDRAW against xrplAccount can only ever be
  // routed back to the address that requested the signature. Non-egress
  // actions must carry no destination at all.
  if (EGRESS_ACTION_TYPES.has(envelope.actionType)) {
    let decodedDestination: string;
    try {
      decodedDestination = hexToString(envelope.destinationAddress);
    } catch {
      return NextResponse.json(
        { error: "Invalid destinationAddress" },
        { status: 400 },
      );
    }
    if (decodedDestination !== xrplAddress) {
      return NextResponse.json(
        { error: "destinationAddress must match the requesting xrplAddress" },
        { status: 403 },
      );
    }
  } else if (envelope.destinationAddress !== "0x") {
    return NextResponse.json(
      { error: "destinationAddress must be empty for this action type" },
      { status: 400 },
    );
  }

  // VULN-03 fix: amount must match the action shape.
  // ENTER_MARKET / EXIT_MARKET carry no amount; all others must be positive
  // (rejects no-op signed intents and over/under-funded transfers).
  if (ZERO_AMOUNT_ACTION_TYPES.has(envelope.actionType)) {
    if (envelope.amount !== 0n) {
      return NextResponse.json(
        { error: "Amount must be zero for ENTER_MARKET / EXIT_MARKET" },
        { status: 400 },
      );
    }
  } else if (envelope.amount <= 0n) {
    return NextResponse.json(
      { error: "Amount must be positive" },
      { status: 400 },
    );
  }

  try {
    const account = privateKeyToAccount(pk as `0x${string}`);
    const digest = buildDigest(envelope);
    // signMessage adds EIP-191 prefix, matching ECDSA.toEthSignedMessageHash on-chain
    const signature = await account.signMessage({
      message: { raw: toBytes(digest) },
    });
    return NextResponse.json({ signature });
  } catch (err) {
    console.error("[sign-intent]", err);
    return NextResponse.json({ error: "Signing failed" }, { status: 500 });
  }
}
