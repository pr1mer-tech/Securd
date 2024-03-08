"use client";
import React, { ChangeEvent, FC, useContext } from "react";
import SearchIcon from "@/assets/icons/search-icon-black.svg";
import InputWIcon from "@/components/InputWIcon/InputWIcon";
import Pill from "@/components/Pill/Pill";
import { Row } from "@/app/save/AllAccounts/AllAccounts.styled";
import { SaveContext } from "@/context/Save.context";
import { SortByLabel, Wrapper } from "./Filters.styled";

type FiltersProps = {
  show: boolean;
};

const Filters: FC<FiltersProps> = ({ show }) => {
  const { setSortAccounts, setSearch, sortAccounts } = useContext(SaveContext);

  return (
    <>
      {show && (
        <Wrapper>
          <Row gap="0.5rem" data-test-id="save-pills-wrapper">
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </Wrapper>
      )}
    </>
  );
};

export default Filters;
