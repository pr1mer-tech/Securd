"use client";
import React, { useEffect } from "react";
import { main } from "@/app/styles/theme.styled";
import Title from "@/components/Title/Title";
import { BottomPageContainer } from "./PoolDetails.styled";
// import GraphView from "./GraphView/GraphView";
import PoolCard from "./PoolCard/PoolCard";

const PoolDetails = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <BottomPageContainer mobilePadding="1rem">
      <Title
        priority={2}
        label="Pool details"
        color={main.colors.securdPrimary}
      />
      <PoolCard />
      {/* <GraphView /> */}
    </BottomPageContainer>
  );
};

export default PoolDetails;
