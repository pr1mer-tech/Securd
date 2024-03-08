"use client";
import styled from "styled-components";

export const BottomPageContainer = styled.div<{
  mobilePadding?: string;
}>`
  width: 100%;
  height: 100%;
  padding: 2rem 6rem;

  @media only screen and (max-width: 800px) {
    padding: ${(props) => props.mobilePadding || "1rem 2rem"};
  }
`;

export const PoolButtons = styled.div`
  margin: 2rem 0;
  display: flex;
  height: 90px;

  @media only screen and (max-width: 600px) {
    flex-direction: row;
    height: auto;

    & > button {
      flex: 1;
    }
  }
`;

export const TopCardsWrapper = styled.div<{
  margin?: string;
}>`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: ${(props) => props.margin || 0};

  @media only screen and (max-width: 1100px) {
    flex-direction: column;
  }
`;

export const GraphTableWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  & > div {
    flex: 1;
  }

  @media only screen and (max-width: 1300px) {
    flex-direction: column;
    align-items: center;
  }
`;
