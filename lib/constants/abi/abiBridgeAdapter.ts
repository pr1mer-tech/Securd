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
] as const;
