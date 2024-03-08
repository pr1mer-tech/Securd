"use client";
import React, { useContext } from "react";
import { useRouter } from "next/navigation";
import AccountCard from "@/components/AccountCard/AccountCard";
import Grid from "@/components/Grid/Grid";
import { SaveContext } from "@/context/Save.context";
import { ReserveInfo } from "@/utils/types/save.types";
import { getDepositBalance, getSavingApy } from "@/utils/helpers/lenderPool.helpers";

const GridView = () => {
  const router = useRouter();

  const { reservesInfo, sortAccounts, search } = useContext(SaveContext);

  return (
    <div data-test-id="save-grid-view">
      {
        <Grid rowItems={4} rowGap="1rem" columnGap="2rem" margin="2rem 0">
          {reservesInfo?.map((reserveInfo: ReserveInfo) => {
            const poolAPY = getSavingApy(reserveInfo);
            const depositBalance = getDepositBalance(reserveInfo);

            return {
              poolAPY,
              depositBalance,
              reserveInfo,
            };
          })
            .filter((data) => {
              return data.reserveInfo.symbol
                .toLowerCase()
                .includes(search.toLowerCase());
            })
            .toSorted((a, b) => {
              if (sortAccounts.apy) {
                return (b.poolAPY ?? 0) - (a.poolAPY ?? 0);
              }
              return (b.depositBalance ?? 0) - (a.depositBalance ?? 0);
            })
            .map(({
              poolAPY,
              reserveInfo
            }, key: number) => (
              <AccountCard
                reserveInfo={reserveInfo}
                poolAPY={poolAPY}
                key={key}
                onClick={() => router.push(`/save/${reserveInfo.address}`)}
                owned={false}
              />
            ))}
        </Grid>
      }
    </div>
  );
};

export default GridView;
