"use client";
import React, { useContext } from "react";
import CryptoSerie from "@/components/CryptoSerie/CryptoSerie";
import DexLink from "@/components/DexLink/DexLink";
import TableText from "@/components/TableText/TableText";
import Title from "@/components/Title/Title";
import { MainContext } from "@/context/Main.context";
import UniswapLogo from "@//assets/logos/Uniswap-logo.svg";
import { RightItems, Wrapper } from "./PageHeader.styled";
import { TableTextType } from "@/utils/types/enums";
import { FarmContext } from "@/context/Farm.context";
import { main } from "@/app/styles/theme.styled";

const PageHeader = () => {
  const { windowWidth } = useContext(MainContext);
  const { assetsIcons, lpTokensSymbol } = useContext(FarmContext);

  return (
    <Wrapper>
      <Title label="Farm" priority={1} color={main.colors.securdWhite} />
      <RightItems>
        {windowWidth > 800 && <CryptoSerie cryptos={assetsIcons || ["", ""]} />}
        <TableText
          type={TableTextType.EMPHASIS}
          label={lpTokensSymbol || "--"}
        />
        <DexLink label="Uniswap v2" to={"#"} icon={UniswapLogo} />
      </RightItems>
    </Wrapper>
  );
};

export default PageHeader;
