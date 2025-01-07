// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "forge-std/Test.sol";
import {CollateralPool} from "../contracts/CollateralPool.sol";
import {AssetPriceOracle} from "../contracts/AssetPriceOracle.sol";
import {BorrowerData} from "../contracts/BorrowerData.sol";
import {LendingPool} from "../contracts/LendingPool.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "../contracts/libraries/CollateralPoolData.sol";
import "forge-std/console.sol";

contract BorrowerDataTest is Test {
    // the identifiers of the forks
    uint256 testnetFork;

    BorrowerData public borrowerData;
    LendingPool public lendingPool;

    //Access variables from .env file via vm.envString("varname")
    //Replace ALCHEMY_KEY by your alchemy key or Etherscan key, change RPC url if need
    //inside your .env file e.g:
    //MAINNET_RPC_URL = 'https://eth-mainnet.g.alchemy.com/v2/ALCHEMY_KEY'
    string TESTNET_RPC_URL = vm.envString("TESTNET_RPC_URL");

    // create two _different_ forks during setup
    function setUp() public {
        testnetFork = vm.createFork(TESTNET_RPC_URL);
    }

    // select a specific fork
    function testMaxBorrowA() public {
        // select the fork
        vm.selectFork(testnetFork);
        assertEq(vm.activeFork(), testnetFork);
        // borrowerData = new BorrowerData(
        //     payable(0x0518EbdD8dE2cEAE8eaeD1c5cd93234bA14E75d0), 
        //     payable(0x237dE63F93E9d8f35660CeE7BaeE193305a76E94), 
        //     0x917Dec829B8Bdc99d5C247cc2f2a8f91b72EFf2a,
        //     0x917Dec829B8Bdc99d5C247cc2f2a8f91b72EFf2a,
        //     0xbebbaE6f1062E4Cd5652B9d8e1B8aECBEE993A9E
        // );

        borrowerData = BorrowerData(0x81730b30849bBADC68d53e5B8E88158cBA56FFDc);

        console.log("Lending Pool", borrowerData.lendingPool());
        console.log("Collateral Pool", borrowerData.collateralPool());
        console.log("Asset Price Oracle", address(borrowerData.assetPriceOracle()));
        console.log("Price Oracle", address(borrowerData.assetPriceOracle()));
        console.log("Liquidation Threshold", address(borrowerData.liquidationThreshold()));

        address borrower_ = 0x27b4A938802b1278317eD0fC0135b6E1E14F43dC;
        address token_ = 0x271ABb28816f033eB661957A907943e288bFDf81;

        uint256 maxBorrowA_ = borrowerData.getMaxBorrowB(borrower_, token_);
        assertGe(maxBorrowA_, 10000000);
    }

    function testLendingPool() public {
        // select the fork
        vm.selectFork(testnetFork);
        assertEq(vm.activeFork(), testnetFork);
        
        lendingPool = LendingPool(0x0518EbdD8dE2cEAE8eaeD1c5cd93234bA14E75d0);
        
    }
}
