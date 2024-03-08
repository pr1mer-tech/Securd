"use client";
import { BorrowerPool } from "@/utils/api/generated/schemas";
import {
  getPairPrice,
  getPairReservesInfos,
  getSelectedCollateralInfos,
  getTokensSymbol,
} from "@/utils/helpers/borrow.helpers";
import {
  filterSearchBorrow,
  sortByAccountsBorrow,
} from "@/utils/helpers/filters.helpers";
import useCollateralPool from "@/utils/hooks/wagmiSH/viewFunctions/farm/useCollateralPool";
import { useLendingPool } from "@/utils/hooks/wagmiSH/viewFunctions/useLendingPool";
import {
  BorrowOptions,
  FarmActionMode,
  GraphPeriod,
  LockOptions,
} from "@/utils/types/enums";
import {
  BorrowSortsProps,
  BorrowerBalances,
  CollateralInfos,
  PairReservesInfos,
  TokenPrices,
} from "@/utils/types/farm.types";
import { GraphData, ReserveInfo } from "@/utils/types/save.types";
import { useParams } from "next/navigation";
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Address } from "viem";
import { MainContext } from "./Main.context";
import { useAccount, useBalance } from "wagmi";
import useGetUserCollateralsInfos from "@/utils/hooks/useGetUserCollateralsInfos";
import useCollateralAmountPrice from "@/utils/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import usePairBorrowBalances from "@/utils/hooks/usePairBorrowBalances";
import useCollateralPrice from "@/utils/hooks/wagmiSH/viewFunctions/farm/useCollateralPrice";

type FarmContextProps = {
  activeAction: FarmActionMode;
  assetsIcons: string[];
  borrowAction: BorrowOptions;
  borrowBalances?: BorrowerBalances;
  collateralAmount?: bigint;
  collateralsInfos: CollateralInfos[];
  collateralPrice?: number;
  collateralValue?: bigint;
  farmPools: BorrowerPool[];
  interestTokenHistory: GraphData[];
  interestLPHistory: GraphData[];
  isLeverage: boolean;
  lockAction?: LockOptions;
  lpTokensSymbol?: string;
  pairReservesInfos: PairReservesInfos;
  pool: 1 | 2 | 3;
  search: string;
  reservesInfo: ReserveInfo[];
  selectedCollateralInfo?: CollateralInfos;
  selectedPeriodBorrow: GraphPeriod;
  selectedPeriodLP: GraphPeriod;
  setActiveAction: (action: FarmActionMode) => void;
  setBorrowAction: (action: BorrowOptions) => void;
  setIsLeverage: (isLeverage: boolean) => void;
  setLockAction: (action: LockOptions) => void;
  setPool: (pool: 1 | 2 | 3) => void;
  setSearch: (search: string) => void;
  setSelectedPeriodBorrow: (period: GraphPeriod) => void;
  setSelectedPeriodLP: (period: GraphPeriod) => void;
  setShowTransactionModal: (show: boolean) => void;
  setSortAccounts: (accounts: BorrowSortsProps) => void;
  setTokenSelected: (token: 0 | 1) => void;
  setTransactionAmount: (amount: number) => void;
  setTransactionEstimatedGas: (gas?: number) => void;
  showTransactionModal: boolean;
  sortAccounts: BorrowSortsProps;
  tokens: string[];
  tokenSelected: 0 | 1;
  tokensUSDPrices: TokenPrices;
  transactionAmount: number;
  transactionEstimatedGas?: number;
  userCollateralsInfos: CollateralInfos[];
  walletLpTokensBalance?: number;
};

type FarmProviderProps = {
  children: ReactNode;
};

export const FarmContext = createContext({} as FarmContextProps);

