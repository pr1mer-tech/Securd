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
  "function interestRateModel() view returns (address)",
  "function totalBorrows() view returns (uint256)",
  "function getCash() view returns (uint256)",
  "function totalReserves() view returns (uint256)",
  "function reserveFactorMantissa() view returns (uint256)",
]);

const irmAbi = parseAbi([
  "function getBorrowRate(uint256 cash, uint256 borrows, uint256 reserves) view returns (uint256)",
  "function getSupplyRate(uint256 cash, uint256 borrows, uint256 reserves, uint256 reserveFactor) view returns (uint256)",
]);

const client = createPublicClient({
  chain: xrplEvmTestnet as any,
  transport: http(),
});

async function main() {
  const sXRP = "0x6ec503Ad093B8b8B74AD9168Acb3f547C79f0318";

  const [irmAddr, borrows, cash, reserves, reserveFactor] = await Promise.all([
    client.readContract({ address: sXRP, abi: cTokenAbi, functionName: "interestRateModel" }),
    client.readContract({ address: sXRP, abi: cTokenAbi, functionName: "totalBorrows" }),
    client.readContract({ address: sXRP, abi: cTokenAbi, functionName: "getCash" }),
    client.readContract({ address: sXRP, abi: cTokenAbi, functionName: "totalReserves" }),
    client.readContract({ address: sXRP, abi: cTokenAbi, functionName: "reserveFactorMantissa" }),
  ]);

  console.log("IRM Address:", irmAddr);
  console.log("Cash:", cash.toString());
  console.log("Borrows:", borrows.toString());
  console.log("Reserves:", reserves.toString());
  console.log("Reserve Factor:", reserveFactor.toString());

  const borrowRate = await client.readContract({ 
    address: irmAddr, 
    abi: irmAbi, 
    functionName: "getBorrowRate", 
    args: [cash, borrows, reserves] 
  });
  
  const supplyRate = await client.readContract({ 
    address: irmAddr, 
    abi: irmAbi, 
    functionName: "getSupplyRate", 
    args: [cash, borrows, reserves, reserveFactor] 
  });

  console.log("Calculated Borrow Rate:", borrowRate.toString());
  console.log("Calculated Supply Rate:", supplyRate.toString());
}

main().catch(console.error);
