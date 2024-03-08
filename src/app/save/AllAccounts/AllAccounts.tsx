"use client";
import React, { useContext, useEffect, useState } from "react";
import { main } from "@/app/styles/theme.styled";
import {
  AllAccountsNumber,
  BottomPageContainer,
  Row,
  TopRow,
} from "./AllAccounts.styled";
import { MainContext } from "@/context/Main.context";
import { SaveContext } from "@/context/Save.context";
import Title from "@/components/Title/Title";
import Button from "@/components/Button/Button";
import ChoiceTab from "@/components/ChoiceTab/ChoiceTab";
import Filters from "@/components/Filters/Filters";
import GridView from "../GridView/GridView";
import { IconPostion, PriorityLevel, ScreenDisplay } from "@/utils/types/enums";
import TableView from "../TableView/TableView";
import MenuIconBlack from "@/assets/icons/menu-icon-black.svg";
import GridIcon from "@/assets/icons/grid-icon-black.svg";
import FilterIconWhite from "@/assets/icons/filter-icon-white.svg";

const AllAccounts = () => {
  const [showAccountsFilter, setShowAccountsFilter] = useState<boolean>(false);
  const [view, setView] = useState<ScreenDisplay>(ScreenDisplay.TABLE);

  const { windowWidth } = useContext(MainContext);
  const { reservesInfo } = useContext(SaveContext);

  useEffect(() => {
    if (windowWidth < 800) {
      setView(ScreenDisplay.GRID);
    } else {
      setView(ScreenDisplay.TABLE);
    }
  }, [windowWidth]);

  useEffect(() => {
    document.title = "Secur•d - Save";
  }, []);

  return (
    <BottomPageContainer>
      <TopRow margin="0.8rem 0" data-test-id="save-choice-tab-wrapper">
        <Row gap="0.2rem">
          <Title label="All Accounts" priority={3} />
          <AllAccountsNumber>
            ({reservesInfo.length === 0 ? "-" : reservesInfo?.length})
          </AllAccountsNumber>
        </Row>
        <ChoiceTab
          icons
          tabs={[MenuIconBlack, GridIcon]}
          active={0}
          activeColor={main.colors.securdWhite}
          backgroundColor={main.colors.securdPrimaryLight}
          onChange={(index) =>
            setView(index === 0 ? ScreenDisplay.TABLE : ScreenDisplay.GRID)
          }
          mobileHide
        />
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
      {view === ScreenDisplay.GRID ? <GridView /> : <TableView />}
    </BottomPageContainer>
  );
};

export default AllAccounts;
