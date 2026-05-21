import { createPublicClient, http, parseAbi } from 'viem';

const xrplEvmTestnet = {
  id: 1449000,
  name: "XRPL EVM Testnet",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.xrplevm.org"] },
    public: { http: ["https://rpc.testnet.xrplevm.org"] },
  },
};

const irmAbi = parseAbi([
  "function owner() view returns (address)",
]);

const client = createPublicClient({
  chain: xrplEvmTestnet as any,
  transport: http(),
});

async function main() {
  const irmAddr = "0xDd31C1db90AB0b094d73E0b4c8dae2296a7d8C0d";
  try {
    const owner = await client.readContract({ address: irmAddr, abi: irmAbi, functionName: "owner" });
    console.log("IRM Owner:", owner);
  } catch (err: any) {
    console.log("Could not fetch owner:", err.message);
  }
}

main().catch(console.error);
