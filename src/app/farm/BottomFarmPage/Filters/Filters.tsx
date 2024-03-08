import React, { FC, useContext } from "react";
import { FiltersWrapper, SortByLabel } from "./Filters.styled";
import { Row } from "../BottomFarmPage.styled";
import Pill from "@/components/Pill/Pill";
import { FarmContext } from "@/context/Farm.context";
import InputWIcon from "@/components/InputWIcon/InputWIcon";
import SearchIcon from "../../../../assets/icons/search-icon-black.svg";

type FiltersProps = {
  show: boolean;
};

const Filters: FC<FiltersProps> = ({ show }) => {
  const { setSearch, setSortAccounts, sortAccounts } = useContext(FarmContext);

  return (
    <>
      {show && (
        <FiltersWrapper>
          <Row gap="0.5rem">
            <SortByLabel>Sort By</SortByLabel>
            <Pill
              label="APY"
              selected={sortAccounts.apy}
              onClick={() =>
                setSortAccounts({
                  poolSize: false,
                  apy: !sortAccounts.apy,
                })
              }
            />
            <Pill
              label="Lending Pool"
              selected={sortAccounts.poolSize}
              onClick={() => {
                {
                  setSortAccounts({
                    apy: false,
                    poolSize: !sortAccounts.poolSize,
                  });
                }
              }}
            />
          </Row>
          <InputWIcon
            placeholder="Search"
            icon={SearchIcon}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FiltersWrapper>
      )}
    </>
  );
};

export default Filters;