const FarmProvider: FC<FarmProviderProps> = ({ children }) => {
  const [activeAction, setActiveAction] = useState<FarmActionMode>(
    FarmActionMode.LOCK
  );
  const [farmPools, setFarmPools] = useState<BorrowerPool[]>([]);
  const [interestLPHistory] = useState<GraphData[]>([]);
  const [interestTokenHistory] = useState<GraphData[]>([]);
  const [lockAction, setLockAction] = useState<LockOptions>(LockOptions.LOCK);
  const [borrowAction, setBorrowAction] = useState<BorrowOptions>(
    BorrowOptions.BORROW
  );
  const [pool, setPool] = useState<1 | 2 | 3>(1);
  const [search, setSearch] = useState<string>("");
  const [selectedPeriodLP, setSelectedPeriodLP] = useState<GraphPeriod>(
    GraphPeriod.DAY
  );
  const [selectedPeriodBorrow, setSelectedPeriodBorrow] = useState<GraphPeriod>(
    GraphPeriod.DAY
  );
  const [sortAccounts, setSortAccounts] = useState<BorrowSortsProps>({
    apy: true,
    poolSize: false,
  });
  const [tokenSelected, setTokenSelected] = useState<0 | 1>(0);
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [transactionEstimatedGas, setTransactionEstimatedGas] =
    useState<number>();
  const [showTransactionModal, setShowTransactionModal] =
    useState<boolean>(false);
  const [isLeverage, setIsLeverage] = useState<boolean>(false);

  const { coinPrices } = useContext(MainContext);

  const { address } = useAccount();
  const { collateralsInfos } = useCollateralPool();
  const { reservesInfo } = useLendingPool();
  const { userCollateralsInfos } = useGetUserCollateralsInfos(collateralsInfos);
  const params = useParams();

  const selectedCollateralInfo = useMemo(() => {
    return getSelectedCollateralInfos(
      collateralsInfos,
      params?.address as Address
    );
  }, [collateralsInfos, params]);

  const lpTokensSymbol = useMemo(() => {
    return selectedCollateralInfo?.symbol;
  }, [selectedCollateralInfo]);

  const tokens = useMemo(() => {
    return getTokensSymbol(selectedCollateralInfo);
  }, [selectedCollateralInfo]);

  const pairReservesInfos: PairReservesInfos = useMemo(() => {
    return getPairReservesInfos(reservesInfo, tokens);
  }, [selectedCollateralInfo, tokens]);

  const tokensUSDPrices = useMemo(() => {
    return getPairPrice(coinPrices, reservesInfo, tokens);
  }, [reservesInfo, tokens, coinPrices]);

  const { data: walletLpTokens } = useBalance({
    address: address,
    token: selectedCollateralInfo?.addressLP,
    watch: true,
  });

  const walletLpTokensBalance: number = useMemo(() => {
    return Number(walletLpTokens?.formatted);
  }, [walletLpTokens]);

  const assetsIcons = useMemo(
    () => [
      pairReservesInfos.reserveInfoTokenA?.imgSrc || "",
      pairReservesInfos.reserveInfoTokenB?.imgSrc || "",
    ],
    [pairReservesInfos]
  );

  const { collateralAmount, collateralValue } = useCollateralAmountPrice(
    selectedCollateralInfo?.addressLP
  );
  const { borrowBalances } = usePairBorrowBalances(
    selectedCollateralInfo?.addressLP,
    pairReservesInfos.reserveInfoTokenA,
    pairReservesInfos.reserveInfoTokenB
  );

  const { collateralPrice } = useCollateralPrice(
    selectedCollateralInfo?.addressLP
  );

  useEffect(() => {
    let borrowDataSorted: BorrowerPool[] | undefined;
    borrowDataSorted = filterSearchBorrow(search, borrowDataSorted);
    borrowDataSorted = sortByAccountsBorrow(sortAccounts, borrowDataSorted);
    setFarmPools(borrowDataSorted || []);
  }, [search, sortAccounts]);

  return (
    <FarmContext.Provider
      value={{
        activeAction,
        assetsIcons,
        borrowAction,
        borrowBalances,
        collateralAmount,
        collateralsInfos,
        collateralPrice,
        collateralValue,
        farmPools,
        interestLPHistory,
        interestTokenHistory,
        isLeverage,
        lpTokensSymbol,
        lockAction,
        pairReservesInfos,
        pool,
        search,
        reservesInfo,
        selectedCollateralInfo,
        selectedPeriodBorrow,
        selectedPeriodLP,
        setActiveAction,
        setBorrowAction,
        setIsLeverage,
        setLockAction,
        setPool,
        setSearch,
        setSelectedPeriodLP,
        setSelectedPeriodBorrow,
        setSortAccounts,
        setShowTransactionModal,
        setTokenSelected,
        setTransactionAmount,
        setTransactionEstimatedGas,
        showTransactionModal,
        sortAccounts,
        tokens,
        tokenSelected,
        tokensUSDPrices,
        transactionAmount,
        transactionEstimatedGas,
        userCollateralsInfos,
        walletLpTokensBalance,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export default FarmProvider;
