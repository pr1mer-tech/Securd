"use client";
import styled from "styled-components";

export const DashboardWrapper = styled.div<{
  breakpoint?: string;
}>`
  display: flex;
  align-items: flex-start;
  justify-content: space-evenly;

  @media only screen and (max-width: ${(props) =>
      props.breakpoint || "800px"}) {
    flex-direction: column;
    align-items: center;
  }
`;

export const StatWrapper = styled.div<{
  breakpoint?: string;
  itemWidth?: string;
}>`
  text-align: center;
  max-width: ${(props) => props.itemWidth || "140px"};
  height: 100%;

  @media only screen and (min-width: ${(props) =>
      props.breakpoint || "1000px"}) {
    max-width: 100px;
  }

  @media only screen and (max-width: ${(props) =>
      props.breakpoint || "800px"}) {
    max-width: 100%;
    text-align: center;
    margin: 1rem 0;
  }
`;

export const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${(props) => props.theme.colors.securdBlack};
  opacity: 0.8;
  display: flex;
  justify-content: center;
`;

export const FigureWrapper = styled.div`
  font-size: 28px;
  margin-top: 0.5rem;
  line-height: 29px;
  font-weight: 700;
`;

export const ConvertedWrapper = styled.div`
  width: 100%;
  text-align: center;
  font-weight: 400;
  font-size: 14px;
  color: ${(props) => props.color || props.theme.colors.securdGrey};
`;
