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
]);

const irmAbi = parseAbi([
  "function baseRatePerBlock() view returns (uint256)",
  "function multiplierPerBlock() view returns (uint256)",
  "function jumpMultiplierPerBlock() view returns (uint256)",
  "function kink() view returns (uint256)",
  "function blocksPerYear() view returns (uint256)",
]);

const client = createPublicClient({
  chain: xrplEvmTestnet as any,
  transport: http(),
});

async function main() {
  const sXRP = "0x6ec503Ad093B8b8B74AD9168Acb3f547C79f0318";

  const irmAddr = await client.readContract({ address: sXRP, abi: cTokenAbi, functionName: "interestRateModel" });
  console.log("IRM Address:", irmAddr);

  const [base, mult, jump, kink, blocks] = await Promise.all([
    client.readContract({ address: irmAddr, abi: irmAbi, functionName: "baseRatePerBlock" }),
    client.readContract({ address: irmAddr, abi: irmAbi, functionName: "multiplierPerBlock" }),
    client.readContract({ address: irmAddr, abi: irmAbi, functionName: "jumpMultiplierPerBlock" }),
    client.readContract({ address: irmAddr, abi: irmAbi, functionName: "kink" }),
    client.readContract({ address: irmAddr, abi: irmAbi, functionName: "blocksPerYear" }),
  ]);

  console.log("Base Rate Per Block:", base.toString());
  console.log("Multiplier Per Block:", mult.toString());
  console.log("Jump Multiplier Per Block:", jump.toString());
  console.log("Kink:", formatEther(kink));
  console.log("Blocks Per Year:", blocks.toString());

  const [borrows, cash, reserves] = await Promise.all([
    client.readContract({ address: sXRP, abi: cTokenAbi, functionName: "totalBorrows" }),
    client.readContract({ address: sXRP, abi: cTokenAbi, functionName: "getCash" }),
    client.readContract({ address: sXRP, abi: cTokenAbi, functionName: "totalReserves" }),
  ]);

  console.log("Total Borrows:", formatEther(borrows));
  console.log("Cash:", formatEther(cash));
  console.log("Reserves:", formatEther(reserves));
}

main().catch(console.error);
