import type { Address } from "viem";
import { abiComptroller } from "./abi/abiComptroller";
import { abiCErc20 } from "./abi/abiCErc20";
import { abiSecurdOracle } from "./abi/abiSecurdOracle";
import { abiProxyFactory } from "./abi/abiProxyFactory";
import { abiJumpRateModel } from "./abi/abiJumpRateModel";
import { abiBridgeAdapter } from "./abi/abiBridgeAdapter";

// XRPL EVM Testnet — deployed contract addresses
export const ADDRESSES = {
  comptroller:      "0x26Cf3D5c8832D77eadF0a76d36E33a92200EE883" as Address,
  oracle:           "0x3e4B7874A46815F49eBebE598213ecEda260ca04" as Address,
  interestRateModel:"0x64ccEa09e73171EE78eb382EE89fc72150e812ab" as Address,
  proxyFactory:     "0x04a8A4b4C26a81764Bcc7610072aA8A22e165559" as Address,
  bridgeAdapter:    "0xf1CBD0f07580ff9A0961cB97758363f42D95df20" as Address,
  liquidationKeeper:"0x870A7fCF5591a20Ff64868bF9aBa740d0318FdCD" as Address,
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

export const bridgeAdapterContract = {
  address: ADDRESSES.bridgeAdapter,
  abi: abiBridgeAdapter,
} as const;
