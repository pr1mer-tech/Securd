"use client";
import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  LenderDeposit,
  LenderPool,
  UserLenderPools,
} from "@/utils/api/generated/schemas";
import {
  GraphData,
  SaveSortsProps,
  ReserveInfo,
} from "@/utils/types/save.types";
import { useLendingPool } from "@/utils/hooks/wagmiSH/viewFunctions/useLendingPool";
import { MainContext } from "./Main.context";
import { ActionMode, GraphPeriod } from "@/utils/types/enums";
import useGetUserReservesInfo from "@/utils/hooks/useGetUserReservesInfo";
import { useParams } from "next/navigation";
import { getSelectedReserveInfo } from "@/utils/helpers/lenderDeposit.helpers";
import { Address } from "viem";

type SaveContextProps = {
  actionMode: ActionMode;
  balancePct: number;
  userAddress: `0x${string}` | undefined;
  interestHistory: GraphData[];
  lenderPools: LenderPool[] | undefined;
  lenderPoolsUser: LenderPool[] | undefined;
  pool: LenderPool | undefined;
  selectedPeriod: GraphPeriod;
  setBalancePct: (pct: number) => void;
  setSelectedPeriod: (period: GraphPeriod) => void;
  setPool: (pool: LenderPool) => void;
  search: string;
  setSortAccounts: (accounts: SaveSortsProps) => void;
  setSearch: (search: string) => void;
  sortAccounts: SaveSortsProps;
  setUserBalance: (balance: number) => void;
  setUserBalanceData: (data: LenderDeposit) => void;
  setShowTransactionModal: (showTransaction: boolean) => void;
  setActionMode: (mode: ActionMode) => void;
  setTransactionAmount: (amount: number) => void;
  showSaveTransactionModal: boolean;
  transactionAmount: number;
  userBalance: number | undefined;
  userBalanceData: LenderDeposit | undefined;
  userLenderPools: UserLenderPools[];
  reservesInfo: ReserveInfo[];
  userReservesInfo: ReserveInfo[];
  selectedReserveInfo: ReserveInfo | undefined;
  params: Record<string, string | string[]> | null;
};

type SaveProviderProps = {
  children: ReactNode;
};

export const SaveContext = createContext({} as SaveContextProps);

const SaveProvider = ({ children }: SaveProviderProps) => {
  const { userAddress } = useContext(MainContext);

  const [actionMode, setActionMode] = useState<ActionMode>(ActionMode.DEPOSIT);
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [balancePct, setBalancePct] = useState<number>(0);
  const [interestHistory] = useState<GraphData[]>([]);
  const [lenderPools] = useState<LenderPool[]>();
  const [lenderPoolsUser] = useState<LenderPool[]>();
  const [pool, setPool] = useState<LenderPool>();
  const [search, setSearch] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<GraphPeriod>(
    GraphPeriod.DAY
  );
  const [sortAccounts, setSortAccounts] = useState<SaveSortsProps>({
    apy: true,
    poolSize: false,
  });
  const [userBalance, setUserBalance] = useState<number>();
  const [userBalanceData, setUserBalanceData] = useState<LenderDeposit>();
  const [showSaveTransactionModal, setShowTransactionModal] =
    useState<boolean>(false);
  const { reservesInfo } = useLendingPool();

  const userLenderPools: UserLenderPools[] = [];

  const { userReservesInfo } = useGetUserReservesInfo();

  const params = useParams();
  const selectedReserveInfo = useMemo(() => {
    return getSelectedReserveInfo(reservesInfo, params?.address as Address);
  }, [reservesInfo, params]);

  return (
    <SaveContext.Provider
      value={{
        actionMode,
        balancePct,
        userAddress,
        interestHistory,
        lenderPools,
        lenderPoolsUser,
        pool,
        setPool,
        search,
        selectedPeriod,
        setBalancePct,
        setSelectedPeriod,
        setSearch,
        setSortAccounts,
        setUserBalance,
        setUserBalanceData,
        setShowTransactionModal,
        setActionMode,
        showSaveTransactionModal,
        sortAccounts,
        setTransactionAmount,
        transactionAmount,
        userBalance,
        userBalanceData,
        userLenderPools,
        reservesInfo,
        userReservesInfo,
        selectedReserveInfo,
        params,
      }}
    >
      {children}
    </SaveContext.Provider>
  );
};

export default SaveProvider;
