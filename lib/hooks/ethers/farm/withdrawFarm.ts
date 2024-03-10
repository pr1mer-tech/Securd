import { BrowserProvider, Contract, parseUnits, toQuantity } from "ethers";
import { SetState } from "../utils/types";
import { abiCollateralPool } from "@/utils/constants/abi/abiCollateralPool";

export async function withdrawFarm(
  withdrawAmount: bigint,
  assetAddress: string,
  setWithdrawState: SetState
) {
  setWithdrawState({ isLoading: true, isSuccess: false, isError: false });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const contract = new Contract(
    process.env.NEXT_PUBLIC_COLLATERALPOOL_CONTRACT_ADDRESS as string,
    abiCollateralPool,
    signer
  );

  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: toQuantity(80001) },
    ]);

    const tx = await contract.withdraw(
      assetAddress,
      withdrawAmount.toString(),
      signerAddress
    );
    await tx.wait();
    setWithdrawState({ isLoading: false, isSuccess: true, isError: false });
  } catch (error) {
    setWithdrawState({ isLoading: false, isSuccess: false, isError: true });
  }
}
