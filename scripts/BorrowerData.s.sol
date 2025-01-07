// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

import "forge-std/Script.sol";
import {BorrowerData} from "../contracts/BorrowerData.sol";
import {CreateXScript} from "createx-forge/script/CreateXScript.sol";

contract BorrowerDataScript is Script, CreateXScript {

    function setUp() public withCreateX {}

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Arguments
        address payable lendingPool_ = payable(0x0518EbdD8dE2cEAE8eaeD1c5cd93234bA14E75d0);
        address payable collateralPool_ = payable(0x237dE63F93E9d8f35660CeE7BaeE193305a76E94);
        address assetPriceOracle_ = 0x917Dec829B8Bdc99d5C247cc2f2a8f91b72EFf2a;
        address collateralPriceOracle_ = 0x64B41253C0B4fCa4885c3dc24B7562A3B02C02Cc;
        address liquidationThreshold_ = 0xbebbaE6f1062E4Cd5652B9d8e1B8aECBEE993A9E;

        // BorrowerData implementation = new BorrowerData(
        //     lendingPool_,
        //     collateralPool_,
        //     assetPriceOracle_,
        //     collateralPriceOracle_,
        //     liquidationThreshold_
        // );

        // Prepare the initialization call for the proxy with corresponding arguments
        bytes memory implementationInitializeData = abi.encodeWithSignature(
            "initialize(address,address,address,address,address)",
            lendingPool_,
            collateralPool_,
            assetPriceOracle_,
            collateralPriceOracle_,
            liquidationThreshold_
        );


        // Prepare the salt
        bytes32 salt = bytes32(abi.encodePacked(msg.sender, hex"00", bytes11(uint88(42))));

        // Calculate the predetermined address of the contract
        address computedAddress = computeCreate3Address(salt, msg.sender);

        // Deploy using CREATE3
        address deployedAddress = create3(
            salt,
            abi.encodePacked(
                type(BorrowerData).creationCode,
                abi.encode(
                    lendingPool_,
                    collateralPool_,
                    assetPriceOracle_,
                    collateralPriceOracle_,
                    liquidationThreshold_
                )
            )
        );


        // Check to make sure that contract is on the expected address
        require(computedAddress == deployedAddress);

        vm.stopBroadcast();
    }
}