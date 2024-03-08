"use client";
import React, { useContext, useMemo, useState } from "react";
import { Collapse } from "react-collapse";
import { MainContext } from "@/context/Main.context";
import Title from "@/components/Title/Title";
import Card from "@/components/Card/Card";
import {
  CardHeader,
  HeaderItems,
  PageTopLeft,
  PageTopWrapper,
} from "./PageTop.styled";
import ActionsCard from "./ActionsCard/ActionsCard";
import APYCard from "./APYCard/APYCard";
import PositionCard from "./PositionCard/PositionCard";
import CollateralCard from "./CollateralCard/CollateralCard";
import Tooltip from "@/components/Tooltip/Tooltip";
import {
  securdFormat,
  toFormattedPercentage,
} from "@/utils/helpers/numberFormat.helpers";
import { main } from "@/app/styles/theme.styled";
import useCollateralAmountPrice from "@/utils/hooks/wagmiSH/viewFunctions/farm/useCollateralAmountPrice";
import { FarmContext } from "@/context/Farm.context";
import { bigIntToDecimal } from "@/utils/helpers/main.helpers";
import useBorrowerLt from "@/utils/hooks/wagmiSH/viewFunctions/farm/useBorrowerLt";

const PageTop = () => {
  const { windowWidth } = useContext(MainContext);
  const { selectedCollateralInfo } = useContext(FarmContext);
  const [totalApyLabel, setTotalApyLabel] = useState<number>();
  const [totalPositionLabel, setTotalPositionLabel] = useState<number>();
  const [isOpened, setIsOpened] = useState({
    apy: true,
    position: true,
    collateral: true,
  });

  const { collateralFactor } = useCollateralAmountPrice(
    selectedCollateralInfo?.addressLP
  );

  const borrowerCF = useMemo(() => {
    return bigIntToDecimal(collateralFactor, 18);
  }, [collateralFactor]);

  const { borrowerLT } = useBorrowerLt(selectedCollateralInfo?.addressLP);

  const balanceLTDecimal: number | undefined = useMemo(() => {
    return bigIntToDecimal(borrowerLT, 18);
  }, [borrowerLT]);

  return (
    <PageTopWrapper>
      <PageTopLeft>
        <Card>
          <CardHeader
            onClick={() => setIsOpened({ ...isOpened, apy: !isOpened.apy })}
            collapse={true}
          >
            <Title
              priority={windowWidth < 800 ? 3 : 2}
              label={
                <Tooltip title="Farming APY">
                  Current yield of the position (Collateral - Loan) for this
                  account
                </Tooltip>
              }
              color={main.colors.securdPrimary}
            />
            <HeaderItems>
              <Title
                label={toFormattedPercentage(totalApyLabel, 1)}
                priority={windowWidth < 800 ? 3 : 2}
                color={
                  totalApyLabel === undefined ||
                  isNaN(totalApyLabel) ||
                  totalApyLabel === 0
                    ? main.colors.securdBlack
                    : totalApyLabel > 0
                    ? main.colors.systemGreen
                    : main.colors.systemRed
                }
              />
            </HeaderItems>
          </CardHeader>
          <Collapse isOpened={isOpened.apy}>
            <APYCard setTotalApyLabel={setTotalApyLabel} />
          </Collapse>
        </Card>

        <Card>
          <CardHeader
            onClick={() =>
              setIsOpened({ ...isOpened, position: !isOpened.position })
            }
            collapse={true}
          >
            <Title
              priority={windowWidth < 800 ? 3 : 2}
              label={
                <Tooltip title="Account Balance">
                  Net Farming value (Collateral - Loan) for this account
                </Tooltip>
              }
              color={main.colors.securdPrimary}
            />
            <HeaderItems>
              <Title
                label={"$" + securdFormat(totalPositionLabel, 2)}
                priority={windowWidth < 800 ? 3 : 2}
                color={main.colors.systemGreen}
              />
            </HeaderItems>
          </CardHeader>
          <Collapse isOpened={isOpened.position}>
            <PositionCard setTotalPositionLabel={setTotalPositionLabel} />
          </Collapse>
        </Card>

        {balanceLTDecimal !== undefined && borrowerCF !== undefined && (
          <Card>
            <CardHeader
              onClick={() =>
                setIsOpened({ ...isOpened, collateral: !isOpened.collateral })
              }
              collapse={true}
            >
              <Title
                priority={windowWidth < 800 ? 3 : 2}
                label={
                  <Tooltip title="Collateral Factor">
                    Collateral value divided by Loan value
                  </Tooltip>
                }
                color={main.colors.securdPrimary}
              />
              <HeaderItems>
                <Title
                  label={
                    borrowerCF !== Infinity
                      ? toFormattedPercentage(borrowerCF, 1)
                      : "--"
                  }
                  priority={windowWidth < 800 ? 3 : 2}
                  color={main.colors.securdPrimary}
                />
              </HeaderItems>
            </CardHeader>
            {balanceLTDecimal && borrowerCF !== undefined && (
              <Collapse isOpened={isOpened.collateral}>
                <CollateralCard
                  liquidationThreshold={balanceLTDecimal}
                  collateralFactor={borrowerCF}
                />
              </Collapse>
            )}
          </Card>
        )}
      </PageTopLeft>
      <ActionsCard />
    </PageTopWrapper>
  );
};

export default PageTop;
