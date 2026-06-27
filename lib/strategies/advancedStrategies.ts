export type StrategyPoolId = "xrp-usdc" | "xrp-army";
export type StrategyMode = "leverage" | "delta-neutral";

export type StrategyPool = {
  id: StrategyPoolId;
  label: string;
  collateralFactor: number;
  lpCurrency: string;
  lpIssuer: string;
  wrappedLpToken: string;
  secondAssetSymbol: string;
  secondAssetIssuer: string;
  estimatedLoopGasXrp: { min: number; max: number };
};

export type StrategyPlanInput = {
  poolId: StrategyPoolId;
  mode: StrategyMode;
  startingEquityUSD: number;
  loopCount: number;
  xrpPriceUSD: number;
  targetSafetyBufferPct: number;
  rebalanceTriggerPct: number;
};

export type StrategyPlan = {
  pool: StrategyPool;
  mode: StrategyMode;
  maxLeverage: number;
  targetLeverage: number;
  collateralUSD: number;
  debtUSD: number;
  incrementalBorrowUSD: number[];
  xrpBorrowUSD: number;
  pairedAssetBorrowUSD: number;
  hedgeTargetXrp: number;
  minGasXrp: number;
  maxGasXrp: number;
  signatureCount: number;
  capturedMaxLeveragePct: number;
  warnings: string[];
  steps: StrategyStep[];
  executionReadiness: StrategyExecutionReadiness;
  failurePlaybook: StrategyFailurePlaybookStep[];
};

export type StrategyStep = {
  label: string;
  network: string;
  action: string;
};

export type StrategyControlStatus = "covered" | "partial" | "blocked";

export type StrategyExecutionControl = {
  id: string;
  label: string;
  status: StrategyControlStatus;
  severity: "critical" | "high" | "medium";
  detail: string;
  requiredBeforeExecution: boolean;
};

export type StrategyExecutionReadiness = {
  canExecute: boolean;
  statusLabel: string;
  blockingControlCount: number;
  controls: StrategyExecutionControl[];
};

export type StrategyFailurePlaybookStep = {
  phase: string;
  stopSignal: string;
  exposure: string;
  unwindAction: string;
};

export const STRATEGY_MAINNET = {
  xrplLedger: "XRPL Ledger mainnet",
  xrplEvm: "XRPL EVM mainnet",
  xrplEvmChainId: 1440000,
  axelarRoute: "Axelar mainnet GMP / ITS",
} as const;

export const STRATEGY_POOLS: StrategyPool[] = [
  {
    id: "xrp-usdc",
    label: "XRP / USDC LP",
    collateralFactor: 0.57,
    lpCurrency: "03B20F3A7D26D33C6DA3503E5CCE3E67B102D4D2",
    lpIssuer: "rM7cHVPfhe9yxQNk2kDNBEQqoQmMcQGPWE",
    wrappedLpToken: "0xbAF2e0ef5D0dD17646F85129892E40fAA8065f53",
    secondAssetSymbol: "USDC",
    secondAssetIssuer: "rGm7WCVp9gb4jZHWTEtGUr4dd74z2XuWhE",
    estimatedLoopGasXrp: { min: 5, max: 10 },
  },
  {
    id: "xrp-army",
    label: "XRP / ARMY LP",
    collateralFactor: 0.35,
    lpCurrency: "037C2A57B0011520DE389E332043EC0FAF858ACE",
    lpIssuer: "rnsRq5ahgbFeRiAgBVvFTafyAgiS9x9Ztn",
    wrappedLpToken: "0xD66b43e8a145e3b9e2d7e0F12f28255CB647Db7e",
    secondAssetSymbol: "ARMY",
    secondAssetIssuer: "rGG3wQ4kUzd7Jnmk1n5NWPZjjut62kCBfC",
    estimatedLoopGasXrp: { min: 5, max: 10 },
  },
];

export const DEFAULT_STRATEGY_INPUT: StrategyPlanInput = {
  poolId: "xrp-usdc",
  mode: "leverage",
  startingEquityUSD: 1000,
  loopCount: 4,
  xrpPriceUSD: 0.5,
  targetSafetyBufferPct: 15,
  rebalanceTriggerPct: 3,
};

