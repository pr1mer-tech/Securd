import React, { useContext, useMemo } from "react";
import {
  toFormattedPercentage,
  toNoDecimal,
} from "@/utils/helpers/numberFormat.helpers";
import Tooltip from "@/components/Tooltip/Tooltip";
import Card from "@/components/Card/Card";
import DashboardFigures from "@/components/DashboardFigures/DashboardFigures";
import useGetFarmTotalBalance from "@/utils/hooks/useGetFarmTotalBalance";
import { FarmContext } from "@/context/Farm.context";
import useFarmTotalLoan from "@/utils/hooks/useFarmTotalLoan";

const TopFiguresCard = () => {
  const { userCollateralsInfos, reservesInfo } = useContext(FarmContext);

  const { totalUserFarmBalance } = useGetFarmTotalBalance(userCollateralsInfos);
  const { farmTotalLoan } = useFarmTotalLoan(
    userCollateralsInfos,
    reservesInfo
  );

  const totalApy = useMemo(() => {
    return 0;
  }, []);

  const accountBalanceUSD = useMemo(() => {
    return totalUserFarmBalance - farmTotalLoan;
  }, [totalUserFarmBalance, farmTotalLoan]);

  return (
    <Card width="auto" shadow margin="2rem 0">
      <DashboardFigures
        data={[
          {
            title: (
              <Tooltip key={0} title="BALANCE" textCentered={true}>
                Total value of locked assets backing your loans in all your
                accounts
              </Tooltip>
            ),
            value: `$ ${toNoDecimal(accountBalanceUSD)}`,
          },
          {
            title: (
              <Tooltip key={0} title="COLLATERAL" textCentered={true}>
                Total value of locked assets backing your loans in all your
                accounts
              </Tooltip>
            ),
            value: `$${toNoDecimal(totalUserFarmBalance)}`,
          },
          {
            title: (
              <Tooltip key={1} title="LOAN" textCentered={true}>
                Total value of loans in all your accounts
              </Tooltip>
            ),

            value: `$${toNoDecimal(farmTotalLoan)}`,
          },
          {
            title: (
              <Tooltip key={2} title="AVERAGE APY" textCentered={true}>
                Current average yield of the position (Collateral - Loan) in all
                your accounts
              </Tooltip>
            ),
            value: `${toFormattedPercentage(totalApy, 1)}`,
          },
        ]}
        maxItemWidth="160px"
      />
    </Card>
  );
};

export default TopFiguresCard;
