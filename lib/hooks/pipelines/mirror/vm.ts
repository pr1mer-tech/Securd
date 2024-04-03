import { Chain, Hardfork, Common, CustomChain } from "@nomicfoundation/ethereumjs-common";

import { VM } from '@nomicfoundation/ethereumjs-vm';
import { HttpProvider } from "@/hardhat-core/src/internal/core/providers/http";
import { JsonRpcClient } from "@/hardhat-core/src/internal/hardhat-network/jsonrpc/client";
import { ForkBlockchain } from "@/hardhat-core/src/internal/hardhat-network/provider/fork/ForkBlockchain";
import { ForkStateManager } from "@/hardhat-core/src/internal/hardhat-network/provider/fork/ForkStateManager";

export async function getVM(
    forkBlockNumber = 14379250n,
    mainnetForkRpc = "https://eth.pr1mer.tech/v1/mainnet",
    activatePrecompiles = true,
) {
    const common = Common.custom({ chainId: 80001 }, { hardfork: Hardfork.Cancun });

    const httpProvider = new HttpProvider(mainnetForkRpc, "mainnet");

    // last arg is disk cache path
    console.log(`forkBlockNumber: ${forkBlockNumber.toString(10)}`);
    const rpc = new JsonRpcClient(httpProvider, 80001, forkBlockNumber, 2n);
    const fork = new ForkBlockchain(rpc, forkBlockNumber, common);
    const vmOptions = {
        common,
        activatePrecompiles,
        blockchain: fork,
        stateManager: new ForkStateManager(rpc, forkBlockNumber),
    };

    return await VM.create(vmOptions);
}