export function buildStrategyPlan(input: StrategyPlanInput): StrategyPlan {
  const pool = getStrategyPool(input.poolId);
  const loopCount = clampInteger(input.loopCount, 0, 6);
  const startingEquityUSD = nonNegativeNumber(input.startingEquityUSD);
  const xrpPriceUSD = nonNegativeNumber(input.xrpPriceUSD);
  const safetyBufferPct = clampNumber(input.targetSafetyBufferPct, 0, 50);
  const rebalanceTriggerPct = clampNumber(input.rebalanceTriggerPct, 1, 20);
  const safetyBuffer = safetyBufferPct / 100;
  const effectiveCollateralFactor = pool.collateralFactor * Math.max(0, 1 - safetyBuffer);
  const targetLeverage = leverageAfterLoops(effectiveCollateralFactor, loopCount);
  const maxLeverage = 1 / (1 - pool.collateralFactor);
  const collateralUSD = startingEquityUSD * targetLeverage;
  const debtUSD = Math.max(0, collateralUSD - startingEquityUSD);
  const incrementalBorrowUSD = Array.from({ length: loopCount }, (_, index) =>
    startingEquityUSD * effectiveCollateralFactor ** (index + 1),
  );
  const xrpBorrowUSD = debtUSD / 2;
  const pairedAssetBorrowUSD = debtUSD / 2;
  const hedgeTargetXrp =
    input.mode === "delta-neutral" && xrpPriceUSD > 0
      ? (collateralUSD / 2) / xrpPriceUSD
      : 0;
  const minGasXrp = loopCount * pool.estimatedLoopGasXrp.min;
  const maxGasXrp = loopCount * pool.estimatedLoopGasXrp.max;
  const signatureCount =
    input.mode === "delta-neutral"
      ? 3 + loopCount * 5
      : 1 + loopCount * 5;
  const capturedMaxLeveragePct =
    maxLeverage > 1
      ? ((targetLeverage - 1) / (maxLeverage - 1)) * 100
      : 0;

  return {
    pool,
    mode: input.mode,
    maxLeverage,
    targetLeverage,
    collateralUSD,
    debtUSD,
    incrementalBorrowUSD,
    xrpBorrowUSD,
    pairedAssetBorrowUSD,
    hedgeTargetXrp,
    minGasXrp,
    maxGasXrp,
    signatureCount,
    capturedMaxLeveragePct,
    warnings: buildWarnings({
      input,
      pool,
      startingEquityUSD,
      xrpPriceUSD,
      safetyBufferPct,
      rebalanceTriggerPct,
      loopCount,
      capturedMaxLeveragePct,
    }),
    steps: buildSteps(pool, input.mode, loopCount),
    executionReadiness: buildExecutionReadiness(),
    failurePlaybook: buildFailurePlaybook(input.mode),
  };
}

export function leverageAfterLoops(collateralFactor: number, loops: number): number {
  if (loops <= 0) return 1;
  if (collateralFactor <= 0) return 1;
  if (collateralFactor >= 1) return Number.POSITIVE_INFINITY;
  return (1 - collateralFactor ** (loops + 1)) / (1 - collateralFactor);
}

function getStrategyPool(poolId: StrategyPoolId): StrategyPool {
  const pool = STRATEGY_POOLS.find((candidate) => candidate.id === poolId);
  if (pool) return pool;
  return STRATEGY_POOLS[0]!;
}

function buildWarnings(params: {
  input: StrategyPlanInput;
  pool: StrategyPool;
  startingEquityUSD: number;
  xrpPriceUSD: number;
  safetyBufferPct: number;
  rebalanceTriggerPct: number;
  loopCount: number;
  capturedMaxLeveragePct: number;
}): string[] {
  const warnings: string[] = [];

  if (params.startingEquityUSD < 500) {
    warnings.push("Position size is below the recommended minimum for multi-leg relay costs.");
  }
  if (params.loopCount > 4) {
    warnings.push("Loops above 4 usually add cost faster than useful leverage.");
  }
  if (params.safetyBufferPct < 10) {
    warnings.push("Safety buffer below 10% leaves little room for relay latency and oracle drift.");
  }
  if (params.input.mode === "delta-neutral" && params.rebalanceTriggerPct > 5) {
    warnings.push("Delta-neutral rebalance trigger above 5% can leave meaningful gamma exposure.");
  }
  if (params.input.mode === "delta-neutral" && params.xrpPriceUSD <= 0) {
    warnings.push("Delta-neutral hedge sizing requires a positive XRP price.");
  }
  if (params.capturedMaxLeveragePct > 96) {
    warnings.push("Target captures nearly all theoretical leverage; execution latency risk is elevated.");
  }

  warnings.push("Execution must wait for each Axelar leg to finish before signing the next nonce.");
  warnings.push("LP-token ITS legs should pre-fund Add Gas instead of waiting for stuck transfers.");
  warnings.push("Mainnet only: block execution on testnet wallets, testnet RPCs, or unlisted chain IDs.");

  return warnings;
}

