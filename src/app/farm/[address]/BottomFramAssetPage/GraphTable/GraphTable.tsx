import React, { useContext, useMemo } from "react";
import { GraphTableWrapper } from "../BottomFarmAsset.styled";
import { FarmContext } from "@/context/Farm.context";
import GraphSection from "../../GraphSection/GraphSection";

const GraphTable = () => {
  const {
    pool,
    interestLPHistory,
    interestTokenHistory,
    selectedPeriodBorrow,
    selectedPeriodLP,
    setSelectedPeriodBorrow,
    setSelectedPeriodLP,
  } = useContext(FarmContext);

  const interestLeverageLPHistory = useMemo(() => {
    return [];
  }, []);

  return (
    <GraphTableWrapper>
      {pool === 1 ? (
        <>
          <GraphSection
            title="LP APY"
            interestHistory={interestLPHistory}
            selectedPeriod={selectedPeriodLP}
            setSelectedPeriod={setSelectedPeriodLP}
          />
          <GraphSection
            title="Max Farming APY"
            interestHistory={interestLeverageLPHistory}
            selectedPeriod={selectedPeriodLP}
            setSelectedPeriod={setSelectedPeriodLP}
          />
        </>
      ) : (
        <>
          <GraphSection
            title="Borrow APY"
            interestHistory={interestTokenHistory}
            selectedPeriod={selectedPeriodBorrow}
            setSelectedPeriod={setSelectedPeriodBorrow}
          />
        </>
      )}
    </GraphTableWrapper>
  );
};

export default GraphTable;
