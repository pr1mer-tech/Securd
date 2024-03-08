"use client";

import React, { useContext, useState } from "react";

import { FarmContext } from "@/context/Farm.context";
import Title from "@/components/Title/Title";
import Grid from "@/components/Grid/Grid";
import {
  NoPoolMessage,
  ShowHideButtonWrapper,
} from "@/app/save/MyPools/MyPools.styled";
import { useRouter } from "next/navigation";
import PairAccountCard from "./PairAccountCard/PairAccountCard";
import Button from "@/components/Button/Button";
import { PriorityLevel } from "@/utils/types/enums";
import TopFiguresCard from "./TopFiguresCard/TopFiguresCard";
import { CollateralInfos } from "@/utils/types/farm.types";

const MyFarmPairs = () => {
  const [showAll, setShowAll] = useState<boolean>(false);
  const { farmPools, userCollateralsInfos } = useContext(FarmContext);

  const router = useRouter();

  return (
    <>
      <TopFiguresCard />
      {userCollateralsInfos?.length !== 0 ? (
        <>
          <Title
            label={`My Accounts (${userCollateralsInfos?.length || "--"})`}
            priority={3}
          />
          <Grid rowItems={3} columnGap="2rem" rowGap="2rem" margin="2rem 0 0 0">
            {userCollateralsInfos?.map(
              (collateralInfos: CollateralInfos, key: number) => {
                if (key < 3 && collateralInfos) {
                  return (
                    <>
                      <PairAccountCard
                        key={key}
                        onClick={() =>
                          router.push(`/farm/${collateralInfos?.addressLP}`)
                        }
                        collateralInfos={collateralInfos}
                      />
                    </>
                  );
                }
              }
            )}
            {showAll && (
              <>
                {userCollateralsInfos?.map(
                  (collateralInfos: CollateralInfos, key: number) => {
                    if (key > 2 && collateralInfos) {
                      return (
                        <PairAccountCard
                          key={key}
                          onClick={() =>
                            router.push(`/farm/${collateralInfos?.addressLP}`)
                          }
                          collateralInfos={collateralInfos}
                        />
                      );
                    }
                  }
                )}
              </>
            )}
          </Grid>
        </>
      ) : (
        farmPools?.length !== undefined && (
          <NoPoolMessage>
            Please select a LP Token to lock in the list below.
          </NoPoolMessage>
        )
      )}
      {farmPools.length > 2 && (
        <ShowHideButtonWrapper>
          <Button
            priority={PriorityLevel.TERTIARY}
            label={showAll ? "Hide" : "Show all"}
            onClick={() => setShowAll(!showAll)}
            fontWeight={700}
            underlined
          />
        </ShowHideButtonWrapper>
      )}
    </>
  );
};

export default MyFarmPairs;
