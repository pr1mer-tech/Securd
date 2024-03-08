import React, { useContext, useMemo, useState } from "react";
import WalletIcon from "@/assets/icons/wallet-icon.svg";
import { ConnectWalletWrapper } from "./ConnectWalletButton.styled";
import WalletDetailPopup from "./WalletDetailPopup/WalletDetailPopup";
import { formatAddress } from "@/utils/helpers/main.helpers";
import Button from "../Button/Button";
import { PriorityLevel, IconPostion } from "@/utils/types/enums";
import { MainContext } from "@/context/Main.context";
import useClickOutside from "@/utils/hooks/useClickOutside";

const ConnectWalletButton: React.FC = () => {
  const [showWalletPopup, setShowWalletPopup] = useState<boolean>(false);
  const {
    userAddress,
    isConnected,
    showPopupConnection,
    setshowPopupConnection,
  } = useContext(MainContext);

  const formattedAddress = useMemo(
    () => formatAddress(userAddress),
    [userAddress]
  );

  const { ref } = useClickOutside(showWalletPopup, setShowWalletPopup);

  return (
    <>
      <ConnectWalletWrapper ref={ref}>
        <Button
          label={isConnected ? formattedAddress : "Connect Wallet"}
          onClick={() => {
            !isConnected
              ? setshowPopupConnection(!showPopupConnection)
              : setShowWalletPopup((prev: boolean) => !prev);
          }}
          priority={PriorityLevel.PRIMARY}
          icon={isConnected ? WalletIcon : undefined}
          iconPosition={IconPostion.BEFORE}
          height="35px"
          width="180px"
        />
        {isConnected ? showWalletPopup && <WalletDetailPopup /> : ""}
      </ConnectWalletWrapper>
    </>
  );
};

export default ConnectWalletButton;
