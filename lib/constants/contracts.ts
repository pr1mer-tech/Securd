import type { Address } from "viem";
import { abiComptroller } from "./abi/abiComptroller";
import { abiCErc20 } from "./abi/abiCErc20";
import { abiSecurdOracle } from "./abi/abiSecurdOracle";
import { abiProxyFactory } from "./abi/abiProxyFactory";
import { abiJumpRateModel } from "./abi/abiJumpRateModel";
import { abiBridgeAdapter } from "./abi/abiBridgeAdapter";

// XRPL EVM Testnet — deployed contract addresses
export const ADDRESSES = {
  comptroller:      "0x46d364257112230022E72b086Df85a6b0f8D3F86" as Address,
  oracle:           "0x517475AFaFfaE71491d9Bad598E07AAFD050Ca80" as Address,
  interestRateModel:"0xDd31C1db90AB0b094d73E0b4c8dae2296a7d8C0d" as Address,
  proxyFactory:     "0xB7f3ECe856063F48BC3bcC7A381aE875841663aA" as Address,
  bridgeAdapter:    "0x7AC8Df85448037c6fE1eD5732c6ca71060069237" as Address,
  liquidationKeeper:"0xF87Bda7207B629789abaaCcef366Ba853BA11399" as Address,
} as const;

export const comptrollerContract = {
  address: ADDRESSES.comptroller,
  abi: abiComptroller,
} as const;

export const oracleContract = {
  address: ADDRESSES.oracle,
  abi: abiSecurdOracle,
} as const;

export const proxyFactoryContract = {
  address: ADDRESSES.proxyFactory,
  abi: abiProxyFactory,
} as const;

export const interestRateModelContract = {
  address: ADDRESSES.interestRateModel,
  abi: abiJumpRateModel,
} as const;

export function cTokenContract(address: Address) {
  return { address, abi: abiCErc20 } as const;
}

// Per-market interest rate model — markets may use separate IRM instances,
// so the address is resolved at runtime via cToken.interestRateModel().
export function irmContract(address: Address) {
  return { address, abi: abiJumpRateModel } as const;
}

export const bridgeAdapterContract = {
  address: ADDRESSES.bridgeAdapter,
  abi: abiBridgeAdapter,
} as const;
