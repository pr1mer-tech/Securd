"use client";
import React, { useContext } from "react";
import { BottomPageContainer, PoolButtons } from "./BottomFarmAsset.styled";
import Title from "@/components/Title/Title";
import { main } from "@/app/styles/theme.styled";
import NavigationButton from "@/components/NavigationButton/NavigationButton";

import { MainContext } from "@/context/Main.context";
import { FarmContext } from "@/context/Farm.context";
import TopCard from "./TopCard/TopCard";

const BottomFarmAsset = () => {
  const { windowWidth } = useContext(MainContext);
  const { pool, setPool, selectedCollateralInfo, tokens } =
    useContext(FarmContext);

  return (
    <BottomPageContainer>
      <Title
        priority={2}
        label="Pool details"
        color={main.colors.securdPrimary}
      />
      <PoolButtons>
        <NavigationButton
          active={pool === 1}
          color={
            pool === 1 ? main.colors.securdPrimary : main.colors.securdGrey
          }
          defaultOutlined
          fontSize={windowWidth < 600 ? "14px" : undefined}
          label={selectedCollateralInfo?.symbol}
          onClick={() => setPool(1)}
          outline
          padding="1rem 0"
          width={windowWidth > 600 ? "175px" : "auto"}
        />
        <NavigationButton
          active={pool === 2}
          color={
            pool === 2 ? main.colors.securdPrimary : main.colors.securdGrey
          }
          defaultOutlined
          fontSize={windowWidth < 600 ? "14px" : undefined}
          label={
            windowWidth > 600 ? `Pool ${tokens[0] || "--"}` : tokens[0] || "--"
          }
          onClick={() => setPool(2)}
          outline
          padding="1rem 0"
          width={windowWidth > 600 ? "175px" : "auto"}
        />
        <NavigationButton
          active={pool === 3}
          color={
            pool === 3 ? main.colors.securdPrimary : main.colors.securdGrey
          }
          defaultOutlined
          fontSize={windowWidth < 600 ? "14px" : undefined}
          label={
            windowWidth > 600 ? `Pool ${tokens[1] || "--"}` : tokens[1] || "--"
          }
          onClick={() => setPool(3)}
          outline
          padding="1rem 0"
          width={windowWidth > 600 ? "175px" : "auto"}
        />
      </PoolButtons>

      <TopCard />
      {/* <GraphTable /> */}
    </BottomPageContainer>
  );
};

export default BottomFarmAsset;
