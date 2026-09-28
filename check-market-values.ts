import { createPublicClient, http, parseAbi, formatEther } from 'viem';

const xrplEvmTestnet = {
  id: 1449000,
  name: "XRPL EVM Testnet",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.xrplevm.org"] },
    public: { http: ["https://rpc.testnet.xrplevm.org"] },
  },
};

const cTokenAbi = parseAbi([
  "function supplyRatePerBlock() view returns (uint256)",
  "function borrowRatePerBlock() view returns (uint256)",
  "function totalBorrows() view returns (uint256)",
  "function getCash() view returns (uint256)",
]);

const client = createPublicClient({
  chain: xrplEvmTestnet as any,
  transport: http(),
});

async function main() {
  const markets = [
    { name: "sXRP", address: "0x6ec503Ad093B8b8B74AD9168Acb3f547C79f0318" },
    { name: "sSTST", address: "0x2F874D87E685EC28be749B781dc99119F27CF0be" }
  ];

  for (const market of markets) {
    const supplyRate = await client.readContract({ address: market.address as "0x", abi: cTokenAbi, functionName: "supplyRatePerBlock" });
    const borrowRate = await client.readContract({ address: market.address as "0x", abi: cTokenAbi, functionName: "borrowRatePerBlock" });
    const totalBorrows = await client.readContract({ address: market.address as "0x", abi: cTokenAbi, functionName: "totalBorrows" });
    const cash = await client.readContract({ address: market.address as "0x", abi: cTokenAbi, functionName: "getCash" });

    console.log("--- " + market.name + " ---");
    console.log("Supply Rate:", supplyRate.toString());
    console.log("Borrow Rate:", borrowRate.toString());
    console.log("Total Borrows:", formatEther(totalBorrows));
    console.log("Cash:", formatEther(cash));
  }
}

main().catch(console.error);