function buildSteps(
  pool: StrategyPool,
  mode: StrategyMode,
  loopCount: number,
): StrategyStep[] {
  const steps: StrategyStep[] = [
    {
      label: "Supply LP collateral",
      network: `${STRATEGY_MAINNET.xrplEvm} (${STRATEGY_MAINNET.xrplEvmChainId}) via Axelar`,
      action: `Bridge and supply ${pool.label} LP tokens to Securd.`,
    },
    {
      label: "Enable collateral",
      network: `${STRATEGY_MAINNET.xrplEvm} (${STRATEGY_MAINNET.xrplEvmChainId}) via Axelar`,
      action: "Submit ENTER_MARKET once for the LP market.",
    },
  ];

  for (let i = 1; i <= loopCount; i += 1) {
    steps.push(
      {
        label: `Loop ${i}: borrow XRP`,
        network: `${STRATEGY_MAINNET.xrplEvm} (${STRATEGY_MAINNET.xrplEvmChainId}) via Axelar`,
        action: "Submit BORROW intent for the XRP half of the loop.",
      },
      {
        label: `Loop ${i}: borrow ${pool.secondAssetSymbol}`,
        network: `${STRATEGY_MAINNET.xrplEvm} (${STRATEGY_MAINNET.xrplEvmChainId}) via Axelar`,
        action: `Submit BORROW intent for the ${pool.secondAssetSymbol} half of the loop.`,
      },
      {
        label: `Loop ${i}: add liquidity`,
        network: STRATEGY_MAINNET.xrplLedger,
        action: "Submit AMMDeposit with tfTwoAsset using the latest amm_info ratio.",
      },
      {
        label: `Loop ${i}: re-supply LP`,
        network: `${STRATEGY_MAINNET.xrplEvm} (${STRATEGY_MAINNET.xrplEvmChainId}) via Axelar`,
        action: "Bridge newly minted LP tokens back to Securd with Add Gas.",
      },
    );
  }

  if (mode === "delta-neutral") {
    steps.push(
      {
        label: "Open XRP hedge",
        network: `${STRATEGY_MAINNET.xrplEvm} (${STRATEGY_MAINNET.xrplEvmChainId}) via Axelar`,
        action: "Borrow the target XRP hedge amount against LP collateral.",
      },
      {
        label: "Sell borrowed XRP",
        network: STRATEGY_MAINNET.xrplLedger,
        action: `Swap borrowed XRP into ${pool.secondAssetSymbol} through the native AMM/DEX.`,
      },
      {
        label: "Monitor rebalance",
        network: STRATEGY_MAINNET.xrplLedger,
        action: "Recompute f*x from amm_info and rebalance when drift crosses the trigger.",
      },
    );
  }

  return steps;
}

