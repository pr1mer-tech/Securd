import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, encodeAbiParameters, toBytes } from "viem";
import type { IntentEnvelope } from "@/lib/xrpl/types";
import { ACTION_TYPE } from "@/lib/xrpl/types";
import { ADDRESSES } from "@/lib/constants/contracts";
import { getMarketByAddress } from "@/lib/constants/markets";

const CHAIN_ID = BigInt(1449000);

// Action types permitted through the server signing service.
// ENTER_MARKET (4) and EXIT_MARKET (5) are intentionally excluded —
// they require no amount and must come from a separate, account-owner-only flow.
const SIGNABLE_ACTION_TYPES = new Set<number>([
  ACTION_TYPE.SUPPLY,
  ACTION_TYPE.BORROW,
  ACTION_TYPE.REPAY,
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
  const pk = process.env.INTENT_SIGNER_PRIVATE_KEY;
  if (!pk) {
    return NextResponse.json({ error: "Intent signer not configured" }, { status: 500 });
  }

  // VULN-01 fix: require the caller to declare which XRPL address they are
  // acting for. We verify it derives to the xrplAccount in the envelope so
  // the server never signs for an account the caller didn't explicitly claim.
  const xrplAddress = req.headers.get("x-xrpl-address");
  if (!xrplAddress) {
    return NextResponse.json({ error: "Missing x-xrpl-address header" }, { status: 400 });
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
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // VULN-01 fix: verify the declared XRPL address derives to the envelope's xrplAccount.
  // keccak256(utf8(xrplAddress)) is the canonical derivation used by the bridge adapter.
  const expectedXrplAccount = keccak256(toBytes(xrplAddress));
  if (envelope.xrplAccount.toLowerCase() !== expectedXrplAccount.toLowerCase()) {
    return NextResponse.json({ error: "xrplAccount mismatch" }, { status: 403 });
  }

  // VULN-02 fix: validate market and underlying against the protocol's market registry.
  // Prevents signing intents targeting arbitrary or malicious EVM contracts.
  const marketConfig = getMarketByAddress(envelope.market);
  if (!marketConfig) {
    return NextResponse.json({ error: "Unknown market" }, { status: 400 });
  }
  if (envelope.underlying.toLowerCase() !== marketConfig.underlying.toLowerCase()) {
    return NextResponse.json({ error: "Underlying address mismatch" }, { status: 400 });
  }

  // VULN-03 fix: only sign permitted action types.
  // Blocks ENTER_MARKET / EXIT_MARKET from being signed via this endpoint,
  // preventing an attacker from toggling victim collateral to trigger liquidation.
  if (!SIGNABLE_ACTION_TYPES.has(envelope.actionType)) {
    return NextResponse.json({ error: "Action type not permitted" }, { status: 400 });
  }

  // VULN-03 fix: reject zero or negative amounts to prevent no-op signed intents.
  if (envelope.amount <= 0n) {
    return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
  }

  try {
    const account = privateKeyToAccount(pk as `0x${string}`);
    const digest = buildDigest(envelope);
    // signMessage adds EIP-191 prefix, matching ECDSA.toEthSignedMessageHash on-chain
    const signature = await account.signMessage({ message: { raw: toBytes(digest) } });
    return NextResponse.json({ signature });
  } catch (err) {
    console.error("[sign-intent]", err);
    return NextResponse.json({ error: "Signing failed" }, { status: 500 });
  }
}
