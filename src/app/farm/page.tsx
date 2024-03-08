"use client";
import React, { useContext } from "react";
import { FarmPageWrapper } from "./FarmPage.styled";
import PageHeader from "./PageHeader/PageHeader";
import ConnectWalletCard from "../save/ConnectWalletCard/ConnectWalletCard";
import MyFarmPairs from "./MyFarmPairs/MyFarmPairs";
import { MainContext } from "@/context/Main.context";
import Template from "./Template/Template";
import FarmProvider from "@/context/Farm.context";

const FarmPage = () => {
  const { isConnected } = useContext(MainContext);

  return (
    <FarmProvider>
      <Template>
        <FarmPageWrapper>
          <PageHeader />
          {isConnected ? (
            <MyFarmPairs />
          ) : (
            <ConnectWalletCard
              title="Start Farming"
              subtitle="Connect your wallet to start saving today"
            />
          )}
        </FarmPageWrapper>
      </Template>
    </FarmProvider>
  );
};

export default FarmPage;
