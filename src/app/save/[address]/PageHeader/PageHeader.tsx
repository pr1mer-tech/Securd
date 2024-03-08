"use client";
import React, { useContext, useEffect } from "react";
import { SaveContext } from "@/context/Save.context";
import CryptoLogo from "@/components/CryptoLogo/CryptoLogo";
import Title from "@/components/Title/Title";
import { main } from "@/app/styles/theme.styled";
import { AssetTitleWrapper, Wrapper } from "./PageHeader.styled";

const PageHeader = () => {
  const { selectedReserveInfo } = useContext(SaveContext);

  useEffect(() => {
    document.title = `Securd - Earn ${selectedReserveInfo ? "- " + selectedReserveInfo?.symbol : ""}`;
  }, [selectedReserveInfo]);
  return (
    <Wrapper>
      <Title label="Save" priority={1} color={main.colors.securdWhite} />
      <AssetTitleWrapper>
        <CryptoLogo
          crypto={selectedReserveInfo?.imgSrc || ""}
          width={30}
          height={30}
        />
        <Title
          label={selectedReserveInfo?.symbol || ""}
          priority={3}
          color={main.colors.securdWhite}
        />
      </AssetTitleWrapper>
    </Wrapper>
  );
};

export default PageHeader;