function buildExecutionReadiness(): StrategyExecutionReadiness {
  const controls: StrategyExecutionControl[] = [
    {
      id: "mainnet-routing",
      label: "Mainnet routing and contracts",
      status: "blocked",
      severity: "critical",
      requiredBeforeExecution: true,
      detail:
        "The shared intent stack is still configured for XRPL EVM testnet addresses, chain 1449000 signing, and testnet Axelar/XRPL links. Advanced strategies must use verified XRPL EVM mainnet chain 1440000 contracts and mainnet Axelar routes.",
    },
    {
      id: "fresh-amm-data",
      label: "Fresh AMM reserve data",
      status: "blocked",
      severity: "critical",
      requiredBeforeExecution: true,
      detail:
        "Each AMMDeposit and hedge rebalance needs live XRPL amm_info for reserves, LP supply, trading fee, and the user's LP share immediately before signing.",
    },
    {
      id: "oracle-freshness",
      label: "Oracle freshness and circuit breakers",
      status: "blocked",
      severity: "critical",
      requiredBeforeExecution: true,
      detail:
        "The executor must reject stale, circuit-broken, or missing prices for XRP, the paired asset, and wrapped LP collateral before every borrow, supply, and unwind step.",
    },
    {
      id: "add-gas-policy",
      label: "Add Gas policy",
      status: "partial",
      severity: "high",
      requiredBeforeExecution: true,
      detail:
        "Single ITS payments already include fixed gas, but the strategy executor still needs per-leg mainnet gas quotes and automatic Add Gas for LP-token ITS transfers that stall.",
    },
    {
      id: "nonce-sequencer",
      label: "Sequential nonce executor",
      status: "partial",
      severity: "high",
      requiredBeforeExecution: true,
      detail:
        "The app blocks one pending intent today. A strategy needs a persisted state machine that waits for Axelar completion before building the next nonce and resumes safely after refresh.",
    },
    {
      id: "session-authorization",
      label: "Session or multisign authorization",
      status: "blocked",
      severity: "high",
      requiredBeforeExecution: true,
      detail:
        "Manual signing across many legs is unsafe. Production execution should use constrained session permissions or multisign with per-step limits and expiry.",
    },
    {
      id: "unwind-playbooks",
      label: "Automated unwind playbooks",
      status: "blocked",
      severity: "critical",
      requiredBeforeExecution: true,
      detail:
        "Every partial-fill phase needs a deterministic stop and unwind action before live execution, including stuck bridge legs, AMM slippage, and hedge sale failures.",
    },
  ];
  const blockingControlCount = controls.filter(
    (control) => control.requiredBeforeExecution && control.status !== "covered",
  ).length;

  return {
    canExecute: blockingControlCount === 0,
    statusLabel:
      blockingControlCount === 0
        ? "Ready for controlled execution"
        : "Execution blocked by production controls",
    blockingControlCount,
    controls,
  };
}

function buildFailurePlaybook(mode: StrategyMode): StrategyFailurePlaybookStep[] {
  const playbook: StrategyFailurePlaybookStep[] = [
    {
      phase: "Preflight",
      stopSignal: "AMM data, oracle price, contract address, or chain ID is stale or missing.",
      exposure: "No new protocol exposure yet.",
      unwindAction: "Do not sign. Refresh mainnet data and rebuild the full plan.",
    },
    {
      phase: "After one borrow leg",
      stopSignal: "The matching borrow leg or XRPL asset delivery fails.",
      exposure: "One-sided debt creates directional and liquidation risk.",
      unwindAction: "Stop the loop and repay the completed borrow leg before signing another borrow.",
    },
    {
      phase: "After both borrow legs",
      stopSignal: "AMMDeposit quote moves outside slippage or reserve-ratio bounds.",
      exposure: "Debt is live, but no new LP collateral has been supplied.",
      unwindAction: "Repay both borrowed legs or rebuild the AMMDeposit from fresh amm_info.",
    },
    {
      phase: "After AMMDeposit",
      stopSignal: "LP bridge or supply leg is delayed, under-gassed, or rejected.",
      exposure: "Borrow debt is live while new LP collateral is not yet counted by Securd.",
      unwindAction: "Add Gas immediately; if still delayed, stop new loops and monitor health factor.",
    },
    {
      phase: "Relay timeout",
      stopSignal: "Axelar confirmation or destination execution does not finish inside the timeout.",
      exposure: "State may be partially complete on one chain.",
      unwindAction: "Freeze the sequencer, reconcile on-chain state, then resume or unwind from the last confirmed step.",
    },
  ];

  if (mode === "delta-neutral") {
    playbook.push({
      phase: "Delta hedge",
      stopSignal: "Borrowed XRP cannot be sold within slippage or liquidity bounds.",
      exposure: "The position is long LP XRP exposure and additionally short borrowed XRP.",
      unwindAction: "Repay the hedge borrow or retry the sale with fresh XRPL AMM/DEX liquidity data.",
    });
  }

  return playbook;
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function nonNegativeNumber(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}
