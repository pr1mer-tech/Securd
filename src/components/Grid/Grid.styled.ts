"use client";
import styled from "styled-components";

export const GridWrapper = styled.div<{
  rowItems: number;
  columnGap?: string;
  rowGap?: string;
  margin?: string;
}>`
  width: 100%;
  height: auto;
  display: grid;
  grid-template-columns: repeat(${(props) => props.rowItems}, minmax(0, 1fr));
  grid-column-gap: ${(props) => props.columnGap || "1rem"};
  grid-row-gap: ${(props) => props.rowGap || "1rem"};
  margin: ${(props) => props.margin || "0"};

  @media only screen and (max-width: 1000px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    grid-row-gap: 1rem;
    grid-column-gap: 0;
  }

  @media only screen and (max-width: 1200px) and (min-width: 1000px) {
    grid-template-columns: repeat(
      ${(props) => (props.rowItems > 3 ? 3 : props.rowItems)},
      minmax(0, 1fr)
    );
  }
`;
