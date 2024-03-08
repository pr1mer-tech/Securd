"use client";
import React, { useContext } from "react";
import ConnectWalletCard from "./ConnectWalletCard/ConnectWalletCard";
import MyPools from "./MyPools/MyPools";
import PageHeader from "./PageHeader/PageHeader";
import { SavePageWrapper } from "./SavePage.styled";
import { MainContext } from "@/context/Main.context";
import Template from "./Template/Template";

const SavePage = () => {
  const { isConnected } = useContext(MainContext);

  return (
    <Template>
      <SavePageWrapper>
        <PageHeader />
        {isConnected ? (
          <MyPools />
        ) : (
          <ConnectWalletCard
            title="Start Saving"
            subtitle="Connect your wallet to start saving today"
          />
        )}
      </SavePageWrapper>
    </Template>
  );
};

export default SavePage;
