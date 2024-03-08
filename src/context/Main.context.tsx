import useWindowWidth from "@/utils/hooks/useWindowWidth";
import useAssetPriceOracle from "@/utils/hooks/wagmiSH/viewFunctions/useAssetPriceOracle";
import useBalanceCoins from "@/utils/hooks/wagmiSH/viewFunctions/useBalanceCoins";
import { BalanceCoins, Coins } from "@/utils/types/save.types";
import React, {
  FC,
  ReactNode,
  createContext,
  useEffect,
  useState,
} from "react";
import { useAccount } from "wagmi";

type MainContextProps = {
  isConnected: boolean;
  showPopupConnection: boolean;
  setshowPopupConnection: (show: boolean) => void;
  userAddress: `0x${string}` | undefined;
  windowWidth: number;
  coinPrices: Coins;
  balanceCoins: BalanceCoins;
  showPopupConfirmation: boolean;
  setshowPopupConfirmation: Function;
};

type MainProviderProps = {
  children: ReactNode;
};

export const MainContext = createContext({} as MainContextProps);

const MainProvider: FC<MainProviderProps> = ({ children }) => {
  const { address, isConnected: wagmiIsConnected } = useAccount();

  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<`0x${string}` | undefined>(
    undefined
  );
  const [showPopupConnection, setshowPopupConnection] =
    useState<boolean>(false);
  const [showPopupConfirmation, setshowPopupConfirmation] =
    useState<boolean>(false);
  const { windowWidth } = useWindowWidth();
  const { balanceCoins } = useBalanceCoins();

  useEffect(() => {
    setIsConnected(wagmiIsConnected);
    setUserAddress(address);
  }, [wagmiIsConnected, address]);

  const { coinPrices } = useAssetPriceOracle();

  return (
    <MainContext.Provider
      value={{
        isConnected,
        showPopupConnection,
        setshowPopupConnection,
        userAddress,
        windowWidth,
        coinPrices,
        balanceCoins,
        showPopupConfirmation,
        setshowPopupConfirmation,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export default MainProvider;
