import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, encodeAbiParameters, toBytes } from "viem";
import type { IntentEnvelope } from "@/lib/xrpl/types";
import { ADDRESSES } from "@/lib/constants/contracts";

const CHAIN_ID = BigInt(1449000);

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
