import { JsonRpcProvider } from "ethers";

const POLYGON_RPC_URL = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_API_KEY_ALCHEMY}`;
const POLYGON_TESTNET_RPC_URL = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_API_KEY_ALCHEMY}`;

const ARBITRUM_RPC_URL = `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_API_KEY_ALCHEMY}`;
const ARBITRUM_TESTNET_RPC_URL = `https://arb-rinkeby.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_API_KEY_ALCHEMY}`;

// Define a function to return the appropriate provider based on the network
export const getProvider = (
  network: "polygon" | "polygon_testnet" | "arbitrum" | "arbitrum_testnet"
) => {
  switch (network) {
    case "polygon":
      return new JsonRpcProvider(POLYGON_RPC_URL);
    case "polygon_testnet":
      return new JsonRpcProvider(POLYGON_TESTNET_RPC_URL);
    case "arbitrum":
      return new JsonRpcProvider(ARBITRUM_RPC_URL);
    case "arbitrum_testnet":
      return new JsonRpcProvider(ARBITRUM_TESTNET_RPC_URL);
    default:
      throw new Error("Unsupported network");
  }
};

export const getPrivateKey = async (): Promise<string> => {
  const privateKey = process.env.NEXT_PUBLIC_MANAGER_PRIVATE_KEY as string;
  return privateKey;
};
