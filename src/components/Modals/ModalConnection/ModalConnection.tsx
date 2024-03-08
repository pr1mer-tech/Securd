"use client";
import React, { FC, useContext } from "react";
import Modal from "../../Modal/Modal";
import MetaMaskLogo from "../../../assets/logos/walletLogos/MetaMaskLogo.svg";
import CoinbaseLogo from "../../../assets/logos/walletLogos/coinbase-wallet-logo.svg";
import WalletConnectLogo from "../../../assets/logos/walletLogos/wallet-connect-logo.svg";

import Image from "next/image";
import { useConnect, useAccount } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import {
  WalletButton,
  WalletButtonsWrapper,
  WrapperModalConnection,
} from "./ModalConnection.styled";
import { MainContext } from "@/context/Main.context";
import { sendTestnetTokens } from "@/utils/manager/manager";

type ModalConnectionProps = {};

const ModalConnection: FC<ModalConnectionProps> = () => {
  const { address } = useAccount();
  const { showPopupConnection, setshowPopupConnection } =
    useContext(MainContext);
  const { connect, connectors, isLoading, pendingConnector } = useConnect({
    chainId: polygonMumbai.id,
    onSuccess() {
      setshowPopupConnection(false);
      // Send testnet tokens if eligible
      sendTestnetTokens(address!);
    },
  });

  return (
    <>
      {showPopupConnection && (
        <Modal
          showModal={showPopupConnection}
          setShowModal={setshowPopupConnection}
          title="Choose Wallet"
        >
          <WrapperModalConnection>
            <WalletButtonsWrapper>
              {connectors.map((connector) => (
                <WalletButton
                  disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => connect({ connector })}
                >
                  {connector.name === "MetaMask" ? (
                    <Image alt="MetaMaskLogo logo" src={MetaMaskLogo} />
                  ) : connector.name === "Coinbase Wallet" ? (
                    <Image alt="CoinbaseLogo logo" src={CoinbaseLogo} />
                  ) : (
                    <Image
                      alt="WalletConnectLogo logo"
                      src={WalletConnectLogo}
                    />
                  )}
                  {connector.name}
                  {!connector.ready && " (unsupported)"}
                  {isLoading &&
                    connector.id === pendingConnector?.id &&
                    " (connecting)"}
                </WalletButton>
              ))}
            </WalletButtonsWrapper>
          </WrapperModalConnection>
        </Modal>
      )}
    </>
  );
};

export default ModalConnection;
