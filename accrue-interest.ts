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
  "function accrueInterest() returns (uint256)",
  "function supplyRatePerBlock() view returns (uint256)",
  "function borrowRatePerBlock() view returns (uint256)",
]);

const client = createPublicClient({
  chain: xrplEvmTestnet as any,
  transport: http(),
});

async function main() {
  const sXRP = "0x6ec503Ad093B8b8B74AD9168Acb3f547C79f0318";
  
  console.log("Simulating accrueInterest on sXRP...");
  
  try {
    const { result } = await client.simulateContract({
      address: sXRP,
      abi,
      functionName: 'accrueInterest',
    });
    console.log("accrueInterest simulation result code:", result.toString());
    
    // Check if simulation shows a non-zero rate
    const supply = await client.readContract({ address: sXRP, abi, functionName: "supplyRatePerBlock" });
    const borrow = await client.readContract({ address: sXRP, abi, functionName: "borrowRatePerBlock" });
    
    console.log("Current Supply Rate (on-chain):", supply.toString());
    console.log("Current Borrow Rate (on-chain):", borrow.toString());

  } catch (err: any) {
    console.log("accrueInterest simulation failed:", err.message);
  }
}

main().catch(console.error);
