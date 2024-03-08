import { BrowserProvider, Contract, parseUnits, toQuantity } from "ethers";
import { SetState } from "../utils/types";
import { abiCollateralPool } from "@/utils/constants/abi/abiCollateralPool";

export async function supplyFarm(
  depositAmount: bigint,
  assetAddress: string,
  setSupplyState: SetState,
  setApproveState: SetState
) {
  setSupplyState({ isLoading: true, isSuccess: false, isError: false });

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

    const tx = await contract.supply(
      assetAddress,
      depositAmount.toString(),
      signerAddress,
      {
        gasPrice: gasPrice,
      }
    );
    await tx.wait();
    setSupplyState({ isLoading: false, isSuccess: true, isError: false });
    // reset approval state
    setApproveState({ isLoading: false, isSuccess: false, isError: false });
  } catch (error) {
    setSupplyState({ isLoading: false, isSuccess: false, isError: true });
  }
}
