"use client";
import React from "react";
import Card from "@/components/Card/Card";
import RightPart from "./RightPart/RightPart";
import { TopCardContainer } from "./TopFirstCard.styled";
import WalletTable from "./WalletTable/WalletTable";

const TopFirstCard = () => {
  return (
    <Card shadow padding="0">
      <TopCardContainer>
        <WalletTable />
        <RightPart />
      </TopCardContainer>
    </Card>
  );
};

export default TopFirstCard;
