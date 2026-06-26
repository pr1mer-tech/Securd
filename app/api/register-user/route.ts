import { NextRequest, NextResponse } from "next/server";
import {
  createWalletClient,
  http,
  keccak256,
  toBytes,
  encodeAbiParameters,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { xrplEvm, XRPL_EVM_RPC_URL } from "@/lib/constants/network";
import { xrplEvmClient } from "@/lib/constants/xrplEvmClient";
import { ADDRESSES, bridgeAdapterContract } from "@/lib/constants/contracts";

// The bridge adapter only accepts cross-chain messages from XRPL Ledger.
const SOURCE_CHAIN = "xrpl";

/**
 * Onboards an XRPL account so its intents can be executed by the bridge adapter.
 * Three onchain registrations, all owner-only, all idempotent:
 *   1. setIntentSigner     — registers the backend key that signs the user's intents
 *   2. setTrustedItsSource — allowlists the user as an ITS source (SUPPLY / REPAY)
 *   3. setTrustedGmpSource — allowlists the user as a GMP source (BORROW / WITHDRAW / ENTER / EXIT)
 *
 * Without (2)/(3) the adapter reverts every relayed message with UntrustedSource.
 */
export async function POST(req: NextRequest) {
  const xrplAddress = req.headers.get("x-xrpl-address");
  if (!xrplAddress) {
    return NextResponse.json({ error: "Missing x-xrpl-address" }, { status: 400 });
  }

  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    return NextResponse.json({ error: "Deployer key not configured" }, { status: 500 });
  }

  const account = privateKeyToAccount(pk as `0x${string}`);
  const backendSigner = account.address;
  const xrplAccount = keccak256(toBytes(xrplAddress));

  // The adapter keys its trusted-source maps by keccak256(abi.encode(sourceChain, sourceAddress)).
  const sourceKey = keccak256(
    encodeAbiParameters(
      [{ type: "string" }, { type: "bytes" }],
      [SOURCE_CHAIN, stringToHex(xrplAddress)],
    ),
  );

  const walletClient = createWalletClient({
    account,
    chain: xrplEvm,
    transport: http(XRPL_EVM_RPC_URL),
  });

  // Sends a tx and waits for it to be mined; throws if it reverts.
  async function send(functionName: string, args: readonly unknown[]) {
    const hash = await walletClient.writeContract({
      address: ADDRESSES.bridgeAdapter,
      abi: bridgeAdapterContract.abi,
      functionName: functionName as never,
      args: args as never,
    });
    const receipt = await xrplEvmClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error(`${functionName} reverted (${hash})`);
    }
    return hash;
  }

  try {
    const [currentSigner, itsTrusted, gmpTrusted] = await Promise.all([
      xrplEvmClient.readContract({
        ...bridgeAdapterContract,
        functionName: "intentSignerOfXrplAccount",
        args: [xrplAccount],
      }),
      xrplEvmClient.readContract({
        ...bridgeAdapterContract,
        functionName: "trustedItsSource",
        args: [sourceKey],
      }),
      xrplEvmClient.readContract({
        ...bridgeAdapterContract,
        functionName: "trustedGmpSource",
        args: [sourceKey],
      }),
    ]);

    const txs: Record<string, string> = {};

    // Sequential — each waits for its receipt so the deployer nonce stays ordered.
    if (currentSigner.toLowerCase() !== backendSigner.toLowerCase()) {
      txs.setIntentSigner = await send("setIntentSigner", [xrplAccount, backendSigner]);
    }
    if (!itsTrusted) {
      txs.setTrustedItsSource = await send("setTrustedItsSource", [
        SOURCE_CHAIN,
        stringToHex(xrplAddress),
        true,
      ]);
    }
    if (!gmpTrusted) {
      txs.setTrustedGmpSource = await send("setTrustedGmpSource", [
        SOURCE_CHAIN,
        xrplAddress,
        true,
      ]);
    }

    return NextResponse.json({
      registered: true,
      alreadyComplete: Object.keys(txs).length === 0,
      txs,
    });
  } catch (err) {
    console.error("[register-user]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
