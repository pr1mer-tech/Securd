import { getVM } from "@/lib/hooks/pipelines/mirror/vm";
import { Address } from "@nomicfoundation/ethereumjs-util";
import { LegacyTransaction } from '@nomicfoundation/ethereumjs-tx'
import { createPublicClient, encodeFunctionData, erc20Abi, fromHex, fromRlp, hexToBytes, http } from "viem";
import { polygonMumbai } from "viem/chains";
import { z } from "zod";

//@ts-expect-error BigInt is not defined in the browser
BigInt.prototype.toJSON = function () {
    return this.toString();
};

const EthereumAddress = z
    .string()
    .regex(/^(0x)?[0-9a-fA-F]{40}$/, 'Invalid Ethereum address.');
const Hash = z.string().regex(/^0x[0-9a-fA-F]+$/, "Hash must be a valid hex string");

const SimulateInput = z.object({
    stateModifierTx: z.object({
        from: EthereumAddress,
        to: EthereumAddress,
        data: Hash,
        value: z.coerce.bigint(),
    }),
    viewTx: z.object({
        from: EthereumAddress,
        to: EthereumAddress,
        data: Hash,
    }),
});

function bigIntToUint8Array(bigint: bigint) {
    let hex = BigInt(bigint).toString(16);
    if (hex.length % 2) {
        hex = '0' + hex;
    }
    const len = hex.length / 2;
    const u8 = new Uint8Array(len);
    let i = 0;
    while (hex.length >= 2) {
        u8[i] = parseInt(hex.substring(0, 2), 16);
        i++;
        hex = hex.substring(2, hex.length);
    }
    return u8;
}

export async function POST(request: Request) {
    const body = await request.json();
    const { stateModifierTx, viewTx } = await SimulateInput.parseAsync(body);

    const client = createPublicClient({
        chain: polygonMumbai,
        transport: http(
            // `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
            `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_API_KEY_ALCHEMY}`
        ),
    })

    const block = await client.getBlock({ blockTag: "latest" });
    const vm = await getVM(block.number, client.transport.url);

    // Execute the state-modifying transaction  
    const rlp = fromRlp(stateModifierTx.data as `0x${string}`) as `0x${string}`[];
    console.log(rlp);

    const _block = await vm.blockchain.getLatestBlock();

    const tx = LegacyTransaction.fromValuesArray([
        bigIntToUint8Array(fromHex(rlp[0], "bigint")), // nonce
        bigIntToUint8Array(fromHex(rlp[1], "bigint")), // gasPrice
        bigIntToUint8Array(fromHex(rlp[2], "bigint")), // gasLimit
        bigIntToUint8Array(fromHex(rlp[3], "bigint")), // to
        rlp[4] === "0x" ? Buffer.from([]) : bigIntToUint8Array(fromHex(rlp[4], "bigint")), // value
        bigIntToUint8Array(fromHex(rlp[5], "bigint")), // data
        bigIntToUint8Array(fromHex(rlp[6], "bigint")), // v
        bigIntToUint8Array(fromHex(rlp[7], "bigint")), // r
        bigIntToUint8Array(fromHex(rlp[8], "bigint")), // s
    ], {
        common: vm.common,
    });

    const time = performance.now();
    const blockBuilder = await vm.buildBlock({
        parentBlock: _block,
        blockOpts: {
            common: vm.common,
            calcDifficultyFromHeader: _block.header,
        },
    });

    const stateModifierReturn = await blockBuilder.addTransaction(tx);
    const buildedBlock = await blockBuilder.build();

    const receipts = blockBuilder.transactionReceipts;

    console.log("Receipts: ", receipts.length);

    console.log("Time to build block: ", performance.now() - time);

    // Execute the view transaction
    const viewReturn = await vm.evm.runCall({
        to: Address.fromString(viewTx.to),
        caller: Address.fromString(viewTx.from),
        data: hexToBytes(viewTx.data as `0x${string}`),
        block: buildedBlock,
    });

    // Return result as HEX
    return new Response(
        JSON.stringify({
            stateModifierReturn: Buffer.from(stateModifierReturn.execResult.returnValue).toString('hex'),
            viewReturn: fromHex("0x" + Buffer.from(viewReturn.execResult.returnValue).toString('hex') as `0x${string}`, "bigint").toString(),
        }),
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}