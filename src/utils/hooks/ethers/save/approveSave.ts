import { BrowserProvider, Contract, parseUnits, toQuantity } from "ethers";
import { abiUSDT } from "@/utils/constants/abi/abi";
import { SetState } from "../utils/types";

export async function approveSave(
  depositAmount: bigint,
  assetAddress: string,
  setApproveState: SetState
) {
  setApproveState({ isLoading: true, isSuccess: false, isError: false });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const erc20Contract = new Contract(assetAddress, abiUSDT, signer);
  // Specify the gas price and gas limit
  const gasPrice = parseUnits("10", "gwei");

  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: toQuantity(80001) },
    ]);

    const allowance = await erc20Contract.allowance(
      signerAddress,
      process.env.NEXT_PUBLIC_LENDINGPOOL_CONTRACT_ADDRESS
    );

    if (allowance >= depositAmount) {
      setApproveState({ isLoading: false, isSuccess: true, isError: false });
      return;
    }

    const tx = await erc20Contract.approve(
      process.env.NEXT_PUBLIC_LENDINGPOOL_CONTRACT_ADDRESS,
      depositAmount.toString(),
      {
        gasPrice: gasPrice,
      }
    );
    await tx.wait();
    setApproveState({ isLoading: false, isSuccess: true, isError: false });
  } catch (error) {
    setApproveState({ isLoading: false, isSuccess: false, isError: true });
  }
}
