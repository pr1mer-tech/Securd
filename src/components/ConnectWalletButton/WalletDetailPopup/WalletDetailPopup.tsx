import React, { useContext, useMemo } from "react";
import { copyToClipboard, formatAddress } from "@/utils/helpers/main.helpers";
import CopyIcon from "@/assets/icons/copy-icon.svg";
import LinkOutIcon from "@/assets/icons/link-out-icon.svg";
import {
  WalletDetailWrapper,
  DetailSection,
  NetworkWrapper,
  Network,
  SmallTitle,
  DisconnectButton,
  ButtonWrapper,
  SwitchWalletButton,
} from "./WalletDetailPopup.styled";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useNetwork } from "wagmi";
import { disconnect } from "@wagmi/core";
import { MainContext } from "@/context/Main.context";

const WalletDetailPopup = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { userAddress } = useContext(MainContext);

  const { chain } = useNetwork();

  const formattedAddress = useMemo(
    () => formatAddress(userAddress),
    [userAddress]
  );

  const { setshowPopupConnection } = useContext(MainContext);

  const handleSwitchWallet = async () => {
    await disconnect();
    setshowPopupConnection(true);
  };

  return (
    <WalletDetailWrapper>
      <DetailSection onClick={() => copyToClipboard(userAddress || "")}>
        {formattedAddress}
        <Image alt="copy icon" src={CopyIcon} />
      </DetailSection>
      <DetailSection
        href={` https://mumbai.polygonscan.com/address/${userAddress}`}
        target="_blank"
      >
        View on explorer
        <Image alt="link out" src={LinkOutIcon} />
      </DetailSection>
      <NetworkWrapper>
        <SmallTitle>Network</SmallTitle>
        <Network>
          <div />
          {chain?.name}
        </Network>
      </NetworkWrapper>
      <ButtonWrapper>
        <SwitchWalletButton onClick={handleSwitchWallet}>
          Switch wallet
        </SwitchWalletButton>
        <DisconnectButton
          onClick={() => {
            disconnect();
            router.push(pathname?.includes(`save`) ? `/save` : `/farm`);
          }}
        >
          Disconnect
        </DisconnectButton>
      </ButtonWrapper>
    </WalletDetailWrapper>
  );
};

export default WalletDetailPopup;
