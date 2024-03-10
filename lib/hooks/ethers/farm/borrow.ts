import { BrowserProvider, Contract, parseUnits, toQuantity } from "ethers";
import { SetState } from "../utils/types";
import { abiCollateralPool } from "@/utils/constants/abi/abiCollateralPool";

export async function borrow(
  collateralAsset: string,
  asset: string,
  borrowAmount: bigint,
  setBorrowState: SetState
) {
  setBorrowState({ isLoading: true, isSuccess: false, isError: false });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const contract = new Contract(
    process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as string,
    abiCollateralPool,
    signer
  );
  // Specify the gas price and gas limit
  const gasPrice = parseUnits("10", "gwei");

  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: toQuantity(80001) },
    ]);

    const tx = await contract.borrow(
      collateralAsset,
      asset,
      borrowAmount.toString(),
      signerAddress,
      {
        gasPrice: gasPrice,
      }
    );
    await tx.wait();
    setBorrowState({ isLoading: false, isSuccess: true, isError: false });
  } catch (error) {
    setBorrowState({ isLoading: false, isSuccess: false, isError: true });
  }
}
