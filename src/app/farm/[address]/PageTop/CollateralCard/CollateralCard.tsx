"use client";
import React, { FC, useEffect, useMemo, useState } from "react";
import { ProgressBar, Step } from "react-step-progress-bar";
import Tooltip from "@/components/Tooltip/Tooltip";
import {
  ProgressBarWrapper,
  StepMark,
  StepWrapperLT,
  StepWrapperCF,
  StepContent,
} from "./CollateralCard.styled";
import "react-step-progress-bar/styles.css";
import { main } from "@/app/styles/theme.styled";
import { toFormattedPercentage } from "@/utils/helpers/numberFormat.helpers";

type CollateralCardProps = {
  collateralFactor: number;
  liquidationThreshold: number;
};

const CollateralCard: FC<CollateralCardProps> = ({
  collateralFactor,
  liquidationThreshold,
}) => {
  const [ltPosition, setLTPosition] = useState<number>();
  const [cfPosition, setCFPosition] = useState<number>();
  const [max, setMax] = useState<number>(100);

  const riskPosition = useMemo(() => {
    return collateralFactor / liquidationThreshold - 1;
  }, [collateralFactor, liquidationThreshold]);

  const scaling = (position: number) => {
    const skipPart = riskPosition <= 0.15 ? 35 : riskPosition <= 0.25 ? 25 : 0;

    return ((position - skipPart) / (100 - skipPart)) * 100;
  };
  const maxAmount = useMemo(() => {
    const max = Math.ceil(collateralFactor / 100) * 100;
    if (max < 300) {
      return 300;
    } else {
      return max;
    }
  }, [collateralFactor]);

  useEffect(() => {
    setMax(maxAmount);
  }, [maxAmount]);

  useEffect(() => {
    setLTPosition(scaling(((liquidationThreshold * 100) / max) * 100));
    setCFPosition(scaling(((collateralFactor * 100) / max) * 100));
  }, [max, collateralFactor, liquidationThreshold]);

  return (
    <>
      {collateralFactor < max && (
        <ProgressBarWrapper>
          <ProgressBar
            percent={cfPosition || 0}
            filledBackground={
              riskPosition >= 0.25
                ? main.colors.systemGreen
                : riskPosition >= 0.1
                ? main.colors.systemYellow
                : main.colors.systemRed
            }
            stepPositions={[ltPosition || 0, cfPosition || 0]}
          >
            <Step transition="scale">
              {() => (
                <StepWrapperLT>
                  <StepMark />
                  <StepContent>
                    <Tooltip title="LT">
                      Liquidation Threshold ie Minimum Collateral Factor before
                      your collateral is liquidated
                    </Tooltip>
                    <span>
                      {toFormattedPercentage(liquidationThreshold, 1)}
                    </span>
                  </StepContent>
                </StepWrapperLT>
              )}
            </Step>
            <Step transition="scale">
              {() => (
                <StepWrapperCF>
                  <StepContent>
                    <Tooltip title="CF">
                      Collateral Factor ie Collateral value divided by Loan
                      value
                    </Tooltip>
                    <div>{toFormattedPercentage(collateralFactor, 1)}</div>
                  </StepContent>
                  <StepMark />
                </StepWrapperCF>
              )}
            </Step>
          </ProgressBar>
        </ProgressBarWrapper>
      )}
    </>
  );
};

export default CollateralCard;
