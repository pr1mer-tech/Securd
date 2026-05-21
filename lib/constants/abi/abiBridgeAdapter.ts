export const abiBridgeAdapter = [
  {
    name: "nextNonceByXrplAccount",
    type: "function",
    inputs: [{ name: "xrplAccount", type: "bytes32" }],
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "view",
  },
  {
    name: "intentSignerOfXrplAccount",
    type: "function",
    inputs: [{ name: "xrplAccount", type: "bytes32" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    name: "marketConfigOf",
    type: "function",
    inputs: [{ name: "market", type: "address" }],
    outputs: [
      { name: "underlying", type: "address" },
      { name: "tokenId", type: "bytes32" },
      { name: "listed", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    name: "trustedItsSource",
    type: "function",
    inputs: [{ name: "key", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    name: "trustedGmpSource",
    type: "function",
    inputs: [{ name: "key", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    name: "setIntentSigner",
    type: "function",
    inputs: [
      { name: "xrplAccount", type: "bytes32" },
      { name: "signer", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "setTrustedItsSource",
    type: "function",
    inputs: [
      { name: "sourceChain", type: "string" },
      { name: "sourceAddress", type: "bytes" },
      { name: "trusted", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "setTrustedGmpSource",
    type: "function",
    inputs: [
      { name: "sourceChain", type: "string" },
      { name: "sourceAddress", type: "string" },
      { name: "trusted", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
