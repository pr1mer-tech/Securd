"use client";
import React, { useContext, useState } from "react";
import { Collapse } from "react-collapse";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import ChevronDown from "@/assets/icons/chevron-down-white.svg";
import ConnectWalletButton from "@/components/ConnectWalletButton/ConnectWalletButton";
import NavigationButton from "@/components/NavigationButton/NavigationButton";
import {
  MenuWrapper,
  ChevronButton,
  WalletButtonsWrapper,
  DisconnectButton,
} from "./MobileHeaderMenu.styled";
import { useRouter } from "next/navigation";
import { main } from "@/app/styles/theme.styled";
import Image from "next/image";
import { disconnect } from "@wagmi/core";
import { MainContext } from "@/context/Main.context";

const MobileHeaderMenu = () => {
  const [showDisconnect, setShowDisconnect] = useState<boolean>(false);
  const { isConnected } = useContext(MainContext);
  const router = useRouter();

  return (
    <MenuWrapper data-test-id="header-mobile-menu">
      <NavigationButton
        active={false}
        outline={false}
        label="Save"
        color={main.colors.securdWhite}
        height="40px"
        width="100%"
        textAlign="left"
        onClick={() => router.push("/save")}
      />
      <NavigationButton
        active={false}
        outline={false}
        label="Farm"
        color={main.colors.securdWhite}
        height="40px"
        width="100%"
        textAlign="left"
        onClick={() => router.push("/borrow")}
      />
      <WalletButtonsWrapper>
        <ConnectWalletButton />
        <ChevronButton
          className={isConnected ? "" : "hidden"}
          onClick={() => setShowDisconnect(!showDisconnect)}
        >
          <Image
            alt="chevron"
            src={showDisconnect ? ChevronDown : ChevronRight}
          />
        </ChevronButton>
      </WalletButtonsWrapper>
      <Collapse isOpened={showDisconnect}>
        <DisconnectButton onClick={disconnect}>
          Disconnect wallet
        </DisconnectButton>
      </Collapse>
    </MenuWrapper>
  );
};

export default MobileHeaderMenu;
