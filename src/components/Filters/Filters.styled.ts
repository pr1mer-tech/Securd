"use client";
import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.8rem 0;

  @media only screen and (max-width: 800px) {
    flex-direction: "column";
    align-items: "flex-start";
    gap: "1rem";
  }
`;

export const SortByLabel = styled.div`
  font-weight: 400;
  font-size: 14px;
`;
