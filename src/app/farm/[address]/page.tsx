"use client";
import React, { useEffect } from "react";
import {
  BackButtonWrapper,
  BorrowAssetPageWrapper,
} from "./FarmAssetPage.styled";
import TopPageContainer from "@/components/TopPageContainer/TopPageContainer";
import Button from "@/components/Button/Button";
import { useRouter } from "next/navigation";
import { IconPostion, PriorityLevel } from "@/utils/types/enums";
import { main } from "@/app/styles/theme.styled";
import LeftArrowIcon from "@/assets/icons/left-arrow.svg";
import PageHeader from "./PageHeader/PageHeader";
import BottomFarmAsset from "./BottomFramAssetPage/BottomFarmAsset";
import PageTop from "./PageTop/PageTop";
import FarmProvider from "@/context/Farm.context";

const FarmAssetPage = () => {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <FarmProvider>
      <BorrowAssetPageWrapper>
        <TopPageContainer
          height="35vh"
          padding="1.5rem 10rem"
          mobilePadding="4rem 1rem"
        >
          <BackButtonWrapper>
            <Button
              onClick={() => router.push("/farm")}
              priority={PriorityLevel.TERTIARY}
              icon={LeftArrowIcon}
              iconPosition={IconPostion.BEFORE}
              label="Back"
              color={main.colors.securdWhite}
            />
          </BackButtonWrapper>
          <PageHeader />
          <PageTop />
        </TopPageContainer>

        <BottomFarmAsset />
      </BorrowAssetPageWrapper>
    </FarmProvider>
  );
};

export default FarmAssetPage;
