import React, { useContext } from "react";
import { MainContext } from "@/context/Main.context";
import Tooltip from "@/components/Tooltip/Tooltip";
import Table from "@/components/Table/Table";
import FarmTableRows from "./FarmTableRows/FarmTableRows";

const FarmTable = () => {
  const { windowWidth } = useContext(MainContext);

  return (
    <Table
      columns={
        windowWidth > 800
          ? [
              "LP Token",
              <Tooltip key={1} title="Collateral Pool">
                Total Collateral value for all Farmers of this LP Token
              </Tooltip>,
              <Tooltip key={2} title="Min LT">
                Liquidation Threshold that applies when your loans value in both
                assets are equal
              </Tooltip>,
              <Tooltip key={3} title="Max LT">
                Liquidation Threshold that applies when you only borrow one
                asset
              </Tooltip>,
              <Tooltip key={4} title="Max Leverage">
                Maximum position multiplier allowed for this LP Token
              </Tooltip>,
              <Tooltip key={5} title="Borrow APY">
                Current average borrowing rate for this token pair
              </Tooltip>,
              <Tooltip key={6} title="LP APY">
                Estimated yield for this LP Token based on last 7 days trading
                fees
              </Tooltip>,
              <Tooltip key={7} title="Max Farming APY">
                Estimated Farming APY when using Max Leverage
              </Tooltip>,
            ]
          : [
              "LP Token",
              "LQ",
              <Tooltip key={2} title="Min LT">
                Liquidation Threshold that applies when your loans value in both
                assets are equal
              </Tooltip>,
              <Tooltip key={3} title="Max LT">
                Liquidation Threshold that applies when you only borrow one
                asset
              </Tooltip>,
              <Tooltip key={4} title="Borrow APY">
                Current average borrowing rate for this token pair
              </Tooltip>,
            ]
      }
      margin="2rem 0"
    >
      <FarmTableRows />
    </Table>
  );
};

export default FarmTable;
