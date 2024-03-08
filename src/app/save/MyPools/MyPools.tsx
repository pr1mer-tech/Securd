"use client";
import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import Title from "@/components/Title/Title";
import Tooltip from "@/components/Tooltip/Tooltip";
import { SaveContext } from "@/context/Save.context";
import { PriorityLevel } from "@/utils/types/enums";
import { useRouter } from "next/navigation";
import React, { useContext, useMemo, useState } from "react";
import { NoPoolMessage, ShowHideButtonWrapper } from "./MyPools.styled";
import Grid from "@/components/Grid/Grid";
import DashboardFigures from "@/components/DashboardFigures/DashboardFigures";
import AccountCard from "@/components/AccountCard/AccountCard";
import {
  toFormattedPercentage,
  toNoDecimal,
} from "@/utils/helpers/numberFormat.helpers";
import { ReserveInfo } from "@/utils/types/save.types";
import { getInterestAmount } from "@/utils/helpers/lenderDeposit.helpers";
import useGetUserTotalBalanceUSD from "@/utils/hooks/useGetUserTotalBalanceUSD";
import useGetTotalDeposit from "@/utils/hooks/useGetTotalDeposit";
import useGetTotalAverageApy from "@/utils/hooks/useGetTotalAverageApy";

const MyPools = () => {
  const [showAll, setShowAll] = useState<boolean>(false);

  const { userReservesInfo, reservesInfo } = useContext(SaveContext);

  const { totalUserBalance } = useGetUserTotalBalanceUSD(reservesInfo);
  const { totalUserDeposit } = useGetTotalDeposit(reservesInfo);

  const totalInterest = useMemo(() => {
    return getInterestAmount(totalUserBalance, totalUserDeposit);
  }, [totalUserBalance, totalUserDeposit]);

  const router = useRouter();

  const averageApy = useGetTotalAverageApy(reservesInfo);

  return (
    <>
      <Card width="100%" shadow margin="2rem 0">
        <DashboardFigures
          data={[
            {
              title: (
                <Tooltip key={0} title="BALANCE" textCentered={true}>
                  Total Savings value (Deposit+Interest) in all your accounts
                </Tooltip>
              ),
              value: `${"$" + toNoDecimal(totalUserBalance)}`,
            },
            {
              title: (
                <Tooltip key={1} title="DEPOSIT" textCentered={true}>
                  Total deposited amount in all your accounts
                </Tooltip>
              ),
              value: `${"$" + toNoDecimal(totalUserDeposit)}`,
            },
            {
              title: (
                <Tooltip key={2} title="INTEREST" textCentered={true}>
                  Total accrued interest in all your accounts
                </Tooltip>
              ),
              value: `${"$" + toNoDecimal(totalInterest)}`,
            },
            {
              title: (
                <Tooltip key={3} title="AVERAGE APY" textCentered={true}>
                  Current average yield in all your accounts
                </Tooltip>
              ),
              value: `${toFormattedPercentage(averageApy, 1)}`,
            },
          ]}
        />
      </Card>
      {userReservesInfo?.length !== 0 ? (
        <>
          <Title
            label={`My Accounts (${userReservesInfo.length})`}
            priority={3}
          />
          <Grid rowItems={3} columnGap="2rem" rowGap="2rem" margin="2rem 0 0 0">
            {userReservesInfo?.map(
              (userReserveInfo: ReserveInfo, key: number) => {
                if (key < 3) {
                  return (
                    <AccountCard
                      reserveInfo={userReserveInfo}
                      owned
                      onClick={() =>
                        router.push(`/save/${userReserveInfo.address}`)
                      }
                      key={key}
                    />
                  );
                }
              }
            )}
            {showAll && (
              <>
                {userReservesInfo?.map(
                  (userReserveInfo: ReserveInfo, key: number) => {
                    if (key > 2) {
                      return (
                        <AccountCard
                          reserveInfo={userReserveInfo}
                          owned
                          onClick={() =>
                            router.push(`/save/${userReserveInfo.address}`)
                          }
                          key={key}
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
        userReservesInfo?.length !== undefined && (
          <NoPoolMessage>
            {"Please select a Token to deposit in the list below."}
          </NoPoolMessage>
        )
      )}
      {userReservesInfo?.length > 2 && (
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

export default MyPools;
