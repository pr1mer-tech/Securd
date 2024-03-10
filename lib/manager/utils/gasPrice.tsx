import { ethers } from "ethers";

const getAdjustedGasPrice = async (provider: any): Promise<BigInt> => {
  const feeData = await provider.getFeeData();
  // Perform calculation using BigInt on the gasPrice property
  return (BigInt(feeData.gasPrice) * BigInt("110")) / BigInt("100");
};

export const connectWalletWithAdjustedGas = async (
  provider: any,
  wallet: ethers.Wallet
): Promise<ethers.Wallet> => {
  const adjustedGasPrice = await getAdjustedGasPrice(provider);
  const walletConnected = wallet.connect(provider);

  // Override signer.sendTransaction for gas adjustment
  const originalSendTransaction = walletConnected.sendTransaction;
  walletConnected.sendTransaction = async (transaction) => {
    // Convert the BigInt to a string for gasPrice
    transaction.gasPrice = adjustedGasPrice.toString();

    return originalSendTransaction.call(walletConnected, transaction);
  };

  return walletConnected;
};
