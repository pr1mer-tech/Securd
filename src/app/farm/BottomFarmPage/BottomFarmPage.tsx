"use client";
import React, { useContext, useState } from "react";
import {
  AllAccountsNumber,
  Row,
  TopRow,
  BottomPageContainer,
} from "./BottomFarmPage.styled";
import { MainContext } from "@/context/Main.context";
import Button from "@/components/Button/Button";
import Title from "@/components/Title/Title";
import { FarmContext } from "@/context/Farm.context";
import { IconPostion, PriorityLevel } from "@/utils/types/enums";
import Filters from "./Filters/Filters";
import FilterIconWhite from "../../../assets/icons/filter-icon-white.svg";
import FarmTable from "./FarmTable/FarmTable";

const BottomFarmPage = () => {
  const [showAccountsFilter, setShowAccountsFilter] = useState<boolean>(false);
  const { windowWidth } = useContext(MainContext);
  const { collateralsInfos } = useContext(FarmContext);

  return (
    <BottomPageContainer>
      <TopRow>
        <Row gap="0.2rem">
          <Title label="All Accounts" priority={3} />
          <AllAccountsNumber>
            ({collateralsInfos?.length || "--"})
          </AllAccountsNumber>
        </Row>
        {windowWidth < 800 && (
          <Button
            priority={PriorityLevel.SECONDARY}
            icon={FilterIconWhite}
            iconPosition={IconPostion.BEFORE}
            onClick={() => setShowAccountsFilter(!showAccountsFilter)}
            padding="0.5rem"
          />
        )}
      </TopRow>
      <Filters show={windowWidth < 800 ? showAccountsFilter : true} />
      <FarmTable />
    </BottomPageContainer>
  );
};

export default BottomFarmPage;
