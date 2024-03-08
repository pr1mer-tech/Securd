export const abiCollateralPool = [
  {
    inputs: [
      {
        internalType: "address",
        name: "admin_",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "lendingPool_",
        type: "address",
      },
      {
        internalType: "address",
        name: "assetPriceOracle_",
        type: "address",
      },
      {
        internalType: "address",
        name: "collateralPriceOracle_",
        type: "address",
      },
      {
        internalType: "address",
        name: "liquidationThreshold_",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "nbAssets",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "router",
            type: "address",
          },
          {
            internalType: "address",
            name: "wETH",
            type: "address",
          },
          {
            internalType: "address[]",
            name: "assets",
            type: "address[]",
          },
        ],
        indexed: false,
        internalType: "struct CollateralPool.TokenInfo",
        name: "tokenInfo_",
        type: "tuple",
      },
    ],
    name: "AddLPToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller_",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "asset_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "Borrow",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller_",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "Deleverage",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller_",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "Leverage",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "asset_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to_",
        type: "address",
      },
    ],
    name: "Repay",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "to_",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "Supply",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller_",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "borrower_",
        type: "address",
      },
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
    ],
    name: "CheckLoanCondition",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_VALUE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "liquidationPremuim_",
        type: "uint256",
      },
    ],
    name: "UpdateLiquidationPremuim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "balancedLoanThreshold",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "unBalancedLoanThreshold",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "buffer",
            type: "uint256",
          },
        ],
        internalType: "struct CollateralPool.LiquidationThresholdInfo",
        name: "liquidationThresholdInfo_",
        type: "tuple",
      },
    ],
    name: "UpdateLiquidationThresholdInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        internalType: "bool",
        name: "state_",
        type: "bool",
      },
    ],
    name: "UpdateTokenState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "nbAssets",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "router",
            type: "address",
          },
          {
            internalType: "address",
            name: "wETH",
            type: "address",
          },
          {
            internalType: "address[]",
            name: "assets",
            type: "address[]",
          },
        ],
        internalType: "struct CollateralPool.TokenInfo",
        name: "tokenInfo_",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "balancedLoanThreshold",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "unBalancedLoanThreshold",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "buffer",
            type: "uint256",
          },
        ],
        internalType: "struct CollateralPool.LiquidationThresholdInfo",
        name: "liquidationThresholdInfo_",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "liquidationPremuim_",
        type: "uint256",
      },
    ],
    name: "addLPToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "assetPriceOracle",
    outputs: [
      {
        internalType: "contract AssetPriceOracle",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        internalType: "address",
        name: "asset_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "borrowerBalances",
    outputs: [
      {
        internalType: "uint256",
        name: "collateral",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "debt0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "debt1",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "collateralInfos",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "nbAssets",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "router",
            type: "address",
          },
          {
            internalType: "address",
            name: "wETH",
            type: "address",
          },
          {
            internalType: "address[]",
            name: "assets",
            type: "address[]",
          },
        ],
        internalType: "struct CollateralPool.TokenInfo",
        name: "tokenInfo",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "balancedLoanThreshold",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "unBalancedLoanThreshold",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "buffer",
            type: "uint256",
          },
        ],
        internalType: "struct CollateralPool.LiquidationThresholdInfo",
        name: "liquidationThresholdInfo",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "liquidationPremuim",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActivated",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "collateralPriceOracle",
    outputs: [
      {
        internalType: "contract CollateralPriceOracle",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "deleverage",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "getAmounts",
    outputs: [
      {
        internalType: "uint256",
        name: "amount0_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1_",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "borrower_",
        type: "address",
      },
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
    ],
    name: "getCollateralFactor",
    outputs: [
      {
        internalType: "uint256",
        name: "value_",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "borrower_",
        type: "address",
      },
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
    ],
    name: "getCollateralValue",
    outputs: [
      {
        internalType: "uint256",
        name: "value_",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "borrower_",
        type: "address",
      },
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
    ],
    name: "getLeverageFactor",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "borrower_",
        type: "address",
      },
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
    ],
    name: "getLoanValue",
    outputs: [
      {
        internalType: "uint256",
        name: "loan0_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "loan1_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalLoan_",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "borrower_",
        type: "address",
      },
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
    ],
    name: "getMaxLeverageFactor",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "address",
            name: "borrower",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount0",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount1",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "direction",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "direction0",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "direction1",
            type: "bool",
          },
        ],
        internalType: "struct CollateralPool.DataIn",
        name: "dataIn_",
        type: "tuple",
      },
    ],
    name: "getPositionData",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "collateral",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "collateralValue",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "debt0",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "debtValue0",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "debt1",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "debtValue1",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "collateralFactor",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "liquidationFactor",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "leverageFactor",
            type: "uint256",
          },
        ],
        internalType: "struct CollateralPool.DataOut",
        name: "data_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "borrower_",
        type: "address",
      },
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
    ],
    name: "isLiquidablePosition",
    outputs: [
      {
        internalType: "bool",
        name: "isLiquidable_",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "liquidationThreshold_",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lendingPool",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
    ],
    name: "leverage",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidationThreshold",
    outputs: [
      {
        internalType: "contract LiquidationThreshold",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        internalType: "address",
        name: "asset_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
    ],
    name: "repay",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to_",
        type: "address",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;
