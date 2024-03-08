"use client";
import React, { FC, useMemo } from "react";
import { getAverageMinMaxApy } from "@/utils/helpers/lenderPool.helpers";
import { GraphData } from "@/utils/types/save.types";
import Graph from "@/components/Graph/Graph";
import Title from "@/components/Title/Title";
import {
  SavingsStat,
  SavingsStatLabel,
  SavingsStatsWrapper,
  Wrapper,
} from "./GraphSection.styled";
import { toFormattedPercentage } from "@/utils/helpers/numberFormat.helpers";

type GraphSectionProps = {
  title: string;
  interestHistory: GraphData[];
  selectedPeriod: any;
  setSelectedPeriod: Function;
};

const GraphSection: FC<GraphSectionProps> = ({
  title,
  interestHistory,
  selectedPeriod,
  setSelectedPeriod,
}) => {
  const averageMinMaxInterest = useMemo(() => {
    return getAverageMinMaxApy(interestHistory);
  }, [interestHistory]);

  return (
    <Wrapper>
      <Title priority={3} label={title} />
      <div>
        <Graph
          series={interestHistory}
          setSelectedPeriod={setSelectedPeriod}
          selectedPeriod={selectedPeriod}
        />
      </div>
      <SavingsStatsWrapper>
        <div>
          <SavingsStatLabel>Average</SavingsStatLabel>
          <SavingsStat>
            {toFormattedPercentage(averageMinMaxInterest[0], 1)}
          </SavingsStat>
        </div>
        <div>
          <SavingsStatLabel>Max</SavingsStatLabel>
          <SavingsStat>
            {toFormattedPercentage(averageMinMaxInterest[1], 1)}
          </SavingsStat>
        </div>
        <div>
          <SavingsStatLabel>Min</SavingsStatLabel>
          <SavingsStat>
            {toFormattedPercentage(averageMinMaxInterest[2], 1)}
          </SavingsStat>
        </div>
      </SavingsStatsWrapper>
    </Wrapper>
  );
};

export default GraphSection;
