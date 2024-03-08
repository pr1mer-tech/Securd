"use client";
import React, { useContext, useMemo } from "react";
import { SaveContext } from "@/context/Save.context";
import Graph from "@/components/Graph/Graph";
import Title from "@/components/Title/Title";
import { getAverageMinMaxApy } from "@/utils/helpers/lenderPool.helpers";
import {
  GraphTableWrapper,
  SavingsStat,
  SavingsStatLabel,
  SavingsStatsWrapper,
  SectionWrapper,
} from "./GraphView.styled";
import { toPercentage } from "@/utils/helpers/numberFormat.helpers";

const GraphView = () => {
  const { interestHistory, setSelectedPeriod, selectedPeriod } =
    useContext(SaveContext);

  const averageMinMaxInterest = useMemo(() => {
    return getAverageMinMaxApy(interestHistory);
  }, [interestHistory]);

  return (
    <GraphTableWrapper>
      <SectionWrapper>
        <Title priority={3} label="Saving APY" />
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
            <SavingsStat>{toPercentage(averageMinMaxInterest[0])}</SavingsStat>
          </div>
          <div>
            <SavingsStatLabel>Max</SavingsStatLabel>
            <SavingsStat>{toPercentage(averageMinMaxInterest[1])}</SavingsStat>
          </div>
          <div>
            <SavingsStatLabel>Min</SavingsStatLabel>
            <SavingsStat>{toPercentage(averageMinMaxInterest[2])}</SavingsStat>
          </div>
        </SavingsStatsWrapper>
      </SectionWrapper>
    </GraphTableWrapper>
  );
};

export default GraphView;
