// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

import "forge-std/Script.sol";
import {LendingPool} from "../contracts/LendingPool.sol";

contract UpdateParamsScript is Script {

    function setUp() public {}

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Arguments
        LendingPool lendingPool = LendingPool(payable(0x0518EbdD8dE2cEAE8eaeD1c5cd93234bA14E75d0));
        
        lendingPool.updateModelParams(0x747cf62CA0cd7DFF0653759618aC1bDcA2eb33AB);

        vm.stopBroadcast();
    }
}