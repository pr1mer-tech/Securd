import * as wagmi from "wagmi";
export function useAccount(parameters?: wagmi.UseAccountParameters<wagmi.Config> | undefined): wagmi.UseAccountReturnType<wagmi.Config> {
    const account = wagmi.useAccount(parameters);
    return account;
}
