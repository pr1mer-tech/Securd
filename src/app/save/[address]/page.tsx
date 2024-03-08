"use client";
import React, { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import SaveProvider, { SaveContext } from "@/context/Save.context";
import TopPageContainer from "@/components/TopPageContainer/TopPageContainer";
import LeftArrowIcon from "../../../assets/icons/left-arrow.svg";
import { BackButtonWrapper, SaveAssetWrapper } from "./SaveAssetPage.styled";
import PageHeader from "./PageHeader/PageHeader";
import TopFirstCard from "./TopFirstCard/TopFirstCard";
import { PriorityLevel, IconPostion } from "@/utils/types/enums";
import { main } from "@/app/styles/theme.styled";
import Button from "@/components/Button/Button";
import PoolDetails from "./PoolDetails/PoolDetails";

const SaveAssetPage = () => {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <SaveProvider>
      <SaveAssetWrapper>
        <TopPageContainer
          height="35vh"
          padding="1.5rem 10rem"
          mobilePadding="4rem 1rem"
        >
          <BackButtonWrapper>
            <Button
              onClick={() => router.push("/save")}
              priority={PriorityLevel.TERTIARY}
              icon={LeftArrowIcon}
              iconPosition={IconPostion.BEFORE}
              label="Back"
              color={main.colors.securdWhite}
            />
          </BackButtonWrapper>
          <PageHeader />
          <TopFirstCard />
        </TopPageContainer>

        <PoolDetails />
      </SaveAssetWrapper>
    </SaveProvider>
  );
};

export default SaveAssetPage;
