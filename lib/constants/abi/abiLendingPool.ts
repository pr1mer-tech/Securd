export const abiLendingPool = [
  {
    inputs: [
      {
        internalType: "address",
        name: "admin_",
        type: "address"
      },
      {
        internalType: "address",
        name: "dDeployer_",
        type: "address"
      },
      {
        internalType: "address",
        name: "lDeployer_",
        type: "address"
      },
      {
        internalType: "address",
        name: "interestRate_",
        type: "address"
      },
      {
        internalType: "address",
        name: "tokenPrice_",
        type: "address"
      },
      {
        internalType: "address",
        name: "treasury_",
        type: "address"
      }
    ],
    stateMutability: "payable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "dToken_",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "lToken_",
        type: "address"
      }
    ],
    name: "AddAsset",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "Paused",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32"
      }
    ],
    name: "RoleAdminChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleGranted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "RoleRevoked",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "assetAmount_",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "dTokenAmount",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "to_",
        type: "address"
      }
    ],
    name: "Supply",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "Unpaused",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "token_",
        type: "address"
      },
      {
        indexed: false,
        internalType: "bool",
        name: "state_",
        type: "bool"
      }
    ],
    name: "UpdateCollateral",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minValue_",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxValue_",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "optimalUtilizationRate_",
        type: "uint256"
      }
    ],
    name: "UpdateInterestRateParams",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "utilizationRate_",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "interestRate_",
        type: "uint256"
      }
    ],
    name: "UpdateModelParams",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "reserveFee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "flashLoanFee",
            type: "uint256"
          }
        ],
        indexed: false,
        internalType: "struct LendingPool.Fee",
        name: "fee_",
        type: "tuple"
      }
    ],
    name: "UpdateProtocoleFee",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "supplyCap_",
        type: "uint256"
      }
    ],
    name: "UpdateSupplyCap",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "assetAmount_",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "dTokenAmount_",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "to_",
        type: "address"
      }
    ],
    name: "Withdraw",
    type: "event"
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "supplyCap_",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "reserveFee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "flashLoanFee",
            type: "uint256"
          }
        ],
        internalType: "struct LendingPool.Fee",
        name: "fee_",
        type: "tuple"
      },
      {
        internalType: "uint256",
        name: "minValue_",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxValue_",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "initialInterestRate_",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "optimalUtilizationRate_",
        type: "uint256"
      }
    ],
    name: "addAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        internalType: "address",
        name: "lender_",
        type: "address"
      }
    ],
    name: "getLenderSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      }
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256"
      }
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      }
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      }
    ],
    name: "getTokenPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "lTokenPrice_",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "dTokenPrice_",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address"
      },
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amountLToken_",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amountAsset_",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "to_",
        type: "address"
      },
      {
        internalType: "bool",
        name: "direction_",
        type: "bool"
      }
    ],
    name: "mintOrBurnLToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "reserveInfos",
    outputs: [
      {
        internalType: "uint256",
        name: "supplyCap",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "supply",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "debt",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "reserveFee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "flashLoanFee",
            type: "uint256"
          }
        ],
        internalType: "struct LendingPool.Fee",
        name: "fee",
        type: "tuple"
      },
      {
        internalType: "uint256",
        name: "lastBlock",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "lastTime",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "isActivated",
        type: "bool"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "minValue",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "maxValue",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "optimalUtilizationRate",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "utilizationRate",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "interestRate",
            type: "uint256"
          }
        ],
        internalType: "struct LendingPool.InterestRateInfo",
        name: "interestRateInfo",
        type: "tuple"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "dTokenPrice",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "lTokenPrice",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "dToken",
            type: "address"
          },
          {
            internalType: "address",
            name: "lToken",
            type: "address"
          }
        ],
        internalType: "struct LendingPool.TokenInfo",
        name: "tokenInfo",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32"
      },
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address"
      },
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "to_",
        type: "address"
      }
    ],
    name: "sendAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "to_",
        type: "address"
      }
    ],
    name: "supply",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4"
      }
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        internalType: "bool",
        name: "state_",
        type: "bool"
      }
    ],
    name: "updateAssetState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        internalType: "address[]",
        name: "tokens_",
        type: "address[]"
      },
      {
        internalType: "bool",
        name: "state_",
        type: "bool"
      }
    ],
    name: "updateCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "collateralPool_",
        type: "address"
      },
      {
        internalType: "bool",
        name: "state_",
        type: "bool"
      }
    ],
    name: "updateCollateralPools",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "reserveFee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "flashLoanFee",
            type: "uint256"
          }
        ],
        internalType: "struct LendingPool.Fee",
        name: "fee_",
        type: "tuple"
      }
    ],
    name: "updateFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "minValue_",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "maxValue_",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "optimalUtilizationRate_",
        type: "uint256"
      }
    ],
    name: "updateInterestRateParams",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      }
    ],
    name: "updateModelParams",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "supplyCap_",
        type: "uint256"
      }
    ],
    name: "updateSupplyCap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount_",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "to_",
        type: "address"
      }
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    stateMutability: "payable",
    type: "receive"
  }
] as const;
