import { Contract, Wallet, parseEther } from "ethers";
import { connectWalletWithAdjustedGas } from "./utils/gasPrice";
import { getPrivateKey, getProvider } from "./utils/providerManager";
import { Address } from "viem";
import { abiUSDT } from "../constants/abi/abi";
import axios from "axios";

// Method to Initialize and Return a Signer
async function initializeSigner(): Promise<Wallet> {
  const privateKey = await getPrivateKey();
  const wallet = new Wallet(privateKey);
  const provider = getProvider("polygon_testnet");
  return await connectWalletWithAdjustedGas(provider, wallet);
}

export const sendTestnetTokens = async (userAddress: Address) => {
  // Determine the base URL based on environment
  const baseUrl = `${window.location.protocol}//${window.location.host}`;

  // Check if address is already in whitelist
  try {
    const whitelistResponse = await axios.get(
      `${baseUrl}/api/postgres/loadTable?tableName=whitelist`
    );
    const whitelist = whitelistResponse.data;

    if (whitelist.includes(userAddress)) {
      // eslint-disable-next-line no-console
      console.log("Address already whitelisted, skipping token transfer.");
      return;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching whitelist:", error);
    return;
  }

  const amountUSDT = parseEther("10000");
  const amountUSDC = parseEther("10000");
  const amountDAI = parseEther("10000");
  const amountWBTC = parseEther("1000");
  const amountLP = parseEther("1000");

  try {
    await transfer(
      process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS as string,
      abiUSDT,
      userAddress,
      amountUSDT
    );
    await transfer(
      process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as string,
      abiUSDT,
      userAddress,
      amountUSDC
    );
    await transfer(
      process.env.NEXT_PUBLIC_DAI_CONTRACT_ADDRESS as string,
      abiUSDT,
      userAddress,
      amountDAI
    );
    await transfer(
      process.env.NEXT_PUBLIC_WBTC_CONTRACT_ADDRESS as string,
      abiUSDT,
      userAddress,
      amountWBTC
    );
    await transfer(
      process.env.NEXT_PUBLIC_LPUSDC_USDT_CONTRACT_ADDRESS as string,
      abiUSDT,
      userAddress,
      amountLP
    );
    // eslint-disable-next-line no-console
    console.log("All tokens transferred successfully");

    // Add user address to whitelist
    await axios.post(`${baseUrl}/api/postgres/addAddress`, {
      tableName: "whitelist",
      address: userAddress,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error with token transactions:", error);
  }
};

const transfer = async (
  tokenAddress: string,
  tokenAbi: any,
  userAddress: Address,
  amount: BigInt
) => {
  const signer = await initializeSigner();
  const contract = new Contract(tokenAddress, tokenAbi, signer);

  try {
    const tx = await contract.transfer(userAddress, amount);
    await tx.wait();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error transferring tokens for ${tokenAddress} :`, error);
  }
};
