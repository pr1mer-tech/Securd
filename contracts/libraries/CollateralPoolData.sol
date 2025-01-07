// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

 uint256 constant MAX_VALUE = type(uint256).max;

    struct TokenInfo {
        uint256 nbAssets;
        address router;
        address wETH;
        address[] assets;
    }

    struct LiquidationThresholdInfo {
        uint256 balancedLoanThreshold_0;
        uint256 unBalancedLoanThreshold_0;
        uint256 balancedLoanThreshold_b;
        uint256 unBalancedLoanThreshold_b;

    }

    struct CollateralInfo {
        TokenInfo tokenInfo;
        LiquidationThresholdInfo liquidationThresholdInfo;
        uint256 liquidationPremuim;
        bool isActivated;
    }

    struct BorrowerBalance {
        uint256 collateral;
        uint256 debt0;
        uint256 debt1;
    }

    struct DataIn {
        address token; 
        address borrower; 
        uint256 amount;
        uint256 amount0; 
        uint256 amount1; 
        bool direction; 
        bool direction0;
        bool direction1;
    }

    struct DataOut {
        uint256 collateral;
        uint256 collateralValue;
        uint256 debt0;
        uint256 debtValue0;
        uint256 debt1;
        uint256 debtValue1;
        uint256 collateralFactor;
        uint256 liquidationFactor;
        uint256 leverageFactor;
    }
library CollateralPoolData {}
