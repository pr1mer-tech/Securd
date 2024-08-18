import * as wagmi from "wagmi";
import type {
  GetBalanceData,
} from '@wagmi/core/query'
export function useBalance<
  config extends wagmi.Config = wagmi.ResolvedRegister['config'],
  selectData = GetBalanceData
>(
  parameters: wagmi.UseBalanceParameters<config, selectData> = {},
): wagmi.UseBalanceReturnType<selectData> {
    const balance = wagmi.useBalance(parameters);
    return balance;
}
