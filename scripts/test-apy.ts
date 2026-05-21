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

const abi = parseAbi([
  "function supplyRatePerBlock() view returns (uint256)",
  "function borrowRatePerBlock() view returns (uint256)",
]);

const client = createPublicClient({
  chain: xrplEvmTestnet as any,
  transport: http(),
});

async function main() {
  const sXRP = "0x6ec503Ad093B8b8B74AD9168Acb3f547C79f0318";
  const sSTST = "0x2F874D87E685EC28be749B781dc99119F27CF0be";

  console.log("Fetching rates...");
  
  const [sXRP_supply, sXRP_borrow] = await Promise.all([
    client.readContract({ address: sXRP, abi, functionName: "supplyRatePerBlock" }),
    client.readContract({ address: sXRP, abi, functionName: "borrowRatePerBlock" }),
  ]);

  const [sSTST_supply, sSTST_borrow] = await Promise.all([
    client.readContract({ address: sSTST, abi, functionName: "supplyRatePerBlock" }),
    client.readContract({ address: sSTST, abi, functionName: "borrowRatePerBlock" }),
  ]);

  console.log("sXRP Supply Rate:", sXRP_supply.toString());
  console.log("sXRP Borrow Rate:", sXRP_borrow.toString());
  console.log("sSTST Supply Rate:", sSTST_supply.toString());
  console.log("sSTST Borrow Rate:", sSTST_borrow.toString());

  const BLOCKS_PER_YEAR = 9014400n;
  const MANTISSA = 10n ** 18n;

  const calc = (rate: bigint) => Number((rate * BLOCKS_PER_YEAR * 1000000n) / MANTISSA) / 10000;

  console.log("sXRP Supply APY:", calc(sXRP_supply));
  console.log("sXRP Borrow APY:", calc(sXRP_borrow));
  console.log("sSTST Supply APY:", calc(sSTST_supply));
  console.log("sSTST Borrow APY:", calc(sSTST_borrow));
}

main().catch(console.error);
