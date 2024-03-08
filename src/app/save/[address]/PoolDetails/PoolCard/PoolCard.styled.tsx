"use client";
import styled from "styled-components";

export const TopCardsWrapper = styled.div<{
  margin?: string;
}>`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: ${(props) => props.margin || 0};

  & > div:first-child {
    flex: 2;
  }

  & > div:last-child {
    flex: 3;
  }

  @media only screen and (max-width: 1100px) {
    align-items: stretch;
    flex-direction: column;
    gap: 0;

    & > div:first-child {
      flex: none;
    }

    & > div:last-child {
      flex: none;
    }
  }
`;
