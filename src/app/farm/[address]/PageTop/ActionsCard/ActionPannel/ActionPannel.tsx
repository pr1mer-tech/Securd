import { FarmContext } from "@/context/Farm.context";
import { FarmActionMode } from "@/utils/types/enums";
import React, { useContext } from "react";
import CollateralSectionComponent from "../CollateralSectionComponent/CollateralSectionComponent";
import LeverageSectionComponent from "../LeverageSectionComponent/LeverageSectionComponent";
import LoanSectionComponent from "../LoanSectionComponent/LoanSectionComponent";

const ActionPannelRework = () => {
  const { activeAction } = useContext(FarmContext);

  const selecteRightPanel = () => {
    switch (activeAction) {
      case FarmActionMode.LOCK:
        return <CollateralSectionComponent />;
      case FarmActionMode.LEVERAGE:
        return <LeverageSectionComponent />;
      case FarmActionMode.BORROW:
        return <LoanSectionComponent />;
      default:
        return <CollateralSectionComponent />;
    }
  };
  return <div>{selecteRightPanel()}</div>;
};

export default ActionPannelRework;